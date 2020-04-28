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
      {user && <p>{user.getBasicProfile().getName()}</p>}
    </div>
  );
}

export default Home;
