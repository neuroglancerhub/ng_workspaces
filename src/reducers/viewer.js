import Immutable from "immutable";
import C from "./constants";

const viewerState = Immutable.Map({});

export default function userReducer(state = viewerState, action) {
  switch (action.type) {
    case C.VIEWER_RESET: {
      return viewerState;
    }
    default: {
      return state;
    }
  }
}
