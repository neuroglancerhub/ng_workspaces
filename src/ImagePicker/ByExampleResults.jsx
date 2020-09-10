import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import { makeStyles } from '@material-ui/core/styles';
import { addAlert } from '../actions/alerts';

import Matches from './Matches';
import MouseCoordinates from './MouseCoordinates';

const useStyles = makeStyles({
  matchText: {
    textAlign: 'center',
  },
  pagination: {
    textAlign: 'right',
  },
});

const imageSliceUrlTemplate = 'https://tensorslice-bmcp5imp6q-uk.a.run.app/slice/<xyz>/256_256_1/jpeg?location=<location>';
const matchesPerPage = 8;

export default function ByExampleResults({
  mousePosition,
  dataset,
  projectUrl,
  actions,
}) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const dispatch = useDispatch();

  useEffect(() => {
    if (mousePosition && mousePosition.length > 0 && user && dataset && projectUrl) {
      // clear the matches before loading the next set
      setIsLoading(true);
      setMatches([]);
      setCurrentPage(1);
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      const roundedPosition = mousePosition.map((point) => Math.floor(point));

      const signaturesUrl = `${projectUrl}/signatures/likelocation/${dataset.name}?x=${
        roundedPosition[0]
      }&y=${roundedPosition[1]}&z=${roundedPosition[2]}`;
      fetch(signaturesUrl, options)
        .then((result) => result.json())
        .then((data) => {
          if (data.matches) {
            setMatches(data.matches);
          }
          if (data.messsage) {
            dispatch(
              addAlert({
                message: data.messsage,
                duration: 3000,
              }),
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          console.error(error);
        });
    }
  }, [mousePosition, dataset, projectUrl, user, dispatch]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const pages = Math.ceil(matches.length / matchesPerPage);

  const paginatedList = matches.slice(
    currentPage * matchesPerPage - matchesPerPage,
    currentPage * matchesPerPage,
  );

  let matchesText = '';
  if (matches.length > 0) {
    matchesText = `Matches ${currentPage * matchesPerPage - matchesPerPage + 1} - ${Math.min(
      currentPage * matchesPerPage,
      matches.length,
    )} of ${matches.length}`;
  }

  let imageRootUrl = '';

  if (dataset) {
    imageRootUrl = imageSliceUrlTemplate.replace(
      '<location>',
      dataset.location.replace('gs://', ''),
    );
  }

  return (
    <Grid container spacing={3}>
      {mousePosition && mousePosition.length > 0 && (
        <>
          <Grid item xs={12} md={4}>
            Viewing Matches for <MouseCoordinates position={mousePosition} />
          </Grid>
          <Grid item xs={12} md={4} className={classes.matchText}>
            {matchesText}
          </Grid>
          <Grid item xs={12} md={4} className={classes.pagination}>
            <Pagination count={pages} page={currentPage} onChange={handlePageChange} size="small" />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        {isLoading ? (
          'Loading'
        ) : (
          <Matches matches={paginatedList} imageRootUrl={imageRootUrl} actions={actions} />
        )}
      </Grid>
    </Grid>
  );
}

ByExampleResults.propTypes = {
  mousePosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  actions: PropTypes.object.isRequired,
  dataset: PropTypes.object.isRequired,
  projectUrl: PropTypes.string.isRequired,
};
