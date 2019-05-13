import React from 'react';
import  { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/">
          <Typography variant="h6" color="inherit">
            neurohub
          </Typography>
        </Link>
        <Typography variant="body1" color="inherit">
          select box for workspace
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
