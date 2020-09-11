import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AnnotationsList from './Atlas/AnnotationsList';
import AnnotationsFilter from './Atlas/AnnotationsFilter';

const useStyles = makeStyles({
  window: {
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
  },
  matches: {
    margin: '1em',
  },
  header: {
    margin: '1em',
    flexGrow: 1,
  },
  list: {
    marginTop: '1em',
  },
  expand: {
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
  },
});

export default function Atlas(props) {
  const { children, actions, datasets } = props;
  const classes = useStyles();

  const [selectedAnnotation, setSelected] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [dsLookup, setDsLookup] = useState({});
  const [showList, setShowList] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);

  useEffect(() => {
    // load the annotations from an end point
    if (projectUrl) {
      setLoading(true);
      const annotationsUrl = `${projectUrl}/atlas/all`;

      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      fetch(annotationsUrl, options)
        .then((result) => result.json())
        .then((data) => {
          // sort them so that the newest ones are first in the list.
          const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
          setAnnotations(sorted);
          setLoading(false);
        });
    }
  }, [projectUrl, user]);


  useEffect(() => {
    const datasetLookup = {};
    datasets.forEach((dataset) => {
      datasetLookup[dataset.name] = dataset;
    });
    setDsLookup(datasetLookup);
  }, [datasets]);

  useEffect(() => {
    if (selectedAnnotation) {
      const selectedDataset = dsLookup[selectedAnnotation.dataset];
      const annotationsUrl = projectUrl.replace(/\/clio_toplevel$/, '');
      const layers = {
        [selectedDataset.name]: {
          type: 'image',
          source: `precomputed://${selectedDataset.location}`,
        },
        annotations: {
          type: 'annotation',
          source: `clio://${annotationsUrl}/${selectedDataset.name}?auth=neurohub&kind=atlas`,
        },
      };

      const viewerOptions = {
        position: selectedAnnotation.location,
        crossSectionScale: 2,
        layers,
        layout: 'xy',
        showSlices: true,
      };

      // because the initViewer action makes some assumptions about the dimensions
      // of the dataset, we have to check for the mb20 dataset and change the
      // dimensions used. This should ideally be fixed in the initViewer action or
      // the dimensions should be passed as part of the dataset object from the clio
      // backend.
      if (selectedDataset.name === 'mb20') {
        viewerOptions.dimensions = {
          x: [4e-9, 'm'],
          y: [4e-9, 'm'],
          z: [4e-9, 'm'],
        };
      }

      actions.initViewer(viewerOptions);
    }
  }, [actions, selectedAnnotation, projectUrl, dsLookup]);

  const handleClearSelection = () => {
    setSelected(null);
    setShowList(true);
  };

  return (
    <div className={classes.expand}>
      <div className={classes.header}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={2}>
            <Typography variant="h5">EM Atlas</Typography>
          </Grid>
          {showList && (
            <>
              <Grid item xs={12} sm={8}>
                <AnnotationsFilter term={filterTerm} onChange={setFilterTerm} />
              </Grid>
              <Grid item xs={12} sm={2} />
              <Grid item xs={12} className={classes.list}>
                <AnnotationsList
                  annotations={annotations}
                  loading={isLoading}
                  selected={selectedAnnotation || {}}
                  onChange={setSelected}
                  filterBy={filterTerm}
                  datasets={dsLookup}
                />
              </Grid>
            </>
          )}
          {selectedAnnotation && (
            <Grid item xs={12} sm={10}>
              <p>
                Showing details for annotation {selectedAnnotation.title} in neuroglancer{' '}
                <Button variant="contained" color="primary" onClick={handleClearSelection}>
                  Clear Selection
                </Button>{' '}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowList((current) => !current)}
                >
                  Toggle Annotation List
                </Button>
              </p>
            </Grid>
          )}
        </Grid>
      </div>

      {selectedAnnotation && <div className={classes.window}>{children}</div>}
    </div>
  );
}

Atlas.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
