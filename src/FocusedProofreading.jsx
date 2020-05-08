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

const TASK_KEYS = Object.freeze({
  BODY_PT1: 'body point 1',
  BODY_PT2: 'body point 2',
});

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
  [taskJson[TASK_KEYS.BODY_PT1], taskJson[TASK_KEYS.BODY_PT2]]
);

const taskDocString = (taskJson) => {
  if (taskJson) {
    const indexStr = ` ${taskJson.index + 1}`;
    return (`${'\xa0'}Task${indexStr}: [${taskJson[TASK_KEYS.BODY_PT1]}] + [${taskJson[TASK_KEYS.BODY_PT2]}]`);
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

const cameraProjectionScale = (bodyIds, orientation, dvidMngr) => {
  // TODO: Make `onError` an argument, for error handling specific to the 'get' calls here.
  const onError = (err) => {
    console.error('Failed to get body size: ', err);
  };
  return (
    dvidMngr.getSparseVolSize(bodyIds[0])
      .then((data0) => (
        dvidMngr.getSparseVolSize(bodyIds[1]).then((data1) => ([data0, data1]))
      ))
      .then(([data0, data1]) => {
        // The heuristics here consider the sizes of bounding box dimensions (sides)
        // as seen with the current camera orientation.  This orientation is a rotation
        // around the Y axis.  A bounding box X dimension apears scaled by the cosine of
        // the camera angle, and the Z by the sine.  The Y dimension is unscaled.
        const angle = Math.acos(orientation[3]) * 2;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        // For the normal scale, use the smaller body's bounding box, and pick the
        // scaled dimension that is bigger.
        const minA = (data0.voxels < data1.voxels) ? data0.minvoxel : data1.minvoxel;
        const maxA = (data0.voxels < data1.voxels) ? data0.maxvoxel : data1.maxvoxel;
        const dimsA = [maxA[0] - minA[0], maxA[1] - minA[1], maxA[2] - minA[2]];
        const visibleXA = Math.abs(c * dimsA[0]);
        const visibleZA = Math.abs(s * dimsA[2]);
        let scale = Math.max(visibleXA, dimsA[1], visibleZA);
        // Make it a bit tighter.
        scale /= 2;

        // For the bird's eye view scale, use the bounding box for both bodies.
        const minB = [
          Math.min(data0.minvoxel[0], data1.minvoxel[0]),
          Math.min(data0.minvoxel[1], data1.minvoxel[1]),
          Math.min(data0.minvoxel[2], data1.minvoxel[2]),
        ];
        const maxB = [
          Math.max(data0.maxvoxel[0], data1.maxvoxel[0]),
          Math.max(data0.maxvoxel[1], data1.maxvoxel[1]),
          Math.max(data0.maxvoxel[2], data1.maxvoxel[2]),
        ];
        const dimsB = [maxB[0] - minB[0], maxB[1] - minB[1], maxB[2] - minB[2]];
        const visibleXB = Math.abs(c * dimsB[0]);
        const visibleZB = Math.abs(s * dimsB[2]);
        const scaleBirdsEye = Math.max(visibleXB, dimsB[1], visibleZB);

        return ([scale, scaleBirdsEye]);
      })
      .catch(onError)
  );
};

// eslint-disable-next-line no-unused-vars
const storeResults = (bodyIds, result, taskJson, dvidMngr) => {
  const bodyIdMergedOnto = bodyIds[0];
  const bodyIdOther = bodyIds[1];
  const dvidLogKey = bodyIdOther;
  const time = (new Date()).toISOString();

  // TODO: Get the user name from the token returned by
  // https://hemibrain-dvid2.janelia.org/api/server/token
  const user = 'unknown';

  const dvidLogValue = {
    [TASK_KEYS.BODY_PT1]: taskJson[TASK_KEYS.BODY_PT1],
    [TASK_KEYS.BODY_PT2]: taskJson[TASK_KEYS.BODY_PT2],
    'body ID 1': bodyIdMergedOnto,
    'body ID 2': bodyIdOther,
    result,
    time,
    user,
  };
  if (result === RESULTS.MERGE) {
    const onCompletion = (res) => {
      dvidLogValue['mutation ID'] = res.MutationID;
      dvidMngr.postKeyValue('segmentation_focused', dvidLogKey, dvidLogValue);
      // TODO: Add Kafka logging?
      console.log(`Successful merge of ${bodyIdOther} onto ${bodyIdMergedOnto}, mutation ID ${res.MutationID}`);
    };
    const onError = (err) => {
      // TODO: Add proper error reporting.
      console.error(`Failed to merge ${bodyIdOther} onto ${bodyIdMergedOnto}: `, err);
    };
    dvidMngr.postMerge(bodyIdMergedOnto, bodyIdOther, onCompletion, onError);
  } else {
    dvidMngr.postKeyValue('segmentation_focused', dvidLogKey, dvidLogValue);
  }
};

// Returns [result, completed]
const restoreResults = (taskJson) => {
  const completed = !!taskJson.completed;
  const result = [RESULTS.DONT_MERGE, completed];
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
    const bodyPts = bodyPoints(json);
    return (
      dvidMngr.getBodyId(bodyPts[0])
        .then((bodyId0) => (
          dvidMngr.getBodyId(bodyPts[1]).then((bodyId1) => [bodyId0, bodyId1])
        ))
        .then(([bodyId0, bodyId1]) => (
          dvidMngr.getKeyValue('segmentation_focused', bodyId1).then((data) => [bodyId0, bodyId1, data])
        ))
        .then(([bodyId0, bodyId1, prevResult]) => {
          if (bodyId0 === bodyId1) {
            // Skip a task involving bodies that have been merged already.
            return false;
          }
          if (prevResult) {
            // Skip a task that has a stored result already.
            return false;
          }
          const segments = [bodyId0, bodyId1];
          const [restoredResult, restoredCompleted] = restoreResults(json);
          const { position, projectionOrientation } = cameraPose(bodyPts);
          cameraProjectionScale(segments, projectionOrientation, dvidMngr)
            .then(([scale, scaleBirdsEye]) => {
              setTaskJson(json);
              setResult(restoredResult);
              setCompleted(restoredCompleted);
              setBodyIds(segments);
              setNormalScale(scale);
              setBirdsEyeScale(scaleBirdsEye);

              actions.setViewerSegments(segments);
              actions.setViewerSegmentColors(bodyColors(segments, restoredResult));
              actions.setViewerCameraPosition(position);
              actions.setViewerCameraProjectionOrientation(projectionOrientation);

              // TODO: Neuroglancer does something to the 'projectionScale' value,
              // which seems end up being this emprically determined conversion factor.
              // Replace it with a more principled solution.
              const conversion = 125000000;
              actions.setViewerCameraProjectionScale(scale / conversion);
            });
          return true;
        })
    );
  }, [actions, assnMngr, dvidMngr]);

  const noTask = (taskJson === undefined);

  React.useEffect(() => {
    assnMngr.init(setupTask);
  }, [assnMngr, setupTask]);

  const handleLoadButton = () => {
    setAssnMngrLoading(true);
    const onLoadInteractionDone = () => setAssnMngrLoading(false);
    assnMngr.load(onLoadInteractionDone);
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
    taskJson.completed = event.target.checked;
    if (event.target.checked) {
      storeResults(bodyIds, result, taskJson, dvidMngr);
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

  const prevDisabled = noTask || assnMngr.prevButtonDisabled();
  const nextDisabled = noTask || assnMngr.nextButtonDisabled();

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
            <Button color="primary" variant="contained" onClick={handlePrevButton} disabled={prevDisabled}>
              Prev
            </Button>
            <Button color="primary" variant="contained" onClick={handleNextButton} disabled={nextDisabled}>
              Next
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
