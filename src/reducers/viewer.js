import Immutable from "immutable";
import C from "./constants";

const viewerState = Immutable.Map({
  ngState: {}
});

export default function viewerReducer(state = viewerState, action) {
  switch (action.type) {
    case C.VIEWER_RESET: {
      return viewerState;
    }
    case C.INIT_VIEWER: {
      return state.set('ngState', action.payload);
    }
    case C.SET_VIEWER_GRAYSCALE_SOURCE: {
      // TODO: Rebuild the display state JSON passed to Neuroglancer.
      console.log('* viewerReducer should be updating grayscale source *')
      return state;
    }
    case C.SET_VIEWER_SEGMENTATION_SOURCE: {
      // TODO: Rebuild the display state JSON passed to Neuroglancer.
      console.log('* viewerReducer should be updating segmentation source *')
      return state;
    }
   case C.SET_VIEWER_NAVIGATION_POSE: {
      // TODO: Rebuild the display state JSON passed to Neuroglancer.
      console.log('* viewerReducer should be updating viewer navigation pose *')
      return state;
    }
    case C.SET_VIEWER_SEGMENTS: {
       // TODO: Rebuild the display state JSON passed to Neuroglancer.
       console.log('* viewerReducer should be updating segments *')
      return state;
    }
    case C.SET_VIEWER_SEGMENT_COLORS: {
      // TODO: Rebuild the display state JSON passed to Neuroglancer.
      console.log('* viewerReducer should be updating segment colors *')
      return state;
    }
    default: {
      return state;
    }
  }
}
