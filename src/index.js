import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware, } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import io from 'socket.io-client'
const socket = io();

const waveRange = 9;
const waveSkip = 240;
const waveFreq = 16000;

const waveData = (data) => async (dispatch, getState) => {
  const wave = getState().app.wave;
  const w = wave.concat(data);
  dispatch({
    type: 'app',
    payload: {
      wave: w.slice(-waveRange*waveFreq/waveSkip),
    },
  })
}

const setParam = (payload) => async (dispatch, getState) => {
  dispatch({
    type: 'app',
    payload: {
      ...payload,
    },
  })
}

socket.on('connect', () => {
  socket.emit('request', { waveSkip });
})

socket.on('data', (data) => {
  store.dispatch(waveData(data.wave));
  store.dispatch(setParam({
    state: data.state,
    threshold: data.threshold,
    level: data.level,
  }));
})

const store = createStore(combineReducers({
  app: (state = {}, action) => {
    return {
      ...state,
      ...action.payload,
    }
  },
}), {
  app: {
    wave: [],
    state: 'idle',
    waveRange,
    waveSkip,
    waveFreq,
  },
}, applyMiddleware(thunk))

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
