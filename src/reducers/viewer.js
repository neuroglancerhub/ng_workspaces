import Immutable from "immutable";
import C from "./constants";

const viewerState = Immutable.Map({
  ngState: {}
});

export default function userReducer(state = viewerState, action) {
  switch (action.type) {
    case C.VIEWER_RESET: {
      return viewerState;
    }
    case C.INIT_VIEWER: {
      return state.set('ngState', action.payload);
    }
    default: {
      return state;
    }
  }
}
