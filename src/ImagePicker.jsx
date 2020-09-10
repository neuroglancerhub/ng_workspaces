import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import ByExampleResults from './ImagePicker/ByExampleResults';
import TransferResults from './ImagePicker/TransferResults';

const initialCoordinates = []; // [24646, 15685, 17376];

const useStyles = makeStyles({
  window: {
    width: '100%',
    margin: 'auto',
    height: '500px',
  },
  header: {
    margin: '1em',
  },
  matches: {
    margin: '1em',
  },
});

// eslint-disable-next-line object-curly-newline
export default function ImagePicker({ actions, datasets, selectedDatasetName, children }) {
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];
  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const classes = useStyles();
  const [pickMode, setPickMode] = useState(0);
  const [transferModel, setTransferModel] = useState(0);
  const [mousePosition, setMousePosition] = useState(initialCoordinates);

  useEffect(() => {
    if (dataset) {
      console.log('reloading neuroglancer');
      const annotationsUrl = projectUrl.replace(/\/clio_toplevel$/, '');
      const layers = {
        [dataset.name]: {
          type: 'image',
          source: `precomputed://${dataset.location}`,
        },
        annotations: {
          type: 'annotation',
          source: `clio://${annotationsUrl}/${dataset.name}?auth=neurohub`,
        },
      };

      actions.initViewer({
        dimensions: {
          x: [4e-9, 'm'],
          y: [4e-9, 'm'],
          z: [4e-9, 'm'],
        },
        position: initialCoordinates,
        layers,
        layout: 'xy',
        showSlices: true,
      });
    }
  }, [actions, dataset, projectUrl]);

  const handleChange = (event) => {
    setPickMode(parseInt(event.target.value, 10));
  };

  const handleTransferChange = (event) => {
    setTransferModel(event.target.value);
  };

  const callbacks = [
    {
      name: 'coords',
      event: 'alt+click0',
      function: (e) => {
        actions.setViewerCameraPosition([...e.mouseState.position]);
        setMousePosition([...e.mouseState.position]);
      },
    },
  ];

  const childrenWithMoreProps = React.Children.map(
    children,
    (child) => React.cloneElement(child, { callbacks }, null),
  );

  let results = <p>Please select a dataset.</p>;

  if (dataset) {
    if (pickMode === 0) {
      results = (
        <ByExampleResults
          mousePosition={mousePosition}
          projectUrl={projectUrl}
          actions={actions}
          dataset={dataset}
        />
      );
    } else {
      results = (
        <TransferResults
          model={dataset.transfer[transferModel]}
          mousePosition={mousePosition}
          dataset={dataset}
          projectUrl={projectUrl}
        />
      );
    }
  }

  let modelSelect = '';

  if (pickMode === 1 && dataset && dataset.transfer) {
    const modelSelectItems = dataset.transfer.map((model, i) => (
      <MenuItem key={model} value={i}>
        {model}
      </MenuItem>
    ));

    modelSelect = (
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="transfer-model-label">Model</InputLabel>
        <Select
          labelId="transfer-model-label"
          id="transfer-model"
          value={transferModel}
          onChange={handleTransferChange}
          label="Model"
        >
          {modelSelectItems}
        </Select>
      </FormControl>
    );
  }

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h5">Image Search</Typography>
        {dataset && dataset.transfer && (
          <FormControl component="fieldset">
            <FormLabel component="legend">Pick Mode</FormLabel>
            <RadioGroup
              row
              aria-label="pick_mode"
              name="pick_mode"
              value={pickMode}
              onChange={handleChange}
            >
              <FormControlLabel
                value={0}
                control={<Radio color="primary" />}
                label="Query by Example"
              />
              <FormControlLabel
                value={1}
                control={<Radio color="primary" />}
                label="Apply Transfer Network"
              />
            </RadioGroup>
          </FormControl>
        )}
        {modelSelect}
      </div>
      <div className={classes.window}>{childrenWithMoreProps}</div>
      <div className={classes.matches}>{results}</div>
    </div>
  );
}

ImagePicker.propTypes = {
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};
