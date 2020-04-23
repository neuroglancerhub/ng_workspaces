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

export function setViewerNavigationPose(payload) {
  return {
    type: C.SET_VIEWER_NAVIGATION_POSE,
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
