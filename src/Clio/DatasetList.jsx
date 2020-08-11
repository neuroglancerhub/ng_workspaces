import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

export default function DatasetList({ datasets, onChange }) {
  function handleDatasetChange(dataset) {
    onChange(dataset);
  }

  /* eslint-disable react/jsx-one-expression-per-line */
  const listItems = Object.entries(datasets).map(([name, meta]) => (
    <li key={name}>
      <Button onClick={() => handleDatasetChange(name)}>{name}</Button> - {meta.description}
    </li>
  ));
  /* eslint-enable */

  return <ul>{listItems}</ul>;
}

DatasetList.propTypes = {
  datasets: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

DatasetList.defaultProps = {
  datasets: {},
};
