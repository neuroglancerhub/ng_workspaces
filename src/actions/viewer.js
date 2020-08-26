import C from '../reducers/constants';

export function initViewer(payload) {
  return {
    type: C.INIT_VIEWER,
    payload,
  };
}

// Necessary only for a UI change that does not correspond to a state change.
// Prevents the loss of any recent viewer changes at the Neuroglancer level.
export function syncViewer() {
  return {
    type: C.SYNC_VIEWER,
  };
}

export function setViewerGrayscaleSource(payload) {
  return {
    type: C.SET_VIEWER_GRAYSCALE_SOURCE,
    payload,
  };
}

export function setViewerSegmentationSource(payload) {
  return {
    type: C.SET_VIEWER_SEGMENTATION_SOURCE,
    payload,
  };
}

export function setViewerSegmentationLayerName(payload) {
  return {
    type: C.SET_VIEWER_SEGMENTATION_LAYER_NAME,
    payload,
  };
}

export function setViewerTodosSource(payload) {
  return {
    type: C.SET_VIEWER_TODOS_SOURCE,
    payload,
  };
}

export function setViewerTodosType(payload) {
  return {
    type: C.SET_VIEWER_TODOS_TYPE,
    payload,
  };
}

export function setViewerTodosHint(payload) {
  return {
    type: C.SET_VIEWER_TODOS_HINT,
    payload,
  };
}

export function setViewerCrossSectionScale(payload) {
  return {
    type: C.SET_VIEWER_CROSS_SECTION_SCALE,
    payload,
  };
}

export function setViewerCameraPosition(payload) {
  return {
    type: C.SET_VIEWER_CAMERA_POSITION,
    payload,
  };
}

export function setViewerCameraProjectionScale(payload) {
  return {
    type: C.SET_VIEWER_CAMERA_PROJECTION_SCALE,
    payload,
  };
}

export function setViewerCameraProjectionOrientation(payload) {
  return {
    type: C.SET_VIEWER_CAMERA_PROJECTION_ORIENTATION,
    payload,
  };
}

export function setViewerSegments(payload) {
  return {
    type: C.SET_VIEWER_SEGMENTS,
    payload,
  };
}

export function setViewerSegmentColors(payload) {
  return {
    type: C.SET_VIEWER_SEGMENT_COLORS,
    payload,
  };
}

export function addViewerLayer(payload) {
  return {
    type: C.ADD_VIEWER_LAYER,
    payload,
  };
}
