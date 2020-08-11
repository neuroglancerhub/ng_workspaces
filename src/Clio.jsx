import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import './Clio.css';

const useStyles = makeStyles({
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
});

export default function Clio({
  children,
  actions,
  datasets,
  selectedDatasetName,
}) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const classes = useStyles();
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];

  useEffect(() => {
    if (user) {
      actions.initViewer({
        dimensions: {
          x: [8e-9, 'm'],
          y: [8e-9, 'm'],
          z: [8e-9, 'm'],
        },
        position: [8302.3427734375, 8004.85791015625, 6288.146484375],
        crossSectionScale: 9.646558752809767,
        projectionScale: 2600,
        showSlices: true,
      });
    }
  }, [user, actions]);

  useEffect(() => {
    if (dataset) {
      console.log('adding layer to ng');
      actions.initViewer({
        layers: {
          grayscale: {
            type: 'image',
            source: `precomputed://${dataset.location}`,
          },
        },
      });
    }
  }, [actions, dataset]);

  return (
    <div className="clio">
      <p>Clio</p>
      {user && (
        <p>
          <span>Logged in as:</span>
          {user.getBasicProfile().getName()}
        </p>
      )}
      {dataset && (
        <p>
          <b>Dataset:</b>
          {dataset.name}
        </p>
      )}
      <div className={classes.window}>{children}</div>
    </div>
  );
}

Clio.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
};
