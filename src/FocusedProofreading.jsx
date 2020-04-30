import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { vec2 } from 'gl-matrix';

import { AssignmentManager, AssignmentManagerDialog } from './AssignmentManager';
import { DvidManager, DvidManagerDialog } from './DvidManager';
import './FocusedProofreading.css';

const styles = {
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
  textField: {
    width: '50%',
  },
  inputForm: {
    margin: '1em',
  },
};

//

// TODO: Make a general mechanism for user-modifiable key bindings.
const keyBindings = {
  protocolNextTask: 'e',
  protocolPrevTask: 'q',
  protocolCompletedAndNextTask1: 'E',
  protocolCompletedAndNextTask2: 'X',
  focusedProofreadingCycleResults: 'v',
  focusedProofreadingToggleBirdsEyeView: 'g', // TODO 'b',
};

//
// Constants

const RESULTS = Object.freeze({
  DONT_MERGE: 'dontMerge',
  MERGE: 'merge',
  DONT_KNOW: 'dontKnow',
});

const RESULT_LABELS = Object.freeze({
  DONT_MERGE: "Don't Merge",
  MERGE: 'Merge',
  DONT_KNOW: "Don't Know",
});

const RESULT_CYCLES_NEXT = Object.freeze({
  [RESULTS.DONT_MERGE]: RESULTS.MERGE,
  [RESULTS.MERGE]: RESULTS.DONT_KNOW,
  [RESULTS.DONT_KNOW]: RESULTS.DONT_MERGE,
});

// Green
const COLOR_PRIMARY_BODY = '#348E53';
// Mustard yellow
const COLOR_OTHER_BODY = '#908827';

//
// Functions that can be factored out of the React component (because they don't use hooks)

const bodyPoints = (taskJson) => (
  [taskJson['body point 1'], taskJson['body point 2']]
);

const taskDocString = (taskJson) => {
  if (taskJson) {
    // TODO: Add a task counter.
    const i = 1;
    return (`${'\xa0'}Task ${i}: [${taskJson['body point 1']}] + [${taskJson['body point 2']}]`);
  }
  return ('');
};

const bodyColors = (bodyIds, result) => {
  if (result === RESULTS.MERGE) {
    return ({
      [bodyIds[0]]: COLOR_PRIMARY_BODY,
      [bodyIds[1]]: COLOR_PRIMARY_BODY,
    });
  }
  return ({
    [bodyIds[0]]: COLOR_PRIMARY_BODY,
    [bodyIds[1]]: COLOR_OTHER_BODY,
  });
};

const cameraPose = (bodyPts) => {
  const position = [
    (bodyPts[0][0] + bodyPts[1][0]) / 2,
    (bodyPts[0][1] + bodyPts[1][1]) / 2,
    (bodyPts[0][2] + bodyPts[1][2]) / 2,
  ];

  // The vector between the points, projected onto the X-Z plane (since Y is up)...
  const betweenPts = vec2.fromValues(bodyPts[0][0] - bodyPts[1][0], bodyPts[0][2] - bodyPts[1][2]);
  // ...should be perpendicular to the camera direction vector.
  const cameraDir = vec2.create();
  vec2.rotate(cameraDir, betweenPts, vec2.fromValues(0, 0), Math.PI / 2);
  // So the camera rotation angle is the angle between that camera direction vector and
  // the X axis.
  const angle = vec2.angle(cameraDir, vec2.fromValues(0, 1));
  // Convert that angle and the rotation axis (the Y axis) into a quaternion.
  const c = Math.cos(angle / 2);
  const s = Math.sin(angle / 2);
  const projectionOrientation = [0, s, 0, c];

  return ({ position, projectionOrientation });
};

const cameraProjectionScale = (bodyIds, dvidMngr, onCompletion) => {
  dvidMngr.sparseVolSize(bodyIds[0], (data0) => {
    dvidMngr.sparseVolSize(bodyIds[1], (data1) => {
      // A first heuristic for the projection scale is the half the largest dimension
      // of the smaller body's bounding box.
      const minA = (data0.voxels < data1.voxels) ? data0.minvoxel : data1.minvoxel;
      const maxA = (data0.voxels < data1.voxels) ? data0.maxvoxel : data1.maxvoxel;
      const dimsA = [maxA[0] - minA[0], maxA[1] - minA[1], maxA[2] - minA[2]];
      const scale = Math.max(dimsA[0], dimsA[1], dimsA[2]) / 2;

      // For the bird's eye view scale, use the largest dimension of the bounding box
      // for both bodies.
      const minB = [
        Math.min(data0.minvoxel[0], data1.minvoxel[0]),
        Math.min(data0.minvoxel[1], data1.minvoxel[1]),
        Math.min(data0.minvoxel[2], data1.minvoxel[2]),
      ];
      const maxB = [
        Math.min(data0.maxvoxel[0], data1.maxvoxel[0]),
        Math.min(data0.maxvoxel[1], data1.maxvoxel[1]),
        Math.min(data0.maxvoxel[2], data1.maxvoxel[2]),
      ];
      const dimsB = [maxB[0] - minB[0], maxB[1] - minB[1], maxB[2] - minB[2]];
      const scaleBirdsEye = Math.max(dimsB[0], dimsB[1], dimsB[2]);

      onCompletion(scale, scaleBirdsEye);
    });
  });
};

// eslint-disable-next-line no-unused-vars
const storeResults = (taskJson, result, dvidMngr) => {
  // TODO: Add actual storing of `result` using `dvidMngr`.
  console.log(`* storing result '${result}' for '${JSON.stringify(taskJson)}' *`);
};

// Returns [result, completed]
// eslint-disable-next-line no-unused-vars
const restoreResults = (taskJson, dvidMngr) => {
  // TODO: Add actual restoring of the result for `taskJson` using `dvidMngr`.
  const result = [RESULTS.DONT_MERGE, false];
  return (result);
};

//
// The React component for focused proofreading.  Per the latest suggestions,
// it is a functional component using hooks to manage state and side effects.
// State shared with other components in the application is managed using
// Redux, accessed with the functions in the `actions` prop.

function FocusedProofreading(props) {
  const { actions, children } = props;

  const [assnMngr] = React.useState(new AssignmentManager());
  const [assnMngrLoading, setAssnMngrLoading] = React.useState(false);

  const [dvidMngr] = React.useState(new DvidManager());

  const [taskJson, setTaskJson] = React.useState(undefined);
  const [bodyIds, setBodyIds] = React.useState([]);
  const [result, setResult] = React.useState(RESULTS.DONT_MERGE);
  const [completed, setCompleted] = React.useState(false);
  const [normalScale, setNormalScale] = React.useState(100);
  const [birdsEyeScale, setBirdsEyeScale] = React.useState(100);
  const [usingBirdsEye, setUsingBirdsEye] = React.useState(false);

  React.useEffect(() => {
    const onDvidInitialized = () => {
      actions.setViewerGrayscaleSource(dvidMngr.grayscaleSourceURL());
      actions.setViewerSegmentationSource(dvidMngr.segmentationSourceURL());
    };
    dvidMngr.init(onDvidInitialized);
  }, [actions, dvidMngr]);

  const setupTask = React.useCallback(() => {
    const json = assnMngr.taskJson();
    const [restoredResult, restoredCompleted] = restoreResults(json, dvidMngr);
    const bodyPts = bodyPoints(json);
    const segments = dvidMngr.bodyIds(bodyPts);
    const { position, projectionOrientation } = cameraPose(bodyPts);
    cameraProjectionScale(segments, dvidMngr, (scale, scaleBirdsEye) => {
      setTaskJson(json);
      setResult(restoredResult);
      setCompleted(restoredCompleted);
      setBodyIds(segments);
      setNormalScale(scale);
      setBirdsEyeScale(scaleBirdsEye);

      actions.setViewerSegments(segments);
      actions.setViewerSegmentColors(bodyColors(segments, result));
      actions.setViewerCameraPosition(position);
      actions.setViewerCameraProjectionOrientation(projectionOrientation);

      // TODO: Neuroglancer does something to the 'projectionScale' value,
      // which seems end up being this emprically determined conversion factor.
      // Replace it with a more principled solution.
      const conversion = 125000000;
      actions.setViewerCameraProjectionScale(scale / conversion);
    });
  }, [actions, assnMngr, dvidMngr, result]);

  const noTask = (taskJson === undefined);

  React.useEffect(() => {
    assnMngr.init(setupTask);
  }, [assnMngr, setupTask]);

  const handleLoadButton = () => {
    setAssnMngrLoading(true);
    const onLoadingDone = () => setAssnMngrLoading(false);
    assnMngr.load(onLoadingDone);
  };

  const resetForNewTask = () => {
    setUsingBirdsEye(false);
    actions.setViewerCameraProjectionScale(normalScale);
  };

  const handleNextButton = () => {
    assnMngr.next();
    resetForNewTask();
  };

  const handlePrevButton = () => {
    assnMngr.prev();
    resetForNewTask();
  };

  const handleResultChange = (newResult) => {
    actions.setViewerSegmentColors(bodyColors(bodyIds, newResult));
  };

  const handleResultRadio = (event) => {
    setResult(event.target.value);
    handleResultChange(event.target.value);
  };

  const handleCompletedCheckbox = (event) => {
    setCompleted(event.target.checked);
    if (event.target.checked) {
      storeResults(taskJson, result, dvidMngr);
    }
  };

  const handleKeyPress = (event) => {
    if (!noTask) {
      if (event.key === keyBindings.protocolNextTask) {
        handleNextButton();
      } else if (event.key === keyBindings.protocolPrevTask) {
        handlePrevButton();
      } else if (event.key === keyBindings.focusedProofreadingCycleResults) {
        const newResult = RESULT_CYCLES_NEXT[result];
        setResult(newResult);
        handleResultChange(newResult);
      } else if (event.key === keyBindings.focusedProofreadingToggleBirdsEyeView) {
        // TODO: If !usingBirdsEye, save the current scale as normalScale, probably
        // by calling getNeuroglancerViewerState().
        setUsingBirdsEye(!usingBirdsEye);
        const scale = !usingBirdsEye ? birdsEyeScale : normalScale;
        actions.setViewerCameraProjectionScale(scale);
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onMeshLoaded = (id, layer, mesh) => {
    // TODO: If `id` is one of the task's bodies, use the vertices of `mesh` to compute
    // the bird's eye view camera scale.
    const normal = 1000;
    const birdsEye = normal;
    setNormalScale(normal);
    setBirdsEyeScale(birdsEye);
  };

  // Add `onMeshLoaded` to the props of the child, which is a react-neuroglancer viewer.
  // TODO: Add support for `onMeshLoaded` to `react-neurogloancer`.
  const childrenWithCallback = React.Children.map(children, (child) => (
    React.cloneElement(child, { onMeshLoaded }, null)
  ));

  // TODO: Use a style that changes the 'secondary' color (used by default on `Radio` and
  // `Checkbox` controls) so it is not red, to avoid red-green colorblindness issues.
  return (
    <div
      className="focused-proofreading-container"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className="focused-proofreading-controls">
        <div className="focused-proofreading-control-row">
          <ButtonGroup variant="contained" color="primary">
            <Button color="primary" variant="contained" onClick={handleLoadButton}>
              Load
            </Button>
            <Button color="primary" variant="contained" onClick={handleNextButton} disabled={noTask}>
              Next
            </Button>
            <Button color="primary" variant="contained" onClick={handlePrevButton} disabled={noTask}>
              Prev
            </Button>
          </ButtonGroup>
          <Typography color="inherit">
            {taskDocString(taskJson)}
          </Typography>
        </div>
        <FormControl component="fieldset" disabled={noTask}>
          <RadioGroup row name="proofReadingResults" value={result} onChange={handleResultRadio}>
            <FormControlLabel
              label={RESULT_LABELS.DONT_MERGE}
              control={<Radio />}
              value={RESULTS.DONT_MERGE}
            />
            <FormControlLabel
              label={RESULT_LABELS.MERGE}
              control={<Radio />}
              value={RESULTS.MERGE}
            />
            <FormControlLabel
              label={RESULT_LABELS.DONT_KNOW}
              control={<Radio />}
              value={RESULTS.DONT_KNOW}
            />
            <FormControlLabel
              label="Completed"
              control={<Checkbox checked={completed} onChange={handleCompletedCheckbox} name="completed" />}
            />
          </RadioGroup>
        </FormControl>
        <AssignmentManagerDialog manager={assnMngr} open={assnMngrLoading} />
        <DvidManagerDialog manager={dvidMngr} />
      </div>
      <div className="ng-container">
        {childrenWithCallback}
      </div>
    </div>
  );
}

FocusedProofreading.propTypes = {
  actions: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default withStyles(styles)(FocusedProofreading);
