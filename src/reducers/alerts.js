import Immutable from 'immutable';
import C from './constants';

const alertState = Immutable.List([]);

export default function userReducer(state = alertState, action) {
  switch (action.type) {
    case C.ALERT_ADD: {
      return state.push({
        message: action.message,
        severity: action.severity,
        duration: action.duration,
      });
    }
    case C.ALERT_DELETE: {
      return state.filterNot((x) => x === action.message);
    }
    default: {
      return state;
    }
  }
}
