import React from 'react';
import PropTypes from 'prop-types';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';

export default function DatasetFilter({ datasets, selected, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div>
      <FormControl style={{ width: '300px' }}>
        <InputLabel id="datasetFilter-label">Dataset Filter</InputLabel>
        <Select
          labelId="datasetFilter-label"
          id="datasetFilter"
          multiple
          value={selected}
          onChange={handleChange}
          input={<Input />}
        >
          {datasets.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

DatasetFilter.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  datasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
