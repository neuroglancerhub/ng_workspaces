import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';

const KEY_GRAYSCALE_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-GRAYSCALE-SOURCE';
const KEY_SEGMENTATION_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-SEGMENTATION-SOURCE';

export class DvidManager {
  // TODO: Switch to an enum: 0 = not initialized, 1 = initializing, 2 = initialized.
  initialized = 0;

  onInitCompleted = undefined;

  grayscaleURL = 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg';

  segmentationURL = 'dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation';

  init = (onInitCompleted) => {
    if (this.initialized === 0) {
      if (this.localStorageAvailable()) {
        // If localStorage is available, use it to remember the URLs across sessions.
        const g = localStorage.getItem(KEY_GRAYSCALE_SOURCE);
        if (g) {
          this.grayscaleURL = g;
        }
        const s = localStorage.getItem(KEY_SEGMENTATION_SOURCE);
        if (s) {
          this.segmentationURL = s;
        }
      }
      this.onInitCompleted = onInitCompleted;
      this.initialized = 1;
    }
  }

  grayscaleSourceURL = () => (
    this.grayscaleURL
  )

  segmentationSourceURL = () => (
    this.segmentationURL
  )

  sparseVolSize = (bodyId, onCompletion) => {
    const url = `${this.segmentationAPIURL()}/sparsevol-size/${bodyId}`;
    fetch(url).then((response) => response.json()).then((data) => onCompletion(data));
  }

  bodyId = (bodyPt, onCompletion) => {
    const key = `${bodyPt[0]}_${bodyPt[1]}_${bodyPt[2]}`;
    const url = `${this.segmentationAPIURL()}/label/${key}`;
    fetch(url).then((response) => response.json()).then((data) => onCompletion(data.Label));
  };

  //

  onDialogClosed = () => {
    this.onInitCompleted();
  }

  onGrayscaleSourceChange = (event) => {
    this.grayscaleURL = event.target.value;
    if (this.localStorageAvailable()) {
      localStorage.setItem(KEY_GRAYSCALE_SOURCE, this.grayscaleURL);
    }
  }

  onSegmentationSourceChange = (event) => {
    this.segmentationURL = event.target.value;
    if (this.localStorageAvailable()) {
      localStorage.setItem(KEY_SEGMENTATION_SOURCE, this.segmentationURL);
    }
  }

  segmentationAPIURL = () => {
    const i = this.segmentationURL.indexOf('http');
    const url = this.segmentationURL.substring(i);
    const parts = url.split('/');
    return (`${parts[0]}//${parts[2]}/api/node/${parts[3]}/${parts[4]}`);
  }

  localStorageAvailable = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      const x = '__storage_test__';
      localStorage.setItem(x, x);
      localStorage.removeItem(x);
      return true;
    } catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22
        // Firefox
        || e.code === 1014
        // test name field too, because code might not be present
        // everything except Firefox
        || e.name === 'QuotaExceededError'
        // Firefox
        || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        // acknowledge QuotaExceededError only if there's something already stored
        && (localStorage && localStorage.length !== 0);
    }
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
    <Dialog onClose={handleClose} open={manager.initialized === 1} maxWidth="md" fullWidth disableEnforceFocus>
      <DialogTitle>Set Up DVID</DialogTitle>
      <DialogContent>
        <TextField
          label="Grayscale source URL"
          defaultValue={manager.grayscaleURL}
          fullWidth
          onChange={manager.onGrayscaleSourceChange}
        />
        <TextField
          label="Segmentation source URL"
          defaultValue={manager.segmentationURL}
          fullWidth
          onChange={manager.onSegmentationSourceChange}
        />
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
