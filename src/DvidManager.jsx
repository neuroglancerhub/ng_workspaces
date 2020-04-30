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

  segmentationURL = 'https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation';

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
    const result = 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg';
    return (result);
  }

  segmentationSourceURL = () => {
    // TODO: Get this value from the proper UI.
    const result = `dvid://${this.segmentationURL}`;
    return (result);
  }

  segmentationAPIURL = () => {
    const parts = this.segmentationURL.split('/');
    return (`${parts[0]}//${parts[2]}/api/node/${parts[3]}/${parts[4]}`);
  }

  sparseVolSize = (bodyId, onCompletion) => {
    const url = `${this.segmentationAPIURL()}/sparsevol-size/${bodyId}`;
    fetch(url).then((response) => response.json()).then((data) => onCompletion(data));
  }

  bodyId = (bodyPt, onCompletion) => {
    const key = `${bodyPt[0]}_${bodyPt[1]}_${bodyPt[2]}`;
    const url = `${this.segmentationAPIURL()}/label/${key}`;
    fetch(url).then((response) => response.json()).then((data) => onCompletion(data.Label));
  };
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
  };

  // TODO: Add proper UI.
  return (
    <Dialog onClose={handleClose} open={manager.initialized === 1} disableEnforceFocus>
      <DialogTitle>Set Up DVID</DialogTitle>
      <DialogContent>
        <TextField label="Credentials" fullWidth />
        <TextField label="Server" fullWidth />
        <TextField label="UUID" fullWidth />
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
