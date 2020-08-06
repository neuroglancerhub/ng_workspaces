import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import DatasetList from './Clio/DatasetList';
import './Clio.css';

const useStyles = makeStyles({
  window: {
    width: '90%',
    margin: 'auto',
    height: '500px',
  },
});

export default function Clio({ children, actions }) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const classes = useStyles();
  const [datasets, setDatasets] = useState({});
  const [selectedDataset, setSelectedDataset] = useState(null);

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
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      fetch('https://us-east4-flyem-private.cloudfunctions.net/clio_toplevel/datasets', options)
        .then((result) => result.json())
        .then((res) => setDatasets(res))
        .catch((err) => console.log(err));
    }
  }, [user, actions]);

  useEffect(() => {
    if (selectedDataset && datasets[selectedDataset]) {
      console.log(datasets[selectedDataset].location);
      actions.initViewer({
        layers: {
          grayscale: {
            type: 'image',
            source: `precomputed://${datasets[selectedDataset].location}`,
          },
        },
      });
    }
  }, [selectedDataset, actions, datasets]);

  return (
    <div className="clio">
      <p>Clio</p>
      {user && (
        <>
          <p>
            <span>Logged in as:</span>
            {user.getBasicProfile().getName()}
          </p>
          <pre>{user.getAuthResponse().id_token}</pre>
        </>
      )}
      <DatasetList datasets={datasets} onChange={setSelectedDataset} />
      <div className={classes.window}>{children}</div>
    </div>
  );
}

Clio.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};
