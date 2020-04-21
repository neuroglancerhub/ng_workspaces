import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';

export class DvidManager {
  // TODO: Switch to an enum: 0 = not initialized, 1 = initializing, 2 = initialized.
  initialized = 0;
  onInitCompleted = undefined;

  init = (onInitCompleted) => {
    if (this.initialized === 0) {
      this.onInitCompleted = onInitCompleted;
      this.initialized = 1;  
    }
  }

  onDialogClosed = () => {
    this.onInitCompleted();
  }

  grayscaleSourceURL = () => {
    // TODO: Get this value from the proper UI.
    return ('');
  }

  segmentationSourceURL = () => {
    // TODO: Get this value from the proper UI.
    return ('');
  }

  bodyIds = (bodyPoints) => {
    // TODO: Look up the body IDs using the body points.
    return ([12345678, 23456789]);
  }
}

export function DvidManagerDialog(props) {
  const { manager } = props;
  const [open, setOpen] = React.useState(manager.initialized === 1);

  const handleClose = () => {
    // It does NOT work to use `setOpen(false)`.  Since React state changes from state hooks
    // are asynchronous, `open` may still be false at this point.  So we would not get another
    // state change, which we need to force one more rendering, to make Dialog disappear.
    // Note that `open={manager.initialized === 1}`, below, is a necesary alternative to 
    // `open={open}` for the same reason.  For more details, see:
    // https://linguinecode.com/post/why-react-setstate-usestate-does-not-update-immediately
    setOpen(!open);
    manager.initialized = 2;
    manager.onDialogClosed();
  }

  // TODO: Add proper UI.
  return (
    <Dialog onClose={handleClose} open={manager.initialized === 1} disableEnforceFocus>
      <DialogTitle>Set Up DVID</DialogTitle>
      <DialogContent>
        <TextField label='Credentials' fullWidth />
        <TextField label='Server' fullWidth />
        <TextField label='UUID' fullWidth />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DvidManagerDialog.propTypes = {
  manager: PropTypes.object.isRequired,
};
