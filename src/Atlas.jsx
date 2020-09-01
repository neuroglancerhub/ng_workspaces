import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AnnotationsList from './Atlas/AnnotationsList';

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
  },
});

export default function Atlas({ children, actions, datasets }) {
  const classes = useStyles();

  const [selected, setSelected] = useState(null);

  console.log(actions, datasets);

  useEffect(() => {
    if (selected) {
      // TODO: fetch the annotation information and display it in neuroglancer
      console.log(`fetching ${selected}`);
    }
  }, [selected]);

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h5">EM Atlas</Typography>
        <AnnotationsList selected={selected} onChange={setSelected} />
      </div>
      {selected && (
        <>
          <p>Showing details for annotation {selected} in the neuroglancer window</p>
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
