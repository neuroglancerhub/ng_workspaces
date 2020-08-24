import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';
import Matches from './ImagePicker/Matches';
import MouseCoordinates from './ImagePicker/MouseCoordinates';
import { addAlert } from './actions/alerts';

const imageSliceUrlTemplate = 'https://tensorslice-bmcp5imp6q-uk.a.run.app/slice/<xyz>/256_256_1/jpeg?location=<location>';

const initialCoordinates = []; // [18416, 16369, 26467];

const useStyles = makeStyles({
  window: {
    width: '100%',
    margin: 'auto',
    height: '500px',
  },
  matches: {
    margin: '1em',
  },
});

// eslint-disable-next-line object-curly-newline
export default function ImagePicker({ actions, datasets, selectedDatasetName, children }) {
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];
  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const dispatch = useDispatch();
  const classes = useStyles();
  const [pickMode, setPickMode] = useState(0);
  const [mousePosition, setMousePosition] = useState(initialCoordinates);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mousePosition && mousePosition.length > 0 && user && dataset && projectUrl) {
      // clear the matches before loading the next set
      setIsLoading(true);
      setMatches([]);
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      const roundedPosition = mousePosition.map((point) => Math.floor(point));

      const signaturesUrl = `${projectUrl}/signatures/likelocation/${dataset.name}?x=${
        roundedPosition[0]
      }&y=${roundedPosition[1]}&z=${roundedPosition[2]}`;
      fetch(signaturesUrl, options)
        .then((result) => result.json())
        .then((data) => {
          if (data.matches) {
            setMatches(data.matches);
          }
          if (data.messsage) {
            dispatch(
              addAlert({
                message: data.messsage,
                duration: 3000,
              }),
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          console.error(error);
        });
    }
  }, [mousePosition, dataset, projectUrl, user, dispatch]);

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

  const childrenWithMoreProps = React.Children
    .map(children, (child) => React.cloneElement(child, { callbacks }, null));

  let imageRootUrl = '';

  if (dataset) {
    imageRootUrl = imageSliceUrlTemplate.replace(
      '<location>',
      dataset.location.replace('gs://', ''),
    );
  }

  return (
    <div>
      <Typography variant="h5">ImagePicker</Typography>
      <FormControl component="fieldset">
        <FormLabel component="legend">Pick Mode</FormLabel>
        <RadioGroup
          row
          aria-label="pick_mode"
          name="pick_mode"
          value={pickMode}
          onChange={handleChange}
        >
          <FormControlLabel value={0} control={<Radio />} label="Query by Example" />
          <FormControlLabel value={1} control={<Radio />} label="Apply Transfer Network" />
        </RadioGroup>
      </FormControl>
      <div className={classes.window}>{childrenWithMoreProps}</div>
      <div className={classes.matches}>
        <MouseCoordinates position={mousePosition} />
        { isLoading ? 'Loading' : (
          <Matches matches={matches} imageRootUrl={imageRootUrl} actions={actions} />
        )}
      </div>
    </div>
  );
}

ImagePicker.propTypes = {
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};
