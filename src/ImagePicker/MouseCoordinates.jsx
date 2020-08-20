import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import './MouseCoordinates.css';

export default function MouseCoordinates({ position }) {
  return (
    <div className="mousecoordinates">
      <Typography variant="body1" component="p">
        x:
        {position[0]}
      </Typography>
      <Typography variant="body1" component="p">
        y:
        {position[1]}
      </Typography>
      <Typography variant="body1" component="p">
        z:
        {position[2]}
      </Typography>
    </div>
  );
}

MouseCoordinates.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};
