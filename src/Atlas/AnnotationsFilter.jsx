import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  filterRoot: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
    margin: '0 auto',
  },
  filterInput: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export default function AnnotationsFilter({ term, onChange }) {
  const classes = useStyles();

  const handleClick = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Paper component="form" className={classes.filterRoot} onSubmit={handleClick}>
      <InputBase
        className={classes.filterInput}
        placeholder="Filter Annotations"
        inputProps={{ 'aria-label': 'filter annotations' }}
        onChange={handleChange}
        value={term}
      />
      <IconButton
        type="button"
        className={classes.iconButton}
        aria-label="search"
        onClick={handleClick}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

AnnotationsFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  term: PropTypes.string.isRequired,
};
