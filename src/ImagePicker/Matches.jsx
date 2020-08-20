import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MouseCoordinates from './MouseCoordinates';
import './Matches.css';

export default function Matches({ matches, imageRootUrl, actions }) {
  function handleMatchSelect(point) {
    actions.setViewerCameraPosition(point);
  }

  const matchList = matches.map((match) => {
    const xyzString = `${match.point[0]}_${match.point[1]}_${match.point[2]}`;
    const imageUrl = imageRootUrl.replace('<xyz>', xyzString);
    return (
      <Grid className="matchSlice" item xs={12} md={3} key={match.point}>
        <MouseCoordinates position={match.point} />
        <img src={imageUrl} alt={xyzString} />
        <Button variant="outlined" color="primary" onClick={() => handleMatchSelect(match.point)}>
          View in Context
        </Button>
        <Typography variant="body1" component="p">
          Dist:
          {match.dist}
        </Typography>
        <Typography variant="body1" component="p">
          Score:
          {match.score}
        </Typography>
      </Grid>
    );
  });

  return (
    <Grid container spacing={3}>
      {matchList}
    </Grid>
  );
}

Matches.propTypes = {
  actions: PropTypes.object.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  imageRootUrl: PropTypes.string.isRequired,
};
