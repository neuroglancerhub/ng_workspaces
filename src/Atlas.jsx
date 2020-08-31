import React from 'react';
import PropTypes from 'prop-types';

export default function Atlas({ children, actions, datasets }) {
  console.log(actions, datasets);
  return (
    <div>
      <p>EM atlas</p>
      {children}
    </div>
  );
}

Atlas.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
