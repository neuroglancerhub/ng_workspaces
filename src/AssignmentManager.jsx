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

const KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST = 'task list';

export class AssignmentManager {
  onLoadInteractionDone = undefined;

  onTaskLoaded = undefined;

  assignment = {};

  assignmentIndex = 0;

  // Public API

  init = (onTaskLoaded) => {
    this.onTaskLoaded = onTaskLoaded;
  }

  load = (onLoadInteractionDone) => {
    this.onLoadInteractionDone = onLoadInteractionDone;
    this.assignmentIndex = 0;
  }

  next = () => {
    this.assignmentIndex += 1;
    if (this.assignmentIndex === this.taskList().length) {
      this.assignmentIndex = 0;
    }

    this.onTaskLoaded(this);
  }

  prev = () => {
    this.assignmentIndex -= 1;
    if (this.assignmentIndex === -1) {
      this.assignmentIndex = this.taskList().length - 1;
    }

    this.onTaskLoaded(this);
  }

  taskJson = () => {
    const result = this.taskList()[this.assignmentIndex];
    return (result);
  }

  taskIndexString = () => (
    this.taskList().length > 1 ? (this.assignmentIndex + 1).toString() : ''
  )

  // Internal

  loadJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!reader.error) {
        try {
          this.assignment = JSON.parse(event.target.result);
          this.initTaskList();
          this.onTaskLoaded(this);
        } catch (exc) {
          // TODO: Add error processing.
          console.log(`* Error loading assignment JSON: '${exc}' *`);
        }
      } else {
        // TODO: Add error processing.
      }
    };
    reader.readAsText(file);
  };

  onDialogClosed = () => {
    this.onLoadInteractionDone();
  }

  taskList = () => (
    this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST]
  );

  initTaskList = () => {
    const l = this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST].map((task) => (
      { ...task, completed: false }
    ));
    this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST] = l;
  };
}

export function AssignmentManagerDialog(props) {
  const { manager, open } = props;

  const [source, setSource] = React.useState('json');
  const [jsonInputRef, setJsonjsonInputRef] = React.useState(null);

  const handleClose = () => {
    if (source === 'json') {
      jsonInputRef.click();
    }
    manager.onDialogClosed();
  };

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  const handleJsonInputChange = () => {
    if (jsonInputRef.files.length === 1) {
      const file = jsonInputRef.files[0];
      manager.loadJsonFile(file);
    }
  };

  // TODO: Add proper UI.
  return (
    <div>
      <input
        id="jsonInput"
        type="file"
        accept=".json"
        ref={(ref) => { setJsonjsonInputRef(ref); }}
        style={{ display: 'none' }}
        onChange={handleJsonInputChange}
      />
      <Dialog onClose={handleClose} open={open} disableEnforceFocus>
        <DialogTitle>Load an assignment</DialogTitle>
        <DialogContent>
          <FormControl>
            <RadioGroup value={source} onChange={handleSourceChange}>
              <FormControlLabel
                label="From assignment['task list'] manager"
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
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AssignmentManagerDialog.propTypes = {
  manager: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
};
