// TODO: Factor out the code common to MitoCount and FocusedProofreading.

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import Select from '@material-ui/core/Select';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import activeElementNeedsKeypress from './utils/events';
import { AssignmentManager, AssignmentManagerDialog } from './AssignmentManager';
import { AuthManager, AuthManagerDialog } from './AuthManager';
import ClientInfo from './ClientInfo';
import { DvidManager, DvidManagerDialog } from './DvidManager';
import './MitoCount.css';
import ProtocolHelp from './ProtocolHelp';

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
  spaced: {
    marginLeft: '15px',
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
  mitoCountInitialView: { key: 'i', help: "Use task's initial view" },
  mitoCountIncrCount: { key: 'v', help: 'Increment the count' },
  mitoCountDecrCount: { key: 'c', help: 'Decrement the count' },
};

//
// Constants

const TASK_KEYS = Object.freeze({
  GRAYSCALE_SOURCE: 'grayscale source',
  MITO_ROI_SOURCE: 'mito ROI source',
  DVID_SOURCE: 'DVID source',
  TOP_PT: 'neighborhood top',
  FOCAL_PT: 'focal point',
  NEIGHBORHOOD_ID: 'neighborhood id',
  NEIGHBORHOOD_SIZE: 'neighborhood size',
  ORIGIN_PT: 'neighborhood origin',
  CENTROID_PT: 'neighborhood centroid',
});

const TODO_TYPES = Object.freeze([
  { value: 'False Merge', label: 'Todo: False Merge' },
  { value: 'False Split', label: 'Todo: False Split' },
  { value: 'orphan', label: 'Todo: Orphan' },
  { value: 'orphan hotknife', label: 'Todo: Orphan Hotknife' },
  { value: 'Other', label: 'Todo: Other' },
]);

// Blue
const COLOR_MITO_ROI = '#0072b2';

const CLIENT_INFO = new ClientInfo();

const SEGMENTATION_LAYER_NAME = 'mito ROIs';
const RESULTS_INSTANCE = 'mito_count';

//
// Functions that can be factored out of the React component (because they don't use hooks)

const topPoint = (taskJson) => {
  if (TASK_KEYS.TOP_PT in taskJson) {
    return (taskJson[TASK_KEYS.TOP_PT]);
  }
  return (undefined);
};

const focalPoint = (taskJson) => {
  if (TASK_KEYS.FOCAL_PT in taskJson) {
    return (taskJson[TASK_KEYS.FOCAL_PT]);
  }
  return (undefined);
};

const neighborhoodId = (taskJson) => {
  if (TASK_KEYS.NEIGHBORHOOD_ID in taskJson) {
    return (taskJson[TASK_KEYS.NEIGHBORHOOD_ID]);
  }
  return (undefined);
};

const taskDocString = (taskJson, assnMngr) => {
  if (taskJson) {
    let indexStr = ` ${taskJson.index + 1}`;
    indexStr += ` (${assnMngr.completedPercentage()}%)`;
    return (`${'\xa0'}Task${indexStr}:${'\xa0'}`);
  }
  if (Object.keys(assnMngr.assignment).length !== 0) {
    return (`${'\xa0'}Loading...`);
  }
  return ('');
};

const taskDocTooltip = (taskJson, assnMngr) => (
  (taskJson ? `${assnMngr.assignmentFile} [${focalPoint(taskJson)}]` : '')
);

const cameraOrientation = () => {
  const angle = 0;
  // Convert that angle and the rotation axis (the Y axis) into a quaternion.
  const c = Math.cos(angle / 2);
  const s = Math.sin(angle / 2);
  const projectionOrientation = [0, s, 0, c];
  return (projectionOrientation);
};

const cameraProjectionScale = (data, orientation) => {
  // The heuristics here consider the sizes of bounding box dimensions (sides)
  // as seen with the current camera orientation.  This orientation is a rotation
  // around the Y axis.  A bounding box X dimension apears scaled by the cosine of
  // the camera angle, and the Z by the sine.  The Y dimension is unscaled.
  const angle = Math.acos(orientation[3]) * 2;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // For the normal scale, use the smaller body's bounding box, and pick the
  // scaled dimension that is bigger.
  const dims = [
    data.maxvoxel[0] - data.minvoxel[0],
    data.maxvoxel[1] - data.minvoxel[1],
    data.maxvoxel[2] - data.minvoxel[2],
  ];
  const visibleX = Math.abs(c * dims[0]);
  const visibleZ = Math.abs(s * dims[2]);
  let scale = Math.max(visibleX, dims[1], visibleZ);
  // Make it a bit tighter.
  scale /= 2;
  return (scale);
};

const cameraCrossSectionScale = (data) => {
  const dims = [
    data.maxvoxel[0] - data.minvoxel[0],
    data.maxvoxel[1] - data.minvoxel[1],
    data.maxvoxel[2] - data.minvoxel[2],
  ];
  const dim = Math.max(dims[0], dims[1], dims[2]);
  const scale = (dim / 500.0) * 0.9;
  return (scale);
};

const cameraParameters = (roiId, dvidMngr) => {
  // TODO: Make `onError` an argument, for error handling specific to the 'get' calls here.
  const onError = (err) => {
    console.error('Failed to get body size: ', err);
  };
  return (
    dvidMngr.getSparseVolSize(roiId)
      .then((data) => {
        const orientation = cameraOrientation();
        const projectionScale = cameraProjectionScale(data, orientation);
        const crossSectionScale = cameraCrossSectionScale(data);
        return ({ orientation, projectionScale, crossSectionScale });
      })
      .catch(onError)
  );
};

const dvidLogKey = (taskJson) => (
  (taskJson ? `${focalPoint(taskJson)}`.replace(/,/g, '_') : '')
);

const storeResults = (mitoRoiId, result, taskJson, taskStartTime, authMngr, dvidMngr, assnMngr) => {
  const time = (new Date()).toISOString();

  // Copy the task JSON for the (unlikely) possibility that the next task starts
  // before this asynchronous code finishes.
  const taskJsonCopy = JSON.parse(JSON.stringify(taskJson));

  authMngr.getUser().then((user) => {
    const taskEndTime = Date.now();
    const elapsedMs = taskEndTime - taskStartTime;
    let dvidLogValue = {
      'grayscale source': dvidMngr.grayscaleSourceURL(),
      // As a cheap-and-cheerful solution, reuse the segmentation field for the mito ROI source.
      'mito ROI source': dvidMngr.segmentationSourceURL(),
      'DVID source': dvidMngr.dvidSourceURL(),
      [TASK_KEYS.FOCAL_PT]: taskJsonCopy[TASK_KEYS.FOCAL_PT],
      [TASK_KEYS.TOP_PT]: taskJsonCopy[TASK_KEYS.TOP_PT],
      [TASK_KEYS.NEIGHBORHOOD_ID]: mitoRoiId,
      [TASK_KEYS.NEIGHBORHOOD_SIZE]: taskJsonCopy[TASK_KEYS.NEIGHBORHOOD_SIZE],
      [TASK_KEYS.ORIGIN_PT]: taskJsonCopy[TASK_KEYS.ORIGIN_PT],
      [TASK_KEYS.CENTROID_PT]: taskJsonCopy[TASK_KEYS.CENTROID_PT],
      result,
      time,
      user,
      'time to complete (ms)': elapsedMs,
      client: CLIENT_INFO.info,
    };
    if (taskJsonCopy.index !== undefined) {
      dvidLogValue = { ...dvidLogValue, index: taskJsonCopy.index };
    }
    if (assnMngr.assignmentFile) {
      dvidLogValue = { ...dvidLogValue, assignment: assnMngr.assignmentFile };
    }
    dvidMngr.postKeyValue(RESULTS_INSTANCE, dvidLogKey(taskJsonCopy), dvidLogValue);
  });
};

// Returns [result, completed]
const restoreResults = (taskJson) => {
  const completed = !!taskJson.completed;
  const result = [0, completed];
  return (result);
};

//
// The React component for mitochondria counting.  Per the latest suggestions,
// it is a functional component using hooks to manage state and side effects.
// State shared with other components in the application is managed using
// Redux, accessed with the functions in the `actions` prop.

function MitoCount(props) {
  const { actions, children, classes } = props;

  const [authMngr] = React.useState(() => (new AuthManager()));
  const [authMngrDialogOpen, setAuthMngrDialogOpen] = React.useState(false);

  const [dvidMngr] = React.useState(() => (new DvidManager()));
  const [dvidMngrDialogOpen, setDvidMngrDialogOpen] = React.useState(false);

  const [assnMngr] = React.useState(() => (new AssignmentManager()));
  const [assnMngrLoading, setAssnMngrLoading] = React.useState(false);

  const [taskJson, setTaskJson] = React.useState(undefined);
  const [taskStartTime, setTaskStartTime] = React.useState(0);
  const [mitoRoiId, setMitoRoiId] = React.useState(0);
  const [initialPosition, setInitialPosition] = React.useState(undefined);
  const [initialOrientation, setInitialOrientation] = React.useState(undefined);
  const [initialScale, setInitialScale] = React.useState(undefined);
  const [normalScale, setNormalScale] = React.useState(100);
  const [result, setResult] = React.useState(0);
  const [todoType, setTodoType] = React.useState(TODO_TYPES[4].value);
  const [completed, setCompleted] = React.useState(false);

  const [helpOpen, setHelpOpen] = React.useState(false);

  React.useEffect(() => {
    const handleNotLoggedIn = () => { setAuthMngrDialogOpen(true); };
    authMngr.init(handleNotLoggedIn);
  }, [authMngr]);

  const handleAuthManagerDialogClose = () => { setAuthMngrDialogOpen(false); };

  const handleTodoTypeChange = React.useCallback((type) => {
    setTodoType(type);
    actions.setViewerTodosType(type);
  }, [setTodoType, actions]);

  const setupAssn = React.useCallback(() => {
    const json = assnMngr.assignment;
    const setViewer = () => {
      actions.setViewerGrayscaleSource(dvidMngr.grayscaleSourceURL());
      // As a cheap-and-cheerful solution, reuse the segmentation field for the mito ROI source.
      actions.setViewerSegmentationSource(dvidMngr.segmentationSourceURL());
      actions.setViewerSegmentationLayerName(SEGMENTATION_LAYER_NAME);
      actions.setViewerTodosSource(dvidMngr.todosSourceURL());
    };
    let resolver;
    if ((TASK_KEYS.GRAYSCALE_SOURCE in json) && (TASK_KEYS.MITO_ROI_SOURCE in json)) {
      const dvid = json[TASK_KEYS.DVID_SOURCE] || '';
      // As a cheap-and-cheerful solution, reuse the segmentation field for the mito ROI source.
      dvidMngr.init(json[TASK_KEYS.GRAYSCALE_SOURCE], json[TASK_KEYS.MITO_ROI_SOURCE], dvid);
      setViewer();
      // This promise immediately calls the `.then(...)` code, as there is no dialog to wait for.
      return new Promise((resolve) => { resolve(); });
    }
    const onDvidInitialized = () => {
      setDvidMngrDialogOpen(false);
      setViewer();
      resolver();
    };
    dvidMngr.initForDialog(onDvidInitialized, 'Mitochondria ROIs');
    setDvidMngrDialogOpen(true);
    // This promise saves the `.then(...)` code so it can be can be called at the end of
    // `onDvidInitialized()`, above, when the sources dialog has been closed.
    return new Promise((resolve) => { resolver = resolve; });
  }, [actions, assnMngr, dvidMngr]);

  const setupTask = React.useCallback(() => {
    // Clearing the task JSON prevents rapid UI activity from starting another task before
    // this one is done being set up.
    const taskJsonOld = taskJson;
    setTaskJson(undefined);

    const onError = (group) => (error) => { actions.addAlert({ group, message: error }); };
    const startTime = Date.now();
    setTaskStartTime(startTime);
    const json = assnMngr.taskJson();
    const roiId = neighborhoodId(json);
    const pt = topPoint(json);
    if (!roiId || !pt) {
      return new Promise((resolve) => { resolve(AssignmentManager.TASK_SKIP); });
    }
    return (
      dvidMngr.getKeyValue(RESULTS_INSTANCE, dvidLogKey(json), onError(3))
        .then((prevResult) => {
          if (prevResult === DvidManager.NO_INTERNET) {
            setTaskJson(taskJsonOld);
            return (AssignmentManager.TASK_RETRY);
          }
          if (prevResult) {
            // Skip a task that has a stored result already.
            json.completed = true;
            // If all tasks in the assignment are skipped, let `taskDocString` end up displaying
            // something better than "Loading..."
            setTaskJson(json);
            return false;
          }
          const [restoredResult, restoredCompleted] = restoreResults(json);
          cameraParameters(roiId, dvidMngr)
            .then(({ orientation, projectionScale, crossSectionScale }) => {
              setTaskJson(json);
              setMitoRoiId(roiId);
              setNormalScale(projectionScale);
              setInitialPosition(pt);
              setInitialOrientation(orientation);
              setInitialScale(projectionScale);
              setResult(restoredResult);
              setCompleted(restoredCompleted);

              handleTodoTypeChange(TODO_TYPES[4].value, json);

              actions.setViewerSegments([roiId]);
              actions.setViewerSegmentColors({ [roiId]: COLOR_MITO_ROI });
              actions.setViewerCrossSectionScale(crossSectionScale);
              actions.setViewerCameraPosition(pt);
              actions.setViewerCameraProjectionOrientation(orientation);
              actions.setViewerCameraProjectionScale(projectionScale);
            });
          return true;
        })
    );
  }, [actions, handleTodoTypeChange, taskJson, assnMngr, dvidMngr]);

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

  const handleCountIncr = () => {
    const n = result >= 0 ? result + 1 : 1;
    setResult(n);

    // This result is not saved in the Redux state, but any UI change causes the current
    // Redux state to be pushed to Neuroglancer.  So force the Redux state to be synchronized
    // with the Neuroglancer state, to avoid losing any recent changes in Neuroglancer.
    actions.syncViewer();
  };

  const handleCountDecr = () => {
    const n = result >= 0 ? Math.max(result - 1, 0) : 0;
    setResult(n);
    actions.syncViewer();
  };

  const handleResultChange = (event) => {
    if (event.target.innerText === '+') {
      handleCountIncr();
    } else if (event.target.innerText === '-') {
      handleCountDecr();
    } else {
      setResult(-1);
      actions.syncViewer();
    }
  };

  const handleTodoTypeSelect = (event) => {
    handleTodoTypeChange(event.target.value);
  };

  const handleTaskCompleted = (isCompleted) => {
    setCompleted(isCompleted);
    taskJson.completed = isCompleted;
    if (isCompleted) {
      storeResults(mitoRoiId, result, taskJson, taskStartTime, authMngr, dvidMngr, assnMngr);
    }
  };

  const handleCompletedCheckbox = (event) => {
    handleTaskCompleted(event.target.checked);
  };

  const handleHelpOpen = () => { setHelpOpen(true); };
  const handleHelpClose = () => { setHelpOpen(false); };

  const handleKeyPress = (event) => {
    // Ignore keyboard shortcuts when a Neuroglancer text input has focus.
    if (activeElementNeedsKeypress()) {
      return;
    }

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
        handleTaskCompleted(true);
        if (!nextDisabled) {
          handleNextButton();
        }
      } else if (event.key === keyBindings.mitoCountInitialView.key) {
        handleInitialView();
      } else if (event.key === keyBindings.mitoCountIncrCount.key) {
        handleCountIncr();
      } else if (event.key === keyBindings.mitoCountDecrCount.key) {
        handleCountDecr();
      }
    }
  };

  const eventBindingsToUpdate = Object.entries(keyBindings).map((e) => [`key${e[1].key}`, `control+key${e[1].key}`]);
  const childrenWithMoreProps = React.Children.map(children, (child) => (
    React.cloneElement(child, { eventBindingsToUpdate }, null)
  ));

  return (
    <div
      className="mito-count-container"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className="mito-count-control-row">
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
        <Tooltip title={taskDocTooltip(taskJson, assnMngr)}>
          <Typography color="inherit">
            {taskDocString(taskJson, assnMngr)}
          </Typography>
        </Tooltip>

        <Typography
          className={classes.spaced}
          color="inherit"
        >
          {`Count: ${result >= 0 ? result : '?'}`}
          &nbsp;
        </Typography>
        <ButtonGroup variant="contained" color="primary" size="small">
          <Button color="primary" variant="contained" onClick={handleResultChange}>
            -
          </Button>
          <Button color="primary" variant="contained" onClick={handleResultChange}>
            +
          </Button>
          <Button color="primary" variant="contained" onClick={handleResultChange}>
            ?
          </Button>
        </ButtonGroup>

        <Select
          className={classes.spaced}
          value={todoType}
          onChange={handleTodoTypeSelect}
          disabled={noTask}
        >
          {TODO_TYPES.map((x) => (
            <MenuItem key={x.value} value={x.value}>
              {x.label}
            </MenuItem>
          ))}
        </Select>
        <FormControl className={classes.spaced} component="fieldset" disabled={noTask}>
          <FormControl variant="outlined" disabled={noTask}>
            <FormControlLabel
              label="Completed"
              control={<Checkbox checked={completed} onChange={handleCompletedCheckbox} name="completed" />}
            />
          </FormControl>
        </FormControl>
        <IconButton onClick={handleHelpOpen}>
          <HelpIcon />
        </IconButton>
        <ThemeProvider theme={dialogTheme}>
          <AuthManagerDialog open={authMngrDialogOpen} onClose={handleAuthManagerDialogClose} />
          <DvidManagerDialog manager={dvidMngr} open={dvidMngrDialogOpen} />
          <AssignmentManagerDialog manager={assnMngr} open={assnMngrLoading} />
          <ProtocolHelp
            title="Mitochondria Count Help"
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

MitoCount.propTypes = {
  actions: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MitoCount);
