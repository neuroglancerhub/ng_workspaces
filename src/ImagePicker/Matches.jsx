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
    actions.setViewerCrossSectionScale(0.75);
  }

  const matchList = matches.map((match) => {
    const xyzString = `${match.point[0] - 128}_${match.point[1] - 128}_${match.point[2]}`;
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

  const keyboardText = navigator.appVersion.indexOf('Mac') ? 'option' : 'alt';

  const noMatches = (
    <div>
      <p>No matches found</p>
      <p>
        To locate matches use neuroglancer to navigate to  a region of interest and
        <span className="kbd">
          {keyboardText}
        </span>
        + &apos;click&apos; on the point you are interested in.
      </p>
    </div>
  );

  return (
    <Grid container spacing={3}>
      {matchList.length > 0 ? matchList : noMatches}
    </Grid>
  );
}

Matches.propTypes = {
  actions: PropTypes.object.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  imageRootUrl: PropTypes.string.isRequired,
};
