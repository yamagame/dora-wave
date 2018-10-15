import io from 'socket.io-client'
import 'whatwg-fetch'

let socket = null;

export const createSocket = () => {
  if (socket === null) socket = io('/audio');
  return socket;
}

export const setParams = (payload) => async (dispatch, getState) => {
  dispatch({
    type: 'app',
    payload: {
      ...payload,
    },
  })
}

export const loadAccessToken = (callback) => async (dispatch, getState) => {
  try {
    let response = await fetch('/access-token', {
      method: 'POST',
    });
    if (response.ok) {
      let data = await response.json();
      const signature = data.signature;
      const user_id = data.user_id;
      dispatch({
        type: 'app',
        payload: {
          user_id,
          signature,
        },
      });
    }
    if (callback) callback();
  } catch(err) {
    console.log(err);
  }
}
