import C from '../reducers/constants';

export function initViewer(payload) {
  return {
    type: C.INIT_VIEWER,
    payload
  };
}
