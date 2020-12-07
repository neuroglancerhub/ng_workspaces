import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import MouseCoordinates from './MouseCoordinates';
import './Matches.css';

export default function SearchCard({ search, imageRootUrl, actions }) {
  const history = useHistory();
  function handleSelect(point) {
    actions.setViewerCameraPosition(point);
    actions.setViewerCrossSectionScale(0.75);
    actions.setMousePosition(point);
    history.push('/ws/image_search');
  }

  const xyzString = `${Math.max(0, search.location[0] - 128)}_${Math.max(
    0,
    search.location[1] - 128,
  )}_${Math.max(0, search.location[2])}`;
  const imageUrl = imageRootUrl.replace('<xyz>', xyzString);
  const savedOn = new Date(search.timestamp * 1000);
  const savedOnFormatted = savedOn.toLocaleDateString('en-US');
  return (
    <Card raised>
      <CardActionArea onClick={() => handleSelect(search.location)}>
        <CardMedia
          component="img"
          alt="match thumbnail"
          height="256"
          image={imageUrl}
          title="match thumbnail"
        />
        <CardContent>
          <MouseCoordinates position={search.location} />
          <Typography variant="body1" component="p">
            Dataset:
            {search.dataset}
          </Typography>
          <Typography variant="body1" component="p">
            Saved on: {savedOnFormatted}
          </Typography>
          <Typography variant="body1" component="p">
            Note: {search.note}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button variant="outlined" color="primary" onClick={() => handleSelect(search.location)}>
          Show Matches
        </Button>
      </CardActions>
    </Card>
  );
}

SearchCard.propTypes = {
  actions: PropTypes.object.isRequired,
  search: PropTypes.object.isRequired,
  imageRootUrl: PropTypes.string.isRequired,
};
