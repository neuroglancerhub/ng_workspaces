import C from '../reducers/constants';

export function initViewer(payload) {
  return {
    type: C.INIT_VIEWER,
    payload,
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
