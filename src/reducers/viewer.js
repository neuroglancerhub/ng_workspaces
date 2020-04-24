import Immutable from 'immutable';
import C from './constants';

const viewerState = Immutable.Map({
  ngState: {
    layers: {
      grayscale: {
        type: 'image',
        source: '',
      },
      segmentation: {
        type: 'segmentation',
        source: '',
        segments: [0],
      },
    },
    perspectiveZoom: 20,
    navigation: {
      zoomFactor: 8,
      pose: {
        position: {
          voxelSize: [8, 8, 8],
          voxelCoordinates: [7338.26953125, 7072, 4246.69140625],
        },
      },
    },
    showSlices: false,
    layout: '4panel', // 'xz-3d',
  },
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
      return (state.setIn(['ngState', 'layers', 'grayscale', 'source'], action.payload));
    }
    case C.SET_VIEWER_SEGMENTATION_SOURCE: {
      return (state.setIn(['ngState', 'layers', 'segmentation', 'source'], action.payload));
    }
    case C.SET_VIEWER_NAVIGATION_POSE: {
      return (state.setIn(['ngState', 'navigation', 'pose'], action.payload));
    }
    case C.SET_VIEWER_SEGMENTS: {
      return (state.setIn(['ngState', 'layers', 'segmentation', 'segments'], action.payload));
    }
    case C.SET_VIEWER_SEGMENT_COLORS: {
      // TODO: Rebuild the display state JSON passed to Neuroglancer.
      console.log('* viewerReducer should be updating segment colors *');
      return state;
    }
    default: {
      return state;
    }
  }
}
