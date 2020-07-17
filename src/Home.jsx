import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';

function Home() {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);

  return (
    <div className="homepage">
      <Typography variant="h5">Homepage</Typography>
      <span>
        v
        {process.env.REACT_APP_VERSION}
      </span>
      {user && (
        <>
          <p>
            USER:
            {' '}
            {user.getBasicProfile().getName()}
          </p>
          <p>
            JWT:
            {' '}
            {user.getAuthResponse().id_token}
          </p>
        </>
      )}
    </div>
  );
}

export default Home;
