import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { Alert } from '@material-ui/lab';

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
        <Card raised>
          <CardActionArea onClick={() => handleMatchSelect(match.point)}>
            <CardMedia
              component="img"
              alt="match thumbnail"
              height="256"
              image={imageUrl}
              title="match thumbnail"
            />
            <CardContent>
              <MouseCoordinates position={match.point} />
              <Typography variant="body1" component="p">
                Distance:
                {match.dist}
              </Typography>
              <Typography variant="body1" component="p">
                Score:
                {match.score}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleMatchSelect(match.point)}
            >
              View in Context
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  const keyboardText = navigator.appVersion.indexOf('Mac') ? 'option' : 'alt';

  const noMatches = (
    <Alert severity="info" style={{ width: '100%' }}>
      No matches found - To locate matches use neuroglancer to navigate to a region
      of interest and <span className="kbd">{keyboardText}</span>+ &apos;click&apos;
      on the point you are interested in.
    </Alert>
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
