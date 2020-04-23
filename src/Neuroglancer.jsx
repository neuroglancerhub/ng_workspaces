import PropTypes from 'prop-types';
import React from 'react';

function Neuroglancer(props) {
  const { children } = props;
  return (
    <div className="ng-container">
      {children}
    </div>
  );
}

Neuroglancer.propTypes = {
  children: PropTypes.object.isRequired,
};

export default Neuroglancer;
