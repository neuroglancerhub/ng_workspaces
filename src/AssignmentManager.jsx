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

export class AssignmentManager {
  onTaskLoaded = undefined;

  loading = false;

  init = (onTaskLoaded) => {
    this.onTaskLoaded = onTaskLoaded;
  }

  onDialogClosed = () => {
    this.onTaskLoaded();
  }

  load = () => {
    this.loading = true;
    // TODO: Add proper management of the current task and its JSON.
  }

  next = () => {
    this.onTaskLoaded(this);
    // TODO: Add proper management of the current task and its JSON.
  }

  prev = () => {
    this.onTaskLoaded(this);
    // TODO: Add proper management of the current task and its JSON.
  }

  taskJson = () => {
    // TODO: Add proper management of the current task and its JSON.
    /* Old format:
    return ({
      'task type': 'body merge',
      'supervoxel ID 1': 123456,
      'supervoxel ID 2': 234567,
      'supervoxel point 1': [1, 1, 1],
      'supervoxel point 2': [2, 2, 2],
    });
    */
    const result = {
      'task type': 'focused merge',
      'body point 1': [12345, 23456, 34567],
      'body point 2': [12346, 23457, 34568],
    };
    return (result);
  }
}

export function AssignmentManagerDialog(props) {
  const { manager } = props;
  const [open, setOpen] = React.useState(manager.loading);

  const handleClose = () => {
    // It does NOT work to use `setOpen(false)`.  Since React state changes from state hooks
    // are asynchronous, `open` may still be false at this point.  So we would not get another
    // state change, which we need to force one more rendering, to make Dialog disappear.
    // Note that `open={manager.loading}`, below, is a necesary alternative to `open={open}`
    // for the same reason.  For more details, see:
    // https://linguinecode.com/post/why-react-setstate-usestate-does-not-update-immediately
    setOpen(!open);
    manager.loading = false;
    manager.onDialogClosed();
    // TODO: Add proper management of the current task and its JSON.
  };

  const [source, setSource] = React.useState('assignmentManager');

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  // TODO: Add proper UI.
  return (
    <Dialog onClose={handleClose} open={manager.loading} disableEnforceFocus>
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
};
