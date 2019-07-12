import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
}));

function ImagePicker(props) {
  const { user, children, location } = props;
  const classes = useStyles();

  return (
    <div>
      <h3>ImagePicker</h3>
      {user.get('loggedIn') && <p>logged in as: {user.get('userInfo').username}</p>}
      {!user.get('loggedIn') && <p>Not logged in.</p>}
      <div className={classes.window}>
        {children}
      </div>
      <p>Looking at location: {location.pathname}</p>
      <p>Other page content can go here - or use a Grid Layout to add a sidebar, etc.</p>
    </div>
  );
}

ImagePicker.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default ImagePicker;
