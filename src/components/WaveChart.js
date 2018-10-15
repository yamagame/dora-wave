import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

function LIMIT(v, min, max) {
  if (v < min) v = min;
  if (v > max) v = max;
  return v;
}

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.thresholdValue = props.threshold;
    this.levelValue = props.level*32768/100;
    this.propValue = {
      thresholdValue: {
        name: 'threshold',
        x: 0,
        y: 0,
        text: 0,
        value: 0,
        setValue: function(v) {
          this.y = v;
          this.value = v;
          this.text = `silence-threshold: ${v}`;
        },
      },
      levelValue: {
        name: 'level',
        x: 0,
        y: 0,
        text: 0,
        value: 0,
        setValue: function(v) {
          this.y = v;
          this.value = parseInt(v*100/32768);
          this.text = `level: ${this.value}%`;
        },
      },
    }
    this.propValue.thresholdValue.setValue(this.thresholdValue);
    this.propValue.levelValue.setValue(this.levelValue);

    this.state = {};
  }

  componentWillMount() {
  }

  componentDidMount() {
    const self = this;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const svg = d3.select(this.svg);
    this.xScale = d3.scaleLinear()
      .domain([0, this.props.maxDataLength])
      .range([0, width]);
    this.yScale = d3.scaleLinear()
      .domain([32768, -32768])
      .range([0, height]);
    this.line = d3.line()
        .x(d => this.xScale(d.x))
        .y(d => this.yScale(d.y))
    
    function drag(key) {
      return d3.drag()
        .on('start', function(d, i) {
          let oy = self.yScale(self[key]);
          const dragged = (d) => {
            oy += d3.event.dy;
            self[key] = LIMIT(self.yScale.invert(oy), 0, 32768);
            self.propValue[key].setValue(parseInt(self[key]));
            d3.select(self.chart)
              .selectAll(`path.${key}`)
              .datum(self[`${key}Data`]())
              .attr('d', self.line)
            d3.select(self.chart)
              .selectAll(`path.${key}Rect`)
              .datum(self[`${key}Data`]())
              .attr('d', self.drawRect)
            d3.select(self.chart)
              .selectAll(`text`)
              .attr('x', d => self.xScale(d.x)+10)
              .attr('y', d => self.yScale(d.y)+20)
              .text(d => d.text)
          }
          const ended = (d) => {
            self.props.onChange({
              name: self.propValue[key].name,
              value: self.propValue[key].value,
            })
          }
          d3.event.on("drag", dragged).on("end", ended);
        })
    }

    this.dragThresholdLine = drag('thresholdValue');
    this.dragRangeLine = drag('levelValue');

    this.updateGraph();
  }

  componentDidUpdate() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.xScale
      .domain([0, this.props.maxDataLength])
      .range([0, width]);
    this.yScale
      .domain([32768, -32768])
      .range([0, height]);
    this.updateGraph();
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.threshold != nextProps.threshold) {
      this.thresholdValue = nextProps.threshold;
      this.propValue.thresholdValue.setValue(this.thresholdValue);
      this.updateGraph();
    }
    if (this.props.level != nextProps.level) {
      this.levelValue = parseInt(nextProps.level*32768/100);
      this.propValue.levelValue.setValue(this.levelValue);
      this.updateGraph();
    }
  }

  thresholdValueData = () => {
    return [
      { x:0, y:this.thresholdValue, }, 
      { x:this.props.maxDataLength, y:this.thresholdValue, },
    ]
  }

  levelValueData = () => {
    return [
      { x:0, y:this.levelValue, }, 
      { x:this.props.maxDataLength, y:this.levelValue, },
    ]
  }

  drawRect = (d) => {
    function rect(x1, y1, x2, y2) {
      return `M ${x1},${y1} L ${x2},${y1} L ${x2},${y2} L ${x1},${y2} z`;
    }
    return rect(
      this.xScale(d[0].x),this.yScale(d[0].y)-5,
      this.xScale(d[1].x),this.yScale(d[0].y)+5);
  }

  updateGraph = () => {
    const chart = d3.select(this.chart);
    chart
      .selectAll('path')
      .remove();
    chart
      .selectAll('text')
      .remove();
    chart
      .append('path')
      .datum([{ x:0, y:0, }, { x:this.props.maxDataLength, y:0, }])
      .classed('center', true)
      .style("pointer-events", "none")
      .attr('stroke', 'lightgray')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr("d", this.line);
    chart
      .append('path')
      .datum(this.props.data.map( (v, i) => ({ x: i*this.props.waveSkip, y: v.y, }) ))
      .classed('wave', true)
      .style("pointer-events", "none")
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr("d", this.line);
    chart
      .append('path')
      .datum(this.thresholdValueData())
      .classed('thresholdValue', true)
      .attr('stroke', 'rgba(0,255,0,0.5)')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr("d", this.line)
    chart
      .append('path')
      .datum(this.thresholdValueData())
      .classed('thresholdValueRect', true)
      .attr('fill', 'rgba(0,0,0,0)')
      .attr("d", this.drawRect)
      .style('cursor', 'ns-resize')
      .call(this.dragThresholdLine);
    chart
      .append('path')
      .datum(this.levelValueData())
      .classed('levelValue', true)
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr("d", this.line);
    chart
      .append('path')
      .datum(this.levelValueData())
      .classed('levelValueRect', true)
      .attr('fill', 'rgba(0,0,0,0)')
      .attr("d", this.drawRect)
      .style('cursor', 'ns-resize')
      .call(this.dragRangeLine);
    chart
      .selectAll('text')
      .data(Object.keys(this.propValue).map( k => this.propValue[k] ))
      .enter()
      .append('text')
      .attr('x', d => this.xScale(d.x)+10)
      .attr('y', d => this.yScale(d.y)+20)
      .text(d => d.text)
      .attr("text-anchor", "left")
      .attr("vertical-align", "left")
      .attr("font-size", function(d) {return "14px";})
      .attr("fill", "black")
      .style('pointer-events', 'none')
  }

  render() {
    return (
      <div
        ref={n => this.container = n}
      >
        <svg
          ref={n => this.svg = n}
          style={{
            ...this.props.style,
          }}
          tabIndex={0}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          onKeyPress={this.onKeyPress}
          onKeyUp={this.onKeyUp}
          onMouseMove={this.onMouseMove}
          onMouseOut={this.onMouseOut}
          onMouseOver={this.onMouseOver}
          onMouseUp={this.onMouseUp}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <g
            ref={n => this.base = n}
          >
            <rect
              x={0}
              y={0}
              width={"100%"}
              height={"100%"}
              style={{ fill: "rgba(220,220,220,0.4)" }}
            />
            <g
              ref={n => this.chart = n}
            >
            </g>
          </g>
        </svg>
      </div>
    )
  }
}
