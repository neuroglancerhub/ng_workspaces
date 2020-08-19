import Immutable from 'immutable';
import C from './constants';

const clioState = Immutable.Map({
  projectUrl: null,
});

export default function userReducer(state = clioState, action) {
  switch (action.type) {
    case C.CLIO_SET_TOP_LEVEL_FUNC: {
      return state.set('projectUrl', action.url);
    }
    default: {
      return state;
    }
  }
}
