import React from 'react';
import PropTypes from 'prop-types';

export default function MouseCoordinates({ position }) {
  return (
    <div>
      <p>
        x:
        {position[0]}
      </p>
      <p>
        y:
        {position[1]}
      </p>
      <p>
        z:
        {position[2]}
      </p>
    </div>
  );
}

MouseCoordinates.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};
