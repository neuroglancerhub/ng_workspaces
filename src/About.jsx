import React from 'react';
import { useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { addMessage } from './actions/alerts';

function About() {
  const dispatch = useDispatch();

  const handleAlert = () => {
    dispatch(
      addMessage({
        message: 'this is an alert message, that must be dismissed',
      }),
    );
  };

  const handleInfo = () => {
    dispatch(
      addMessage({
        message: 'this is some information for quick display. Closes after 3 secs.',
        severity: 'info',
        duration: 3000,
      }),
    );
  };

  return (
    <div className="homepage">
      <Typography variant="h5">About</Typography>
      <Button onClick={handleAlert}>Alert</Button>
      <Button onClick={handleInfo}>Info</Button>
    </div>
  );
}

export default About;
