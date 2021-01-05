import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';

import { AuthManager } from './AuthManager';
import localStorageAvailable from './utils/storage';

const KEY_GRAYSCALE_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-GRAYSCALE-SOURCE';
const KEY_SEGMENTATION_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-SEGMENTATION-SOURCE';
const KEY_DVID_SOURCE = 'NG_WORKSPACES-FOCUSED-PROOFREADING-DVID-SOURCE';

const noInternet = (error) => ((error instanceof TypeError) && (error.message === 'Failed to fetch'));

export class DvidManager {
  onInitCompleted = undefined;

  // TODO: Consider changing "URL" to "Url" everywhere.

  grayscaleURL = 'dvid://https://flyem.dvid.io/ab6e610d4fe140aba0e030645a1d7229/grayscalejpeg';

  grayscaleDialogReadOnly = false;

  segmentationURL = 'dvid://https://flyem.dvid.io/d925633ed0974da78e2bb5cf38d01f4d/segmentation';

  segmentationDialogReadOnly = false;

  segmentationDialogLabel = 'Segmentation';

  segmentationServer = undefined;

  segmentationNode = undefined;

  segmentationInstance = undefined;

  // If empty, then the DVID API URL is derived from `segmentationURL`.
  dvidURL = '';

  dvidServer = undefined;

  dvidNode = undefined;

  // For when the source URLs are available with the assignment.
  init = (grayscaleURL, segmentationURL, dvidURL = '') => {
    this.grayscaleURL = grayscaleURL;
    this.segmentationURL = segmentationURL;
    this.dvidURL = dvidURL;
    this.setServerNodeInstance();
  };

  // For when the user should enter the source URLs in a dialog.
  initForDialog = (onInitCompleted, segmentationDialogLabel = 'Segmentation', grayscaleURL, segmentationURL) => {
    if (localStorageAvailable()) {
      // If localStorage is available, use it to remember the URLs across sessions.
      const g = localStorage.getItem(KEY_GRAYSCALE_SOURCE);
      this.grayscaleURL = grayscaleURL || g || this.grayscaleURL;
      const s = localStorage.getItem(KEY_SEGMENTATION_SOURCE);
      this.segmentationURL = segmentationURL || s || this.segmentationURL;
      const d = localStorage.getItem(KEY_DVID_SOURCE);
      this.dvidURL = d || this.dvidURL;
    }

    this.grayscaleDialogReadOnly = !!grayscaleURL;
    this.segmentationDialogReadOnly = !!segmentationURL;

    this.segmentationDialogLabel = segmentationDialogLabel;
    this.onInitCompleted = onInitCompleted;
  }

  grayscaleSourceURL = () => (
    this.grayscaleURL
  )

  segmentationSourceURL = () => (
    this.segmentationURL
  )

  dvidSourceURL = () => (
    this.dvidURL || `${this.dvidServer}/${this.dvidNode}`
  )

  todosSourceURL = () => {
    if (this.dvidServer) {
      return (`dvid://${this.dvidServer}/${this.dvidNode}/neuroglancer_todo?usertag=true&auth=${AuthManager.tokenURL()}`);
    }
    return (undefined);
  }

  static get NO_INTERNET() { return (0); }

  // Returns a promise, whose value is accessible with `.then((data) => { ... })`.
  getSparseVolSize = (bodyId, onError = this.defaultOnError) => {
    const url = `${this.segmentationApiURL()}/sparsevol-size/${bodyId}`;
    if (!url.startsWith('http')) {
      return new Promise((resolve) => { resolve(undefined); });
    }
    return (fetch(url)
      .then((response) => {
        if (response.ok) {
          return (response.json());
        }
        const error = `Error status ${response.status} '${response.statusText}' ${url}`;
        onError(error);
        return (undefined);
      })
      .catch((error) => {
        onError(error.message);
        return ((noInternet(error)) ? DvidManager.NO_INTERNET : undefined);
      }));
  }

  // Returns a promise, whose value is accessible with `.then((id) => { ... })`.
  getBodyId = (bodyPt, onError = this.defaultOnError) => {
    if ((bodyPt.length !== 3) || !this.segmentationApiURL().startsWith('http')) {
      return new Promise((resolve) => { resolve(undefined); });
    }
    const key = `${bodyPt[0]}_${bodyPt[1]}_${bodyPt[2]}`;
    const url = `${this.segmentationApiURL()}/label/${key}`;
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
      .catch((error) => {
        onError(error.message);
        return ((noInternet(error)) ? DvidManager.NO_INTERNET : undefined);
      }));
  };


  // TODO: Update to return a promise.
  postMerge = (bodyIdMergedOnto, bodyIdOther,
    onCompletion = this.defaultOnCompletion, onError = this.defaultOnError) => {
    const url = `${this.dvidApiURL('segmentation')}/merge`;
    const body = [bodyIdMergedOnto, bodyIdOther];
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
    fetch(url, options).then((response) => response.json()).then((data) => onCompletion(data))
      .catch((error) => onError(error.message));
  }

  // TODO: Update to return a promise.
  postKeyValue = (instance, key, value,
    onCompletion = this.defaultOnCompletion, onError = this.defaultOnError) => {
    const url = `${this.dvidApiURL(instance)}/key/${key}`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    };
    fetch(url, options).then((response) => response).then((data) => onCompletion(data))
      .catch((error) => onError(error.message));
  }

  // Returns a promise, whose value is accessible with `.then((data) => { ... })`.
  getKeyValue = (instance, key, onError = this.defaultOnError) => {
    const url = `${this.dvidApiURL(instance)}/key/${key}`;
    if (!url.startsWith('http')) {
      return new Promise((resolve) => { resolve(undefined); });
    }
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
      .catch((error) => {
        onError(error.message);
        return ((noInternet(error)) ? DvidManager.NO_INTERNET : undefined);
      }));
  }

  //

  onDialogClosed = () => {
    this.setServerNodeInstance();
    this.onInitCompleted();
  }

  onGrayscaleSourceChange = (event) => {
    this.grayscaleURL = event.target.value;
    if (localStorageAvailable()) {
      localStorage.setItem(KEY_GRAYSCALE_SOURCE, this.grayscaleURL);
    }
  }

  onSegmentationSourceChange = (event) => {
    this.segmentationURL = event.target.value;
    if (localStorageAvailable()) {
      localStorage.setItem(KEY_SEGMENTATION_SOURCE, this.segmentationURL);
    }
  }

  onDvidSourceChange = (event) => {
    this.dvidURL = event.target.value;
    if (localStorageAvailable()) {
      localStorage.setItem(KEY_DVID_SOURCE, this.dvidURL);
    }
  }

  setServerNodeInstance = () => {
    const [ds, dn] = DvidManager.serverNodeInstance(this.dvidURL || this.segmentationURL);
    [this.dvidServer, this.dvidNode] = [ds, dn];
    const [ss, sn, si] = DvidManager.serverNodeInstance(this.segmentationURL);
    [this.segmentationServer, this.segmentationNode, this.segmentationInstance] = [ss, sn, si];
    if (!this.segmentationURL.startsWith('dvid://')) {
      [this.segmentationServer, this.segmentationNode] = [this.dvidServer, this.dvidNode];
    }
  }

  static serverNodeInstance = (url) => {
    let x = url;
    if (x.startsWith('dvid://')) {
      x = url.substring(7);
    } else if (x.startsWith('precomputed://')) {
      x = url.substring(14);
    }
    x = x.replace('/#/repo', '');
    x = x.replace('/api/node', '');
    const parts = x.split('/');
    const server = `${parts[0]}//${parts[2]}`;
    const node = `${parts[3]}`;
    const instance = (parts[4]) ? `${parts[4]}` : 'segmentation';
    return ([server, node, instance]);
  }

  segmentationApiURL = () => {
    if (this.segmentationServer) {
      return (`${this.segmentationServer}/api/node/${this.segmentationNode}/${this.segmentationInstance}`);
    }
    return (undefined);
  }

  dvidApiURL = (instance) => {
    if (this.dvidServer) {
      return (`${this.dvidServer}/api/node/${this.dvidNode}/${instance}`);
    }
    return (undefined);
  }

  defaultOnCompletion = () => {}

  defaultOnError = (error) => {
    console.error(`DvidManager error: '${error}'`);
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
      <DialogTitle>Set Up Sources</DialogTitle>
      <DialogContent>
        <TextField
          label="Grayscale source URL"
          defaultValue={manager.grayscaleURL}
          fullWidth
          InputProps={{ readOnly: manager.grayscaleDialogReadOnly }}
          onChange={manager.onGrayscaleSourceChange}
        />
        <TextField
          label={`${manager.segmentationDialogLabel} source URL`}
          defaultValue={manager.segmentationURL}
          fullWidth
          InputProps={{ readOnly: manager.segmentationDialogReadOnly }}
          onChange={manager.onSegmentationSourceChange}
        />
        <TextField
          label={`DVID source URL (derived from ${manager.segmentationDialogLabel} source if blank)`}
          defaultValue={manager.dvidURL}
          fullWidth
          onChange={manager.onDvidSourceChange}
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
