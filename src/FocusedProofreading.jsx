import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { getNeuroglancerViewerState } from '@janelia-flyem/react-neuroglancer';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';
import Select from '@material-ui/core/Select';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { vec2 } from 'gl-matrix';

import { AssignmentManager, AssignmentManagerDialog } from './AssignmentManager';
import { AuthManager, AuthManagerDialog } from './AuthManager';
import ClientInfo from './ClientInfo';
import { DvidManager, DvidManagerDialog } from './DvidManager';
import './FocusedProofreading.css';
import FocusedProofreadingHelp from './FocusedProofreadingHelp';

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
  protocolNextTask: { key: 'e', help: 'Next task' },
  protocolPrevTask: { key: 'q', help: 'Previous task' },
  protocolCompletedAndNextTask1: { key: 'E', help: 'Next task and check "Completed"' },
  protocolCompletedAndNextTask2: { key: 'X', help: 'Next task and check "Completed"' },
  focusedProofreadingCycleResults: { key: 'v', help: 'Cycle through results' },
  focusedProofreadingToggleBirdsEyeView: { key: 'b', help: "Toggle between normal and bird's eye views" },
  focusedProofreadingInitialView: { key: 'i', help: "Use task's initial view" },
};

//
// Constants

const TASK_KEYS = Object.freeze({
  GRAYSCALE_SOURCE: 'grayscale source',
  SEGMENTATION_SOURCE: 'segmentation source',
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

const TODO_TYPES = Object.freeze([
  { value: 'False Merge*', label: 'Todo: Blocking False Merge' },
  { value: 'False Merge', label: 'Todo: False Merge' },
  { value: 'False Split', label: 'Todo: False Split' },
  { value: 'orphan', label: 'Todo: Orphan' },
  { value: 'orphan hotknife', label: 'Todo: Orphan Hotknife' },
  { value: 'Other', label: 'Todo: Other' },
]);

// Green
const COLOR_PRIMARY_BODY = '#348E53';
// Mustard yellow
const COLOR_OTHER_BODY = '#908827';

const CLIENT_INFO = new ClientInfo();

//
// Functions that can be factored out of the React component (because they don't use hooks)

const bodyPoints = (taskJson) => {
  if ((TASK_KEYS.BODY_PT1 in taskJson) && (TASK_KEYS.BODY_PT2 in taskJson)) {
    return ([taskJson[TASK_KEYS.BODY_PT1], taskJson[TASK_KEYS.BODY_PT2]]);
  }
  return (undefined);
};

const taskDocString = (taskJson, assnMngr) => {
  if (taskJson) {
    let indexStr = ` ${taskJson.index + 1}`;
    indexStr += ` (${assnMngr.completedPercentage()}%)`;
    return (`${'\xa0'}Task${indexStr}:${'\xa0'}`);
  }
  return ('');
};

const taskDocTooltip = (taskJson) => (
  taskJson ? `[${taskJson[TASK_KEYS.BODY_PT1]}] + [${taskJson[TASK_KEYS.BODY_PT2]}]` : ''
);

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

const dvidLogKey = (taskJson) => (
  `${taskJson[TASK_KEYS.BODY_PT1]}+${taskJson[TASK_KEYS.BODY_PT2]}`.replace(/,/g, '_')
);

const storeResults = (bodyIds, result, taskJson, taskStartTime, authMngr, dvidMngr, assnMngr) => {
  const bodyIdMergedOnto = bodyIds[0];
  const bodyIdOther = bodyIds[1];
  const time = (new Date()).toISOString();

  // Copy the task JSON for the (unlikely) possibility that the next task starts
  // before this asynchronous code finishes.
  const taskJsonCopy = JSON.parse(JSON.stringify(taskJson));

  authMngr.getUser().then((user) => {
    const taskEndTime = Date.now();
    const elapsedMs = taskEndTime - taskStartTime;
    let dvidLogValue = {
      'grayscale source': dvidMngr.grayscaleSourceURL(),
      'segmentation source': dvidMngr.segmentationSourceURL(),
      [TASK_KEYS.BODY_PT1]: taskJsonCopy[TASK_KEYS.BODY_PT1],
      [TASK_KEYS.BODY_PT2]: taskJsonCopy[TASK_KEYS.BODY_PT2],
      'body ID 1': bodyIdMergedOnto,
      'body ID 2': bodyIdOther,
      result,
      time,
      user,
      'time to complete (ms)': elapsedMs,
      client: CLIENT_INFO.info,
    };
    if (taskJson.index !== undefined) {
      dvidLogValue = { ...dvidLogValue, index: taskJson.index };
    }
    if (assnMngr.assignmentFile) {
      dvidLogValue = { ...dvidLogValue, assignment: assnMngr.assignmentFile };
    }
    if (result === RESULTS.MERGE) {
      const onCompletion = (res) => {
        dvidLogValue['mutation ID'] = res.MutationID;
        dvidMngr.postKeyValue('segmentation_focused', dvidLogKey(taskJsonCopy), dvidLogValue);
        // TODO: Add Kafka logging?
        console.log(`Successful merge of ${bodyIdOther} onto ${bodyIdMergedOnto}, mutation ID ${res.MutationID}`);
      };
      const onError = (err) => {
        // TODO: Add proper error reporting.
        console.error(`Failed to merge ${bodyIdOther} onto ${bodyIdMergedOnto}: `, err);
      };
      dvidMngr.postMerge(bodyIdMergedOnto, bodyIdOther, onCompletion, onError);
    } else {
      dvidMngr.postKeyValue('segmentation_focused', dvidLogKey(taskJsonCopy), dvidLogValue);
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

  const [authMngr] = React.useState(() => (new AuthManager()));
  const [authMngrDialogOpen, setAuthMngrDialogOpen] = React.useState(false);

  const [dvidMngr] = React.useState(() => (new DvidManager()));
  const [dvidMngrDialogOpen, setDvidMngrDialogOpen] = React.useState(false);

  const [assnMngr] = React.useState(() => (new AssignmentManager()));
  const [assnMngrLoading, setAssnMngrLoading] = React.useState(false);

  const [taskJson, setTaskJson] = React.useState(undefined);
  const [taskStartTime, setTaskStartTime] = React.useState(0);
  const [bodyIds, setBodyIds] = React.useState([]);
  const [initialPosition, setInitialPosition] = React.useState(undefined);
  const [initialOrientation, setInitialOrientation] = React.useState(undefined);
  const [initialScale, setInitialScale] = React.useState(undefined);
  const [normalScale, setNormalScale] = React.useState(100);
  const [birdsEyeScale, setBirdsEyeScale] = React.useState(100);
  const [usingBirdsEye, setUsingBirdsEye] = React.useState(false);
  const [usedBirdsEye, setUsedBirdsEye] = React.useState(false);
  const [result, setResult] = React.useState(RESULTS.DONT_MERGE);
  const [todoType, setTodoType] = React.useState(TODO_TYPES[0].value);
  const [completed, setCompleted] = React.useState(false);

  const [helpOpen, setHelpOpen] = React.useState(false);

  React.useEffect(() => {
    const handleNotLoggedIn = () => { setAuthMngrDialogOpen(true); };
    authMngr.init(handleNotLoggedIn);
  }, [authMngr]);

  const handleAuthManagerDialogClose = () => { setAuthMngrDialogOpen(false); };

  const handleTodoTypeChange = React.useCallback((type, json) => {
    setTodoType(type);
    actions.setViewerTodosType(type.replace('*', ''));
    const hint = `focused task [${json[TASK_KEYS.BODY_PT1]}] [${json[TASK_KEYS.BODY_PT2]}]`;
    actions.setViewerTodosHint((type === TODO_TYPES[0].value) ? hint : '');
  }, [setTodoType, actions]);

  const setupAssn = React.useCallback(() => {
    const json = assnMngr.assignment;
    const setViewer = () => {
      actions.setViewerGrayscaleSource(dvidMngr.grayscaleSourceURL());
      actions.setViewerSegmentationSource(dvidMngr.segmentationSourceURL());
      actions.setViewerTodosSource(dvidMngr.todosSourceURL());
    };
    let resolver;
    if (json[TASK_KEYS.GRAYSCALE_SOURCE] && json[TASK_KEYS.SEGMENTATION_SOURCE]) {
      dvidMngr.init(json[TASK_KEYS.GRAYSCALE_SOURCE], json[TASK_KEYS.SEGMENTATION_SOURCE]);
      setViewer();
      // This promise immediately calls the `.then(...)` code, as there is no dialog to wait for.
      return new Promise((resolve) => { resolve(); });
    }
    const onDvidInitialized = () => {
      setDvidMngrDialogOpen(false);
      setViewer();
      resolver();
    };
    dvidMngr.init(onDvidInitialized);
    setDvidMngrDialogOpen(true);
    // This promise saves the `.then(...)` code so it can be can be called at the end of
    // `onDvidInitialized()`, above, when the sources dialog has been closed.
    return new Promise((resolve) => { resolver = resolve; });
  }, [actions, assnMngr, dvidMngr]);

  const setupTask = React.useCallback(() => {
    const onError = (group) => (error) => { actions.addAlert({ group, message: error }); };
    const startTime = Date.now();
    setTaskStartTime(startTime);
    const json = assnMngr.taskJson();
    const bodyPts = bodyPoints(json);
    if (!bodyPts) {
      return new Promise((resolve) => { resolve(false); });
    }
    return (
      dvidMngr.getBodyId(bodyPts[0], onError(1))
        .then((bodyId0) => (
          dvidMngr.getBodyId(bodyPts[1], onError(2)).then((bodyId1) => [bodyId0, bodyId1])
        ))
        .then(([bodyId0, bodyId1]) => (
          dvidMngr.getKeyValue('segmentation_focused', dvidLogKey(json), onError(3))
            .then((data) => [bodyId0, bodyId1, data])
        ))
        .then(([bodyId0, bodyId1, prevResult]) => {
          const segments = [bodyId0, bodyId1];
          if (!bodyId0 || !bodyId1) {
            storeResults(segments, 'skip (missing body ID)', json, startTime, authMngr, dvidMngr, assnMngr);
            return false;
          }
          if (bodyId0 === bodyId1) {
            // Skip a task involving bodies that have been merged already.
            storeResults(segments, 'skip (same body ID)', json, startTime, authMngr, dvidMngr, assnMngr);
            return false;
          }
          if (prevResult) {
            json.completed = true;
            // Skip a task that has a stored result already.
            return false;
          }
          const [restoredResult, restoredCompleted] = restoreResults(json);
          const { position, projectionOrientation } = cameraPose(bodyPts);
          cameraProjectionScale(segments, projectionOrientation, dvidMngr)
            .then(([scale, scaleBirdsEye]) => {
              setTaskJson(json);
              setBodyIds(segments);
              setNormalScale(scale);
              setBirdsEyeScale(scaleBirdsEye);
              setInitialPosition(position);
              setInitialOrientation(projectionOrientation);
              setInitialScale(scale);
              setResult(restoredResult);
              setCompleted(restoredCompleted);

              handleTodoTypeChange(TODO_TYPES[0].value, json);

              actions.setViewerSegments(segments);
              actions.setViewerSegmentColors(bodyColors(segments, restoredResult));
              actions.setViewerCrossSectionScale(1);
              actions.setViewerCameraPosition(position);
              actions.setViewerCameraProjectionOrientation(projectionOrientation);
              actions.setViewerCameraProjectionScale(scale);
            });
          return true;
        })
    );
  }, [actions, handleTodoTypeChange, authMngr, assnMngr, dvidMngr]);

  const noTask = (taskJson === undefined);
  const prevDisabled = noTask || assnMngr.prevButtonDisabled();
  const nextDisabled = noTask || assnMngr.nextButtonDisabled();

  React.useEffect(() => {
    assnMngr.init(setupAssn, setupTask, actions.addAlert);
  }, [assnMngr, setupAssn, setupTask, actions]);

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

  const handleInitialView = () => {
    actions.setViewerCameraPosition(initialPosition);
    actions.setViewerCameraProjectionOrientation(initialOrientation);
    actions.setViewerCameraProjectionScale(initialScale);
  };

  const handleResultChange = (newResult) => {
    actions.setViewerSegmentColors(bodyColors(bodyIds, newResult));
  };

  const handleResultRadio = (event) => {
    setResult(event.target.value);
    handleResultChange(event.target.value);
  };

  const handleTodoTypeSelect = (event) => {
    handleTodoTypeChange(event.target.value, taskJson);
  };

  const handleTaskCompleted = (isCompleted) => {
    setCompleted(isCompleted);
    taskJson.completed = isCompleted;
    if (isCompleted) {
      storeResults(bodyIds, result, taskJson, taskStartTime, authMngr, dvidMngr, assnMngr);
    }
  };

  const handleCompletedCheckbox = (event) => {
    handleTaskCompleted(event.target.checked);
  };

  const handleHelpOpen = () => { setHelpOpen(true); };
  const handleHelpClose = () => { setHelpOpen(false); };

  const handleKeyPress = (event) => {
    if (!noTask) {
      if (event.key === keyBindings.protocolNextTask.key) {
        if (!nextDisabled) {
          handleNextButton();
        }
      } else if (event.key === keyBindings.protocolPrevTask.key) {
        if (!prevDisabled) {
          handlePrevButton();
        }
      } else if ((event.key === keyBindings.protocolCompletedAndNextTask1.key)
        || (event.key === keyBindings.protocolCompletedAndNextTask2.key)) {
        if (usedBirdsEye && !nextDisabled) {
          handleTaskCompleted(true);
          handleNextButton();
        }
      } else if (event.key === keyBindings.focusedProofreadingCycleResults.key) {
        const newResult = RESULT_CYCLES_NEXT[result];
        setResult(newResult);
        handleResultChange(newResult);
      } else if (event.key === keyBindings.focusedProofreadingToggleBirdsEyeView.key) {
        const startUsingBirdsEye = !usingBirdsEye;
        if (startUsingBirdsEye) {
          const ngState = getNeuroglancerViewerState();
          setNormalScale(ngState.projectionScale);
        }
        const scale = startUsingBirdsEye ? birdsEyeScale : normalScale;
        setUsedBirdsEye(usedBirdsEye || startUsingBirdsEye);
        actions.setViewerCameraProjectionScale(scale);
        setUsingBirdsEye(startUsingBirdsEye);
      } else if (event.key === keyBindings.focusedProofreadingInitialView.key) {
        handleInitialView();
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

  const eventBindingsToUpdate = Object.entries(keyBindings).map((e) => [`key${e[1].key}`, `control+key${e[1].key}`]);

  // Add `onMeshLoaded` to the props of the child, which is a react-neuroglancer viewer.
  // TODO: Add support for `onMeshLoaded` to `react-neurogloancer`.
  const childrenWithMoreProps = React.Children.map(children, (child) => (
    React.cloneElement(child, { eventBindingsToUpdate, onMeshLoaded }, null)
  ));

  const tooltip = `Use bird's eye view (key "${keyBindings.focusedProofreadingToggleBirdsEyeView.key}") to enable "Completed"`;

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
        <Tooltip title={taskDocTooltip(taskJson)}>
          <Typography color="inherit">
            {taskDocString(taskJson, assnMngr)}
          </Typography>
        </Tooltip>
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
            <FormControl variant="outlined" disabled={noTask}>
              <Select value={todoType} onChange={handleTodoTypeSelect}>
                {TODO_TYPES.map((x) => (
                  <MenuItem key={x.value} value={x.value}>
                    {x.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={(noTask || usedBirdsEye) ? '' : tooltip}>
              <FormControlLabel
                label="Completed"
                control={<Checkbox disabled={!usedBirdsEye} checked={completed} onChange={handleCompletedCheckbox} name="completed" />}
              />
            </Tooltip>
          </RadioGroup>
        </FormControl>
        <IconButton onClick={handleHelpOpen}>
          <HelpIcon />
        </IconButton>
        <ThemeProvider theme={dialogTheme}>
          <AuthManagerDialog open={authMngrDialogOpen} onClose={handleAuthManagerDialogClose} />
          <DvidManagerDialog manager={dvidMngr} open={dvidMngrDialogOpen} />
          <AssignmentManagerDialog manager={assnMngr} open={assnMngrLoading} />
          <FocusedProofreadingHelp
            keyBindings={keyBindings}
            open={helpOpen}
            onClose={handleHelpClose}
          />
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
