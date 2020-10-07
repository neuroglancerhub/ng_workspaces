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

  onAssignmentLoaded = undefined;

  onTaskLoaded = undefined;

  assignmentFile = undefined;

  assignment = {};

  taskIndex = 0;

  skippedTaskIndices = new Set();

  noValidTasks = false;

  addAlert = undefined;

  // Public API

  static get TASK_OK() { return ('OK'); }

  static get TASK_SKIP() { return ('SKIP'); }

  static get TASK_RETRY() { return ('RETRY'); }


  // The `onTaskLoaded` function should return a promise, which evaluates to
  // one of the following:
  // TASK_OK: the task specified by `taskJson()` has been loaded normally
  // TASK_SKIP: the task should be skipped for protocol-specific reasons
  // TASK_RETRY: an error occurred so the task has not been loaded but it
  // should be retried the next time the protocol asks for a task
  init = (onAssignmentLoaded, onTaskLoaded, addAlert) => {
    this.onAssignmentLoaded = onAssignmentLoaded;
    this.onTaskLoaded = onTaskLoaded;
    this.addAlert = addAlert;
  }

  load = (onLoadInteractionDone) => {
    this.onLoadInteractionDone = onLoadInteractionDone;
  }

  next = () => {
    this.nextOrPrev(true);
  }

  nextButtonDisabled = () => (
    this.noValidTasks || (this.nextValidTaskIndex() === undefined)
  )

  prev = () => {
    this.nextOrPrev(false);
  }

  prevButtonDisabled = () => (
    this.noValidTasks || (this.prevValidTaskIndex() === undefined)
  )

  taskJson = () => {
    const result = this.taskList()[this.taskIndex];
    return (result);
  }

  completedPercentage = () => {
    let numCompleted = 0;
    this.taskList().forEach((task) => {
      if (task.completed) {
        numCompleted += 1;
        this.skippedTaskIndices.delete(task.index);
      }
    });
    const frac = (numCompleted / (this.taskList().length - this.skippedTaskIndices.size));
    const percent = Math.round(100 * frac);
    return (percent);
  }

  // Internal

  loadJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!reader.error) {
        try {
          this.assignment = JSON.parse(event.target.result);
          this.initTaskList();
          this.taskIndex = -1;
          this.onAssignmentLoaded().then(() => { this.next(); });
        } catch (exc) {
          this.addAlert({ severity: 'error', message: `Assignment parsing failed: '${exc}'` });
        }
      } else {
        // TODO: Add error processing.
      }
    };
    this.assignmentFile = file.name;
    reader.readAsText(file);
  };

  onDialogClosed = () => {
    this.onLoadInteractionDone();
  }

  taskList = () => (
    this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST]
  );

  initTaskList = () => {
    const l = this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST].map((task, index) => (
      { ...task, index, completed: false }
    ));
    this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST] = l;
    this.skippedTaskIndices.clear();
  };

  nextOrPrev = async (doNext) => {
    this.noValidTasks = false;
    const startingTaskIndex = this.taskIndex;
    do {
      const oldTaskIndex = this.taskIndex;
      this.taskIndex = doNext ? this.nextValidTaskIndex() : this.prevValidTaskIndex();
      if (this.taskIndex !== undefined) {
        // Disable the eslint error because `await` here is not for concurrency.
        // eslint-disable-next-line no-await-in-loop
        const status = await this.onTaskLoaded(this);
        if (status !== AssignmentManager.TASK_SKIP) {
          if (status === AssignmentManager.TASK_RETRY) {
            this.taskIndex = oldTaskIndex;
          }
          return;
        }
        this.skippedTaskIndices.add(this.taskIndex);
      } else {
        this.taskIndex = startingTaskIndex;
        break;
      }
    } while (this.taskIndex !== startingTaskIndex);
    this.noValidTasks = true;
    this.addAlert({ severity: 'info', message: 'All tasks have been completed.' });
  }

  nextValidTaskIndex = () => {
    let index = this.taskIndex + 1;
    while (index < this.taskList().length) {
      if (!this.taskList()[index].completed) {
        return index;
      }
      index += 1;
    }
    return undefined;
  }

  prevValidTaskIndex = () => {
    let index = this.taskIndex - 1;
    while (index >= 0) {
      if (!this.taskList()[index].completed) {
        return index;
      }
      index -= 1;
    }
    return undefined;
  }
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
