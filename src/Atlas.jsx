import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

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

export default function Atlas({ children, actions, datasets }) {
  const classes = useStyles();

  const [annotations, setAnnotations] = useState([]);
  const [selected, setSelected] = useState(null);

  console.log(actions, datasets);

  useEffect(() => {
    setAnnotations([]);
    console.info('loading the annotations list');
  }, []);

  useEffect(() => {
    setSelected(null);
  }, []);

  return (
    <div>
      <p>EM Atlas</p>
      <p>Search input to select the annotation to view</p>
      {annotations.length > 0 && <p>Show annotations list</p>}
      {selected && (
        <p>
          If an annotation is selected, then show the neuroglancer window with the annotation in
          view
        </p>
      )}
      <div className={classes.window}>{children}</div>
    </div>
  );
}

Atlas.propTypes = {
  children: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
