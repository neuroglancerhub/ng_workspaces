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
    width: '100%',
    margin: 'auto',
    height: '500px',
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
});

export default function Atlas(props) {
  const { children, actions, datasets } = props;
  const classes = useStyles();

  const [selectedAnnotation, setSelected] = useState(null);
  const [filterTerm, setFilterTerm] = useState(null);
  const [dsLookup, setDsLookup] = useState({});

  useEffect(() => {
    const datasetLookup = {};
    datasets.forEach((dataset) => {
      datasetLookup[dataset.name] = dataset;
    });
    setDsLookup(datasetLookup);
  }, [datasets]);

  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);

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
          source: `clio://${annotationsUrl}/${selectedDataset.name}?auth=neurohub`,
        },
      };

      actions.initViewer({
        dimensions: {
          x: [4e-9, 'm'],
          y: [4e-9, 'm'],
          z: [4e-9, 'm'],
        },
        position: selectedAnnotation.location,
        crossSectionScale: 2,
        layers,
        layout: 'xy',
        showSlices: true,
      });
    }
  }, [actions, selectedAnnotation, projectUrl, dsLookup]);

  return (
    <div>
      <div className={classes.header}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={2}>
            <Typography variant="h5">EM Atlas</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <AnnotationsFilter onChange={setFilterTerm} />
          </Grid>
          <Grid item xs={12} sm={2} />
          <Grid item xs={12} className={classes.list}>
            <AnnotationsList
              selected={selectedAnnotation || {}}
              onChange={setSelected}
              filterBy={filterTerm}
              datasets={dsLookup}
            />
          </Grid>
        </Grid>
      </div>
      {selectedAnnotation && (
        <>
          <p>
            Showing details for annotation {selectedAnnotation.title} in neuroglancer{' '}
            <Button variant="contained" color="primary" onClick={() => setSelected(null)}>
              Clear Selection
            </Button>
          </p>
          <div className={classes.window}>{children}</div>
        </>
      )}
    </div>
  );
}

Atlas.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
