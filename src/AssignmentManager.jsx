import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';

// TODO: Add proper management of the current task and its JSON.
const fakeAssignment = [
  {
    'task type': 'focused merge',
    'body point 1': [7300, 7070, 4440],
    'body point 2': [7250, 7075, 4440],
  },
  {
    'task type': 'focused merge',
    'body point 1': [7500, 7070, 4140],
    'body point 2': [7500, 7070, 4100],
  },
  {
    'task type': 'focused merge',
    'body point 1': [7400, 7070, 4160],
    'body point 2': [7405, 7080, 4170],
  },
];
let fakeAssignmentIndex = 0;

export class AssignmentManager {
  onAssignmentLoaded = undefined;

  onTaskLoaded = undefined;

  init = (onTaskLoaded) => {
    this.onTaskLoaded = onTaskLoaded;
  }

  onDialogClosed = () => {
    this.onAssignmentLoaded();
    this.onTaskLoaded(this);
  }

  load = (onAssignmentLoaded) => {
    this.onAssignmentLoaded = onAssignmentLoaded;
    // TODO: Add proper management of the current task and its JSON.
    fakeAssignmentIndex = 0;
  }

  next = () => {
    // TODO: Add proper management of the current task and its JSON.
    fakeAssignmentIndex += 1;
    if (fakeAssignmentIndex === fakeAssignment.length) {
      fakeAssignmentIndex = 0;
    }

    this.onTaskLoaded(this);
  }

  prev = () => {
    // TODO: Add proper management of the current task and its JSON.
    fakeAssignmentIndex -= 1;
    if (fakeAssignmentIndex === -1) {
      fakeAssignmentIndex = fakeAssignment.length - 1;
    }

    this.onTaskLoaded(this);
  }

  taskJson = () => {
    // TODO: Add proper management of the current task and its JSON.
    const result = fakeAssignment[fakeAssignmentIndex];
    return (result);
  }
}

export function AssignmentManagerDialog(props) {
  const { manager, open } = props;

  const handleClose = () => {
    manager.onDialogClosed();
  };

  const [source, setSource] = React.useState('assignmentManager');

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  // TODO: Add proper UI.
  return (
    <Dialog onClose={handleClose} open={open} disableEnforceFocus>
      <DialogTitle>Load an Assignment</DialogTitle>
      <DialogContent>
        <FormControl>
          <RadioGroup value={source} onChange={handleSourceChange}>
            <FormControlLabel
              label="From assignment manager"
              control={<Radio />}
              value="assignmentManager"
            />
            <FormControlLabel
              label="From JSON"
              control={<Radio />}
              value="json"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AssignmentManagerDialog.propTypes = {
  manager: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
};
