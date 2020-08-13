import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
});

// eslint-disable-next-line object-curly-newline
export default function ImagePicker({ actions, datasets, selectedDatasetName, children }) {
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];
  const classes = useStyles();
  const [pickMode, setPickMode] = useState(0);

  useEffect(() => {
    if (dataset) {
      actions.initViewer({
        layers: {
          grayscale: {
            type: 'image',
            source: `precomputed://${dataset.location}`,
          },
        },
        perspectiveZoom: 20,
        navigation: {
          zoomFactor: 8,
          pose: {
            position: {
              voxelSize: [8, 8, 8],
              voxelCoordinates: [7338.26953125, 7072, 4246.69140625],
            },
          },
        },
        layout: 'xz',
      });
    }
  }, [actions, dataset]);

  const handleChange = (event) => {
    setPickMode(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <Typography variant="h5">ImagePicker</Typography>
      <FormControl component="fieldset">
        <FormLabel component="legend">Pick Mode</FormLabel>
        <RadioGroup aria-label="pick_mode" name="pick_mode" value={pickMode} onChange={handleChange}>
          <FormControlLabel value={0} control={<Radio />} label="Query by Example" />
          <FormControlLabel value={1} control={<Radio />} label="Apply Transfer Network" />
        </RadioGroup>
      </FormControl>
      <div className={classes.window}>{children}</div>
      <p>
        Looking at location:
        {dataset && dataset.location}
      </p>
      <p>Other page content can go here - or use a Grid Layout to add a sidebar, etc.</p>
    </div>
  );
}

ImagePicker.propTypes = {
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};
