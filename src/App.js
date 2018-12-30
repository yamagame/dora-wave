import React, { Component } from 'react';
import { connect } from 'react-redux'
import logo from './logo.svg';
import './App.css';
import WaveChart from './components/WaveChart';
import {
  createSocket,
} from './reducers';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      threshold: 2000,
      level: 100,
    }
  }

  onResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.level != nextProps.level) {
      this.setState({
        level: nextProps.level,
      })
    }
    if (this.props.threshold != nextProps.threshold) {
      this.setState({
        threshold: nextProps.threshold,
      })
    }
  }

  render() {
    const { width, height } = this.state;
    return (
      <div className="App">
        <p>{ this.props.state }</p>
        <div
          className="App"
          style={{
            width: width-20,
            height: height-80,
            margin: 10,
          }}
        >
          <WaveChart style={{
            width: width-1-20,
            height: height-4-80,
            border: 'solid 1px lightgray',
          }}
          level={this.state.level}
          threshold={this.state.threshold}
          avg={this.props.avg}
          data={this.props.wave}
          maxDataLength={this.props.waveFreq*this.props.waveRange}
          waveSkip={this.props.waveSkip}
          onChange={(params) => {
            const state = {
              role: 'waveAnalyzer',
              user_id: this.props.user_id,
              signature: this.props.signature,
            };
            state[params.name] = params.value;
            this.setState(state);
            createSocket().emit('speech-config', state);
          }}
          />
        </div>
      </div>
    );
  }
}

const props = state => {
  return ({
    state: state.app.state,
    avg: state.app.avg,
    wave: state.app.wave,
    user_id: state.app.user_id,
    signature: state.app.signature,
    threshold: parseInt(state.app.threshold),
    level: parseInt(state.app.level*100),
    waveRange: state.app.waveRange,
    waveSkip: state.app.waveSkip,
    waveFreq: state.app.waveFreq,
  })
}

export default connect(props)(App);
