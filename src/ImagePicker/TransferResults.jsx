import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import MouseCoordinates from './MouseCoordinates';

const keyboardText = navigator.appVersion.indexOf('Mac') ? 'option' : 'alt';
const noMatches = (
  <div>
    <p>No matches found</p>
    <p>
      To locate matches use neuroglancer to navigate to a region of interest and
      <span className="kbd">{keyboardText}</span>+ &apos;click&apos; on the point you are interested
      in.
    </p>
  </div>
);

const imageSliceUrlTemplate = 'https://tensorslice-bmcp5imp6q-uk.a.run.app/slice/<xyz>/256_256_1/jpeg?location=<location>';

export default function TransferResults({
  mousePosition,
  dataset,
  projectUrl,
  model,
}) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [resultLinks, dispatch] = useReducer((searchList, { type, value }) => {
    switch (type) {
      case 'init':
        return value;
      case 'add':
        return [...searchList, value];
      case 'update':
        return searchList.map((search) => {
          if (search.coords === value.coords) {
            return { ...search, ...value };
          }
          return search;
        });
      case 'remove':
        return searchList.filter((item) => item.coords !== value);
      default:
        return searchList;
    }
  }, []);

  useEffect(() => {
    if (mousePosition && mousePosition.length > 0 && user && dataset && projectUrl) {
      const roundedPosition = mousePosition.map((point) => Math.floor(point));

      dispatch({
        type: 'add',
        value: { coords: roundedPosition, model, loading: true },
      });

      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          dataset: dataset.name,
          model_name: model,
          center: roundedPosition,
        }),
      };

      const transferUrl = `${projectUrl}/transfer`;
      fetch(transferUrl, options)
        .then((resp) => resp.json())
        .then((result) => {
          if ('addr' in result) {
            const modifiedResult = {
              coords: roundedPosition,
              loading: false,
              ...result,
            };
            dispatch({ type: 'update', value: modifiedResult });
          }
        });
    }
  }, [dataset, mousePosition, projectUrl, user, model]);

  let imageRootUrl = '';

  if (dataset) {
    imageRootUrl = imageSliceUrlTemplate.replace(
      '<location>',
      dataset.location.replace('gs://', ''),
    );
  }

  // take a slice of the array before reversing it so that we don't change the
  // stored value of resultLinks.
  const linksList = resultLinks.slice().reverse().map((link) => {
    const { coords } = link;
    const xyzString = `${coords[0] - 128}_${coords[1] - 128}_${coords[2]}`;
    const imageUrl = imageRootUrl.replace('<xyz>', xyzString);
    return (
      <Grid item xs={12} md={3} key={link.coords}>
        <Card raised={!link.loading}>
          <CardActionArea
            href={link.addr}
            target="_blank"
            rel="noopener noreferrer"
            disabled={link.loading}
          >
            <CardMedia
              component="img"
              alt="transfer preview"
              height="256"
              image={imageUrl}
              title="transfer preview"
            />
            <CardContent>
              <MouseCoordinates position={coords} />
              <Typography variant="body2" color="textSecondary" component="p">
                Model: {link.model}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <Button
              variant="outlined"
              color="primary"
              href={link.addr}
              disabled={link.loading}
              target="_blank"
              startIcon={link.loading && <CircularProgress size={18} />}
              rel="noopener noreferrer"
            >
              View in Neuroglancer
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  const isLoading = Boolean(resultLinks.filter((item) => item.loading).length);

  return (
    <div>
      <Typography variant="h6">Transfer Results</Typography>
      {isLoading === 0 && linksList.length === 0 && noMatches}
      <Grid container spacing={3}>
        {linksList}
      </Grid>
    </div>
  );
}

TransferResults.propTypes = {
  mousePosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  dataset: PropTypes.object.isRequired,
  projectUrl: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
};
