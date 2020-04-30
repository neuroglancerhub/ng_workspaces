import Immutable from 'immutable';
import { getNeuroglancerViewerState } from '@janelia-flyem/react-neuroglancer';

import C from './constants';

const viewerState = Immutable.Map({
  ngState: {
    // The "legacy" form of Neuroglancer view state 'layers' as a map, with layer names as keys.
    // But when Neuroglancer returns its current state, it returns 'layers' as an array.
    layers: [
      {
        name: 'grayscale',
        type: 'image',
        source: '',
      },
      {
        name: 'segmentation',
        type: 'segmentation',
        source: '',
        segments: [0],
        segmentColors: {},
      },
    ],
    position: [7560, 6735, 4505],
    projectionScale: 2600,
    showSlices: false,
    layout: '4panel', // 'xz-3d',
  },
});

let syncStateNeeded = false;

export const setSyncStateNeeded = (needed) => {
  syncStateNeeded = needed;
};

const syncedState = (state) => {
  if (syncStateNeeded) {
    const ngState = getNeuroglancerViewerState();
    syncStateNeeded = false;
    return state.set('ngState', ngState);
  }
  return state;
};

const setInLayerArray = (state, layerName, propName, propValue) => {
  const layers = state.getIn(['ngState', 'layers']);
  const i = layers.findIndex((value) => (value.name === layerName));
  return state.setIn(['ngState', 'layers', i, propName], propValue);
};

export default function viewerReducer(state = viewerState, action) {
  switch (action.type) {
    case C.VIEWER_RESET: {
      return viewerState;
    }
    case C.INIT_VIEWER: {
      return state.set('ngState', action.payload);
    }
    case C.SET_VIEWER_GRAYSCALE_SOURCE: {
      return setInLayerArray(syncedState(state), 'grayscale', 'source', action.payload);
    }
    case C.SET_VIEWER_SEGMENTATION_SOURCE: {
      return setInLayerArray(syncedState(state), 'segmentation', 'source', action.payload);
    }
    case C.SET_VIEWER_SEGMENTS: {
      return setInLayerArray(syncedState(state), 'segmentation', 'segments', action.payload);
    }
    case C.SET_VIEWER_SEGMENT_COLORS: {
      return setInLayerArray(syncedState(state), 'segmentation', 'segmentColors', action.payload);
    }
    case C.SET_VIEWER_CAMERA_POSITION: {
      return (syncedState(state).setIn(['ngState', 'position'], action.payload));
    }
    case C.SET_VIEWER_CAMERA_PROJECTION_SCALE: {
      return (syncedState(state).setIn(['ngState', 'projectionScale'], action.payload));
    }
    case C.SET_VIEWER_CAMERA_PROJECTION_ORIENTATION: {
      return (syncedState(state).setIn(['ngState', 'projectionOrientation'], action.payload));
    }
    default: {
      return state;
    }
  }
}
