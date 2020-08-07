import React from 'react';
import PropTypes from 'prop-types';
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
      <TextField label="Enter Project Name" onChange={handleProjectChange} value={project} />
      <DataSetSelection
        datasets={datasets}
        selected={selectedDatasetName}
        onChange={setSelectedDataset}
      />
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
