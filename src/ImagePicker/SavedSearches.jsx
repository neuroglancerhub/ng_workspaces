import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import SearchCard from './SearchCard';
import config from '../config';

export default function SavedSearches({ dataset, actions }) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const clioUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const [savedSearches, setSavedSearches] = useState([]);

  // - load in the saved searches from the backend
  useEffect(() => {
    if (user && dataset) {
      const savedSearchesUrl = `${clioUrl}/savedsearches/${dataset.name}`; // dataset
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };
      fetch(savedSearchesUrl, options)
        .then((response) => response.json())
        .then((res) => {
          setSavedSearches(Object.values(res));
        })
        .catch((error) => console.log(error));
    }
  }, [user, clioUrl, dataset]);

  let imageRootUrl = '';

  if (dataset) {
    imageRootUrl = config.imageSliceUrlTemplate.replace(
      '<location>',
      dataset.location.replace('gs://', ''),
    );
  }

  const removeFromList = (point) => {
    const updatedSearches = savedSearches.filter((search) => {
      const locationKey = `${point[0]}_${point[1]}_${point[2]}`;
      return search.locationkey !== locationKey;
    });
    setSavedSearches(updatedSearches);
  };

  // - display them as a list of thumbnail cards with a link to show the
  // coordinates in the main view with the attached results.
  const formattedSearches = savedSearches.map((search) => (
    <Grid key={search.location} item sm={3}>
      <SearchCard
        search={search}
        imageRootUrl={imageRootUrl}
        actions={actions}
        dataset={dataset}
        onDelete={removeFromList}
      />
    </Grid>
  ));
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <p>Saved Searches</p>
      </Grid>
      {formattedSearches}
    </Grid>
  );
}

SavedSearches.propTypes = {
  dataset: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};
