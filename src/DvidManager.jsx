import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';

import { AuthManager } from './AuthManager';

const KEY_GRAYSCALE_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-GRAYSCALE-SOURCE';
const KEY_SEGMENTATION_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-SEGMENTATION-SOURCE';

export class DvidManager {
  onInitCompleted = undefined;

  grayscaleURL = 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg';

  segmentationURL = 'dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation';

  // For when the source URLs are available with the assignment.
  init = (grayscaleURL, segmentationURL) => {
    this.grayscaleURL = grayscaleURL;
    this.segmentationURL = segmentationURL;
  };

  // For when the user should enter the source URLs in a dialog.
  init = (onInitCompleted) => {
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
  }

  grayscaleSourceURL = () => (
    this.grayscaleURL
  )

  segmentationSourceURL = () => (
    this.segmentationURL
  )

  todosSourceURL = () => {
    const [server, node] = this.segmentationServerAndNode();
    if (server) {
      return (`${server}/${node}/neuroglancer_todo?usertag=true&auth=${AuthManager.tokenURL()}`);
    }
    return (undefined);
  }

  // Returns a promise, whose value is accessible with `.then((data) => { ... })`.
  getSparseVolSize = (bodyId, onError = this.defaultOnError) => {
    const url = `${this.segmentationAPIURL()}/sparsevol-size/${bodyId}`;
    return (fetch(url)
      .then((response) => {
        if (response.ok) {
          return (response.json());
        }
        const error = `Error status ${response.status} '${response.statusText}' ${url}`;
        onError(error);
        return ({});
      })
      .catch((error) => onError(error)));
  }

  // Returns a promise, whose value is accessible with `.then((id) => { ... })`.
  getBodyId = (bodyPt, onError = this.defaultOnError) => {
    if (bodyPt.length !== 3) {
      return new Promise((resolve) => { resolve(undefined); });
    }
    const key = `${bodyPt[0]}_${bodyPt[1]}_${bodyPt[2]}`;
    const url = `${this.segmentationAPIURL()}/label/${key}`;
    return (fetch(url)
      .then((response) => {
        if (response.ok) {
          return (response.json());
        }
        const error = `Error status ${response.status} '${response.statusText}' ${url}`;
        onError(error);
        return ({});
      })
      .then((json) => (json.Label))
      .catch((error) => onError(error)));
  };

  // TODO: Update to return a promise.
  postMerge = (bodyIdMergedOnto, bodyIdOther,
    onCompletion = this.defaultOnCompletion, onError = this.defaultOnError) => {
    const url = `${this.segmentationAPIURL()}/merge`;
    const body = [bodyIdMergedOnto, bodyIdOther];
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
    fetch(url, options).then((response) => response.json()).then((data) => onCompletion(data))
      .catch((error) => onError(error));
  }

  // TODO: Update to return a promise.
  postKeyValue = (instance, key, value,
    onCompletion = this.defaultOnCompletion, onError = this.defaultOnError) => {
    const url = `${this.segmentationAPIURL(instance)}/key/${key}`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    };
    fetch(url, options).then((response) => response).then((data) => onCompletion(data))
      .catch((error) => onError(error));
  }

  // Returns a promise, whose value is accessible with `.then((data) => { ... })`.
  getKeyValue = (instance, key, onError = this.defaultOnError) => {
    const url = `${this.segmentationAPIURL(instance)}/key/${key}`;
    return (fetch(url)
      .then((response) => {
        if (response.ok) {
          return (response.json());
        }
        if (response.status === 404) {
          // The key is not found, which is not really an error.
          return (undefined);
        }
        const error = `Error status ${response.status} '${response.statusText}' ${url}`;
        onError(error);
        return ({});
      })
      .catch((error) => onError(error)));
  }

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

  segmentationServerAndNode = () => {
    if (this.segmentationURL.startsWith('dvid')) {
      let url = this.segmentationURL;
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      const i1 = url.lastIndexOf('/');
      const i2 = url.lastIndexOf('/', i1 - 1);
      const server = url.substring(0, i2);
      const node = url.substring(i2 + 1, i1);
      return ([server, node]);
    }
    return ([undefined, undefined]);
  }

  segmentationAPIURL = (alternateInstance) => {
    if (this.segmentationURL.startsWith('dvid')) {
      const i = this.segmentationURL.indexOf('http');
      const url = this.segmentationURL.substring(i);
      const parts = url.split('/');
      const instance = alternateInstance || parts[4];
      return (`${parts[0]}//${parts[2]}/api/node/${parts[3]}/${instance}`);
    }
    return (undefined);
  }

  defaultOnCompletion = () => {}

  defaultOnError = (error) => {
    console.error(`DvidManager error: '${error}'`);
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
  const { manager, open } = props;

  const handleClose = () => {
    manager.onDialogClosed();
  };

  // TODO: Add proper UI.
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md" fullWidth disableEnforceFocus>
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
  open: PropTypes.bool.isRequired,
};
