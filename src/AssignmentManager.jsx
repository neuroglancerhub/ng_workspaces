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

  taskIndex = 0;

  skippedTaskIndices = new Set();

  noValidTasks = false;

  // Public API

  // The `onTaskLoaded` function should return a promise, which evaluates to
  // `false` if the task specified by `taskJson()` should be skipped due to
  // protocol-specific reasons, or `true` if that task should proceed normally.
  init = (onTaskLoaded) => {
    this.onTaskLoaded = onTaskLoaded;
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
          this.next();
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
    const l = this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST].map((task, index) => (
      { ...task, index, completed: false }
    ));
    this.assignment[KEY_FOCUSED_PROOFREADING_ASSIGNMENT_TASK_LIST] = l;
    this.skippedTaskIndices.clear();
  };

  nextOrPrev = async (doNext) => {
    this.noValidTasks = false;
    const oldTaskIndex = this.taskIndex;
    do {
      this.taskIndex = doNext ? this.nextValidTaskIndex() : this.prevValidTaskIndex();
      if (this.taskIndex !== undefined) {
        // Disable the eslint error because `await` here is not for concurrency.
        // eslint-disable-next-line no-await-in-loop
        const valid = await this.onTaskLoaded(this);
        if (valid) {
          return;
        }
        this.skippedTaskIndices.add(this.taskIndex);
      } else {
        this.taskIndex = oldTaskIndex;
        break;
      }
    } while (this.taskIndex !== oldTaskIndex);
    this.noValidTasks = true;
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
