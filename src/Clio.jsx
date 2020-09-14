import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import './Neuroglancer.css';

// eslint-disable-next-line object-curly-newline
export default function Clio({ children, actions, datasets, selectedDatasetName }) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const dataset = datasets.filter((ds) => ds.name === selectedDatasetName)[0];
  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);

  useEffect(() => {
    if (dataset && user) {
      const annotationsUrl = projectUrl.replace(/\/clio_toplevel$/, '');
      const layers = {
        annotations: {
          type: 'annotation',
          source: `clio://${annotationsUrl}/${dataset.name}?auth=neurohub`,
        },
      };
      layers[dataset.name] = {
        type: 'image',
        source: `precomputed://${dataset.location}`,
      };

      if ('layers' in dataset) {
        dataset.layers.forEach((layer) => {
          layers.push({
            name: layer.name,
            type: layer.type,
            source: {
              url: layer.location,
            },
          });
        });
      }

      const viewerOptions = {
        layers,
        layout: '4panel',
        showSlices: true,
      };
      // because the initViewer action makes some assumptions about the dimensions
      // of the dataset, we have to check for the mb20 dataset and change the
      // dimensions used. This should ideally be fixed in the initViewer action or
      // the dimensions should be passed as part of the dataset object from the clio
      // backend.
      if (dataset.name === 'mb20') {
        viewerOptions.dimensions = {
          x: [4e-9, 'm'],
          y: [4e-9, 'm'],
          z: [4e-9, 'm'],
        };
      }

      actions.initViewer(viewerOptions);
    }
  }, [user, actions, dataset, projectUrl]);

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
