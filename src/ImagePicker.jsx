import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
});

export default function ImagePicker({
  actions,
  datasets,
  selectedDatasetName,
  children,
}) {
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const classes = useStyles();

  useEffect(() => {
    if (dataset) {
      actions.initViewer({
        layers: {
          grayscale: {
            type: 'image',
            source: `precomputed://${dataset.location}`,
          },
        },
        layout: 'xz',
        showSlices: true,
      });
    }
  }, [actions, dataset]);

  return (
    <div>
      <Typography variant="h5">ImagePicker</Typography>
      {user && (
        <p>
          logged in as:
          {user.getBasicProfile().getName()}
        </p>
      )}
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
