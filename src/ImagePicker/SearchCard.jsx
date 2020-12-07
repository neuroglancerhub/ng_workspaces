import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';

import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import { addAlert } from '../actions/alerts';
import MouseCoordinates from './MouseCoordinates';

import './Matches.css';

export default function SearchCard({
  search,
  imageRootUrl,
  actions,
  dataset,
  onDelete,
}) {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const clioUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);

  function handleSelect(point) {
    actions.setViewerCameraPosition(point);
    actions.setViewerCrossSectionScale(0.75);
    actions.setMousePosition(point);
    history.push('/ws/image_search');
  }

  function handleDelete(point) {
    const xyz = `x=${point[0]}&y=${point[1]}&z=${point[2]}`;
    const savedSearchUrl = `${clioUrl}/savedsearches/${dataset.name}?${xyz}`;
    const options = {
      method: 'Delete',
      headers: {
        Authorization: `Bearer ${user.getAuthResponse().id_token}`,
      },
    };
    fetch(savedSearchUrl, options)
      .then((response) => {
        if (response.status === 200) {
          // remove from the list in SavedSearches component
          // so it is removed from the UI
          onDelete(point);
        } else {
          // show an error message to say it couldn't be deleted.
          dispatch(
            addAlert({
              message: 'Search removal failed',
              duration: 3000,
            }),
          );
        }
      })
      .catch((error) => console.log(error));
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
        <IconButton style={{ marginLeft: 'auto' }} onClick={() => handleDelete(search.location)}>
          <DeleteForeverIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

SearchCard.propTypes = {
  onDelete: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  dataset: PropTypes.object.isRequired,
  search: PropTypes.object.isRequired,
  imageRootUrl: PropTypes.string.isRequired,
};
