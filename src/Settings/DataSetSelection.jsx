import React from 'react';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export default function DataSetSelection({ datasets, onChange, selected }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  /* eslint-disable react/jsx-one-expression-per-line */
  const options = datasets.map((dataset) => (
    <MenuItem key={dataset.name} value={dataset.name}>
      {dataset.name} - {dataset.description}
    </MenuItem>
  ));
  /* eslint-enable */

  return (
    <Select onChange={handleChange} value={selected}>
      {options}
    </Select>
  );
}

DataSetSelection.propTypes = {
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
};
