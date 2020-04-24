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
    const result = 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg';
    return (result);
  }

  segmentationSourceURL = () => {
    // TODO: Get this value from the proper UI.
    const result = 'dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation';
    return (result);
  }

  bodyIds = (bodyPoints) => {
    // TODO: Look up the body IDs using the body points.
    // DVID API: segmentation, a labelmap:
    // GET <api URL>/node/<UUID>/<data name>/label/<coord>[?queryopts]
    const p0 = bodyPoints[0];
    // eslint-disable-next-line no-unused-vars
    const coord0 = `${p0[0]}_${p0[1]}_${p0[2]}`;
    const p1 = bodyPoints[1];
    // eslint-disable-next-line no-unused-vars
    const coord1 = `${p1[0]}_${p1[1]}_${p1[2]}`;

    const fakeAssignmentKey = `${coord0}_${coord1}`;
    const fakeAssignmentBodies = {
      '10011_20011_30011_10012_20012_30012': ['191933097', '208299761'],
      '10021_20021_30021_10022_20022_30022': ['12885603', '178649151'],
      '10031_20031_30031_10032_20032_30032': ['970337', '206403180'],
    };
    const result = fakeAssignmentBodies[fakeAssignmentKey];
    return (result);
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
