import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';

function About() {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  return (
    <div className="about">
      <Typography variant="h5">About</Typography>
      <span>v{process.env.REACT_APP_VERSION}</span>
      {user && (
        <>
          <p>USER: {user.getBasicProfile().getName()}</p>
          <p>JWT: {user.getAuthResponse().id_token}</p>
        </>
      )}
    </div>
  );
}

export default About;
