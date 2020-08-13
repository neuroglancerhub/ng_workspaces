import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import DataSetSelection from './Settings/DataSetSelection';
import { addAlert } from './actions/alerts';

export default function Settings({
  project,
  datasets,
  setProject,
  selectedDatasetName,
  setSelectedDataset,
}) {
  const dispatch = useDispatch();

  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  const handleSave = () => {
    dispatch(addAlert({ message: 'Your settings have been saved', severity: 'success' }));
  };

  return (
    <Container maxWidth="md">
      <h3>Settings</h3>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          Enter Project Name:
        </Grid>
        <Grid item xs={12} sm={9}>
          <TextField
            id="project_name"
            name="project_name"
            onChange={handleProjectChange}
            value={project}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          Select Dataset to work on:
        </Grid>
        <Grid item xs={12} sm={9}>
          <DataSetSelection
            datasets={datasets}
            selected={selectedDatasetName}
            onChange={setSelectedDataset}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

Settings.propTypes = {
  project: PropTypes.string.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  setProject: PropTypes.func.isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  setSelectedDataset: PropTypes.func.isRequired,
};
