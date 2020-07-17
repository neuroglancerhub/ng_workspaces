import React from 'react';
import Typography from '@material-ui/core/Typography';

function Home() {
  return (
    <div className="homepage">
      <Typography variant="h5">Homepage</Typography>
      <span>
        v
        {process.env.REACT_APP_VERSION}
      </span>
    </div>
  );
}

export default Home;
