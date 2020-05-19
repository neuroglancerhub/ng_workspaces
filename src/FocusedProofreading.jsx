import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { vec2 } from 'gl-matrix';

import { AssignmentManager, AssignmentManagerDialog } from './AssignmentManager';
import { AuthManager, AuthManagerDialog } from './AuthManager';
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

// Use a default theme for dialogs, so their text is the normal size.
const dialogTheme = createMuiTheme({
});

//

// TODO: Make a general mechanism for user-modifiable key bindings.
const keyBindings = {
  protocolNextTask: 'e',
  protocolPrevTask: 'q',
  protocolCompletedAndNextTask1: 'E',
  protocolCompletedAndNextTask2: 'X',
  focusedProofreadingCycleResults: 'v',
  focusedProofreadingToggleBirdsEyeView: 'b',
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

const taskDocString = (taskJson, assnMngr) => {
  if (taskJson) {
    let indexStr = ` ${taskJson.index + 1}`;
    indexStr += ` (${assnMngr.completedPercentage()}%)`;
    return (`${'\xa0'}Task${indexStr}: [${taskJson[TASK_KEYS.BODY_PT1]}] + [${taskJson[TASK_KEYS.BODY_PT2]}]${'\xa0'}`);
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

const storeResults = (bodyIds, result, taskJson, taskStartTime, authMngr, dvidMngr) => {
  const bodyIdMergedOnto = bodyIds[0];
  const bodyIdOther = bodyIds[1];
  const dvidLogKey = bodyIdOther;
  const time = (new Date()).toISOString();

  // Copy the task JSON for the (unlikely) possibility that the next task starts
  // before this asynchronous code finishes.
  const taskJsonCopy = JSON.parse(JSON.stringify(taskJson));

  authMngr.getUser().then((user) => {
    const taskEndTime = Date.now();
    const elapsedMs = taskEndTime - taskStartTime;
    const dvidLogValue = {
      [TASK_KEYS.BODY_PT1]: taskJsonCopy[TASK_KEYS.BODY_PT1],
      [TASK_KEYS.BODY_PT2]: taskJsonCopy[TASK_KEYS.BODY_PT2],
      'body ID 1': bodyIdMergedOnto,
      'body ID 2': bodyIdOther,
      result,
      time,
      user,
      'time to complete (ms)': elapsedMs,
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
  });
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

  const [authMngr] = React.useState(new AuthManager());
  const [authManagerDialogOpen, setAuthManagerDialogOpen] = React.useState(false);

  const [assnMngr] = React.useState(new AssignmentManager());
  const [assnMngrLoading, setAssnMngrLoading] = React.useState(false);

  const [dvidMngr] = React.useState(new DvidManager());

  const [taskJson, setTaskJson] = React.useState(undefined);
  const [taskStartTime, setTaskStartTime] = React.useState(0);
  const [bodyIds, setBodyIds] = React.useState([]);
  const [result, setResult] = React.useState(RESULTS.DONT_MERGE);
  const [completed, setCompleted] = React.useState(false);
  const [normalScale, setNormalScale] = React.useState(100);
  const [birdsEyeScale, setBirdsEyeScale] = React.useState(100);
  const [usingBirdsEye, setUsingBirdsEye] = React.useState(false);
  const [usedBirdsEye, setUsedBirdsEye] = React.useState(false);

  React.useEffect(() => {
    const handleNotLoggedIn = () => { setAuthManagerDialogOpen(true); };
    authMngr.init(handleNotLoggedIn);
  }, [authMngr]);

  const handleAuthManagerDialogClose = () => { setAuthManagerDialogOpen(false); };

  React.useEffect(() => {
    const onDvidInitialized = () => {
      actions.setViewerGrayscaleSource(dvidMngr.grayscaleSourceURL());
      actions.setViewerSegmentationSource(dvidMngr.segmentationSourceURL());
    };
    dvidMngr.init(onDvidInitialized);
  }, [actions, dvidMngr]);

  const setupTask = React.useCallback(() => {
    setTaskStartTime(Date.now());
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
            json.completed = true;
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
              actions.setViewerCameraProjectionScale(scale);
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
    setUsedBirdsEye(false);
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

  const handleTaskCompleted = (isCompleted) => {
    setCompleted(isCompleted);
    taskJson.completed = isCompleted;
    if (isCompleted) {
      storeResults(bodyIds, result, taskJson, taskStartTime, authMngr, dvidMngr);
    }
  };

  const handleCompletedCheckbox = (event) => {
    handleTaskCompleted(event.target.checked);
  };

  const handleKeyPress = (event) => {
    if (!noTask) {
      if (event.key === keyBindings.protocolNextTask) {
        handleNextButton();
      } else if (event.key === keyBindings.protocolPrevTask) {
        handlePrevButton();
      } else if ((event.key === keyBindings.protocolCompletedAndNextTask1)
        || (event.key === keyBindings.protocolCompletedAndNextTask2)) {
        if (usedBirdsEye) {
          handleTaskCompleted(true);
          handleNextButton();
        }
      } else if (event.key === keyBindings.focusedProofreadingCycleResults) {
        const newResult = RESULT_CYCLES_NEXT[result];
        setResult(newResult);
        handleResultChange(newResult);
      } else if (event.key === keyBindings.focusedProofreadingToggleBirdsEyeView) {
        const startUsingBirdsEye = !usingBirdsEye;
        // TODO: If startUsingBirdsEye, save the current scale as normalScale, probably
        // by calling getNeuroglancerViewerState().
        const scale = startUsingBirdsEye ? birdsEyeScale : normalScale;
        setUsedBirdsEye(usedBirdsEye || startUsingBirdsEye);
        actions.setViewerCameraProjectionScale(scale);
        setUsingBirdsEye(startUsingBirdsEye);
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

  const eventBindingsToUpdate = Object.entries(keyBindings).map((e) => [`key${e[1]}`, `control+key${e[1]}`]);

  // Add `onMeshLoaded` to the props of the child, which is a react-neuroglancer viewer.
  // TODO: Add support for `onMeshLoaded` to `react-neurogloancer`.
  const childrenWithMoreProps = React.Children.map(children, (child) => (
    React.cloneElement(child, { eventBindingsToUpdate, onMeshLoaded }, null)
  ));

  const prevDisabled = noTask || assnMngr.prevButtonDisabled();
  const nextDisabled = noTask || assnMngr.nextButtonDisabled();

  const tooltip = `Use bird's eye view (key "${keyBindings.focusedProofreadingToggleBirdsEyeView}") to enable "Completed"`;

  return (
    <div
      className="focused-proofreading-container"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className="focused-proofreading-control-row">
        <ButtonGroup variant="contained" color="primary" size="small">
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
          {taskDocString(taskJson, assnMngr)}
        </Typography>
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
            <Tooltip title={(noTask || usedBirdsEye) ? '' : tooltip}>
              <FormControlLabel
                label="Completed"
                control={<Checkbox disabled={!usedBirdsEye} checked={completed} onChange={handleCompletedCheckbox} name="completed" />}
              />
            </Tooltip>
          </RadioGroup>
        </FormControl>
        <ThemeProvider theme={dialogTheme}>
          <AuthManagerDialog open={authManagerDialogOpen} onClose={handleAuthManagerDialogClose} />
          <DvidManagerDialog manager={dvidMngr} />
          <AssignmentManagerDialog manager={assnMngr} open={assnMngrLoading} />
        </ThemeProvider>
      </div>
      <div className="ng-container">
        {childrenWithMoreProps}
      </div>
    </div>
  );
}

FocusedProofreading.propTypes = {
  actions: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default withStyles(styles)(FocusedProofreading);
