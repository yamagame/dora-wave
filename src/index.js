import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware, } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {
  createSocket,
  setParams,
  loadAccessToken,
} from './reducers';

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
    threshold: 2000,
    level: 100,
  },
}, applyMiddleware(thunk))

store.dispatch(loadAccessToken(() => {
  const socket = createSocket();
  const {
    user_id,
    signature,
  } = store.getState().app;

  socket.on('connect', () => {
    socket.emit('startStreamData', {
      role: 'waveAnalyzer',
      user_id,
      signature,
    });
  })

  socket.on('speech-data', (data) => {
    console.log(JSON.stringify(data, null, '  '));
  })

  socket.on('wave-data', (data) => {
    store.dispatch(waveData(data.wave));
    store.dispatch(setParams({
      state: data.state,
      threshold: data.threshold,
      level: data.level,
    }));
  })
}));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
