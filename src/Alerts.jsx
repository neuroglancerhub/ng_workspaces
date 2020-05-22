import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { deleteMessage } from './actions/alerts';
import './Alerts.css';

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Alerts() {
  const alerts = useSelector((state) => state.alerts);
  const dispatch = useDispatch();

  const handleClose = (message) => {
    // remove the alert from the state.
    dispatch(deleteMessage(message));
  };

  const snacks = alerts.map((alert, i) => {
    const key = `${alert.message}_${i}`;
    return (
      <Snackbar
        key={key}
        open
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={alert.duration || null}
        onClose={() => handleClose(alert)}
      >
        <Alert onClose={() => handleClose(alert)} severity={alert.severity || 'error'}>
          {alert.message}
        </Alert>
      </Snackbar>
    );
  });

  return snacks;
}
