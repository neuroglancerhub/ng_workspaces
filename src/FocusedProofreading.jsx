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
  focusedProofreadingToggleBirdsEyeView: 'b',
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

const bodyColors = (bodyPts, result) => {
  if (result === RESULTS.MERGE) {
    return ({
      [bodyPts[0]]: COLOR_PRIMARY_BODY,
      [bodyPts[1]]: COLOR_PRIMARY_BODY,
    });
  }
  return ({
    [bodyPts[0]]: COLOR_PRIMARY_BODY,
    [bodyPts[1]]: COLOR_OTHER_BODY,
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
  const [normalPose, setNormalPose] = React.useState({});
  const [birdsEyePose, setBirdsEyePose] = React.useState({});

  React.useEffect(() => {
    const onDvidInitialized = () => {
      actions.setViewerGrayscaleSource(dvidMngr.grayscaleSourceURL());
      actions.setViewerSegmentationSource(dvidMngr.segmentationSourceURL());
    };
    dvidMngr.init(onDvidInitialized);
  }, [actions, dvidMngr]);

  const setupTask = React.useCallback(() => {
    const json = assnMngr.taskJson();
    setTaskJson(json);
    const [restoredResult, restoredCompleted] = restoreResults(json, dvidMngr);
    setResult(restoredResult);
    setCompleted(restoredCompleted);
    const segments = dvidMngr.bodyIds(bodyPoints(json));
    setBodyIds(segments);
    actions.setViewerSegments(segments);
    actions.setViewerSegmentColors(bodyColors(segments, result));
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

  const handleNextButton = () => {
    assnMngr.next();
  };

  const handlePrevButton = () => {
    assnMngr.prev();
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
        // TODO: Add calculation of the camera pose for the bird's eye view.
        // TODO: Rather than change the camera position (as in Neu3), changing "perspectiveZoom"
        // in the view state (to a bigger number, for more zoomed out) probably makes more sense
        // here.  That approach does not change what is in the grayscale views.
        const useBirdsEye = false;
        const pose = useBirdsEye ? birdsEyePose : normalPose;
        actions.setViewerNavigationPose(pose);
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onMeshLoaded = (id, layer, mesh) => {
    // TODO: If `id` is one of the task's bodies, use the vertices of `mesh` to compute
    // the bird's eye view camera pose.
    const normal = {
      position: {
        voxelSize: [8, 8, 8],
        voxelCoordinates: [7338.26953125, 7072, 4246.69140625],
      },
    };
    const birdsEye = normal;
    setNormalPose(normal);
    setBirdsEyePose(birdsEye);
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
