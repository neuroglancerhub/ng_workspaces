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
  const [mousePosition, setMousePosition] = useState([]);

  useEffect(() => {
    if (dataset) {
      console.log('reloading neuroglancer');
      actions.initViewer({
        layers: {
          grayscale: {
            type: 'image',
            source: `precomputed://${dataset.location}`,
          },
        },
        layout: 'xy',
      });
    }
  }, [actions, dataset]);

  const handleChange = (event) => {
    setPickMode(parseInt(event.target.value, 10));
  };

  const callbacks = [
    {
      name: 'coords',
      event: 'click0',
      function: (e) => {
        console.log(e.mouseState.position);
        setMousePosition([...e.mouseState.position]);
      },
    },
  ];


  const childrenWithMoreProps = React.Children.map(children, (child) => (
    React.cloneElement(child, { callbacks }, null)
  ));

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
      <div className={classes.window}>
        {childrenWithMoreProps}
      </div>
      <p>
        Looking at location:
        {dataset && dataset.location}
      </p>
      <p>Other page content can go here - or use a Grid Layout to add a sidebar, etc.</p>
      <p>
        x:
        {mousePosition[0]}
      </p>
      <p>
        y:
        {mousePosition[1]}
      </p>
      <p>
        z:
        {mousePosition[2]}
      </p>
    </div>
  );
}

ImagePicker.propTypes = {
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};
