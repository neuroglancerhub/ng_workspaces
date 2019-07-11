import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/styles';

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
      <p>ImagePicker - for user: {user.name}</p>
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
}

export default ImagePicker;
