import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import DataSetSelection from './Settings/DataSetSelection';

export default function Settings({
  project,
  datasets,
  setProject,
  selectedDatasetName,
  setSelectedDataset,
}) {
  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  return (
    <div>
      <h3>Settings</h3>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          Enter Project Name:
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="project_name"
            name="project_name"
            onChange={handleProjectChange}
            value={project}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          Select Dataset to work on:
        </Grid>
        <Grid item xs={12} sm={6}>
          <DataSetSelection
            datasets={datasets}
            selected={selectedDatasetName}
            onChange={setSelectedDataset}
          />
        </Grid>
      </Grid>
    </div>
  );
}

Settings.propTypes = {
  project: PropTypes.string.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  setProject: PropTypes.func.isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  setSelectedDataset: PropTypes.func.isRequired,
};
