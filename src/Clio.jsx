import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import './Neuroglancer.css';

// eslint-disable-next-line object-curly-newline
export default function Clio({ children, actions, datasets, selectedDatasetName }) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
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
      const layers = {};
      layers[dataset.name] = {
        type: 'image',
        source: `precomputed://${dataset.location}`,
      };

      actions.initViewer({
        layers,
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
      });
    }
  }, [actions, dataset]);

  if (dataset) {
    return (
      <div className="ng-container">
        {children}
      </div>
    );
  }
  return <div />;
}

Clio.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasetName: PropTypes.string.isRequired,
};
