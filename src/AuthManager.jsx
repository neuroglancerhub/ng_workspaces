import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@material-ui/core/Typography';

export class AuthManager {
  token = '';

  user = 'unknown';

  init = (onNotLoggedIn) => {
    this.getUser().then((result) => {
      if (result === 'unknown') {
        onNotLoggedIn();
      }
    });
  }

  getUser = () => {
    if (this.user === 'unknown') {
      if (this.token === '') {
        return (this.getToken().then((result) => {
          if (typeof result === 'string') {
            this.token = result;
            this.user = this.parseToken(this.token);
          }
          return new Promise((resolve) => { resolve(this.user); });
        }));
      }
      this.user = this.parseToken(this.token);
    }
    return new Promise((resolve) => { resolve(this.user); });
  }

  // Internal

  getToken = () => {
    const url = 'https://hemibrain-dvid2.janelia.org/api/server/token';
    const options = {
      credentials: 'include',
    };
    return (fetch(url, options)
      .then((response) => {
        if (response.ok) {
          return (response.text());
        }
        return ({});
      })
      .catch((error) => {
        console.log(`* Error getting login token: '${error} *`);
      }));
  }

  parseToken = (token) => {
    if (token !== '') {
      const tokenPart = token.split('.')[1];
      const tokenParsed = JSON.parse(window.atob(tokenPart));
      if (tokenParsed.user) {
        return (tokenParsed.user);
      }
      if (tokenParsed.email) {
        return (tokenParsed.email);
      }
    }
    return 'unknown';
  }
}

export function AuthManagerDialog(props) {
  const { open, onClose } = props;

  return (
    <Dialog onClose={onClose} open={open} disableEnforceFocus>
      <DialogTitle>Log In</DialogTitle>
      <DialogContent>
        <Typography color="inherit">
          Please log in at&nbsp;
          <a
            href="https://flyemlogin.janelia.org/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://flyemlogin.janelia.org/login
          </a>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AuthManagerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
