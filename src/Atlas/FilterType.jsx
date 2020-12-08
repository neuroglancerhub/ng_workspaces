import React from 'react';
import PropTypes from 'prop-types';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';

export default function FilterType({ selected, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div>
      <FormControl style={{ width: '200px' }}>
        <InputLabel id="filterType-label">Filter type</InputLabel>
        <Select
          labelId="filterType-label"
          id="filterType"
          value={selected}
          onChange={handleChange}
          input={<Input />}
        >
          <MenuItem key="any" value="Title or description">Title or description</MenuItem>
          <MenuItem key="title" value="Title">Title</MenuItem>
          <MenuItem key="description" value="Description">Description</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

FilterType.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
