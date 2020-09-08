import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  selected: {
    border: '2px solid',
    borderColor: theme.palette.primary.main,
    background: 'rgba(143, 170, 143, 0.3)',
  },
}));

export default function AnnotationsList({ selected, onChange, filterBy }) {
  const [annotations, setAnnotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const classes = useStyles();

  const annotationsPerPage = selected ? 4 : 12;
  useEffect(() => {
    // TODO: load the annotations from an end point
    // sort them so that the newest ones are first in the list.
    // (will there be a date added field?)
    setAnnotations([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  }, []);

  const handleClick = (name) => {
    onChange(name);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  let filteredAnnotations = annotations;
  if (filterBy) {
    // TODO: improve the regex creation so that people can use the filter
    // box in the same way they would expect it to work. This could generate
    // a lot of errors, so need to wrap in an ErrorBoundary.
    const re = new RegExp(filterBy, 'g');
    filteredAnnotations = annotations.filter((annotation) => re.test(annotation));
    console.log(`filter annotations by ${filterBy}`);
  }

  const pages = Math.ceil(filteredAnnotations.length / annotationsPerPage);
  const paginatedAnnotations = filteredAnnotations.slice(
    currentPage * annotationsPerPage - annotationsPerPage,
    currentPage * annotationsPerPage,
  );

  const annotationSelections = paginatedAnnotations.map((annotation) => {
    const name = annotation;
    return (
      <Grid key={name} item xs={12} sm={3}>
        <Card raised={selected === name} className={selected === name ? classes.selected : ''}>
          <CardActionArea onClick={() => handleClick(name)}>
            <CardMedia
              component="img"
              alt="Contemplative Reptile"
              height="128"
              image="https://tensorslice-bmcp5imp6q-uk.a.run.app/slice/24344_16024_16728/256_128_1/jpeg?location=clio_mb20_raw_ng_r2_oldalign_7f8fc04a0929_v3/neuroglancer/jpeg"
              title="Contemplative Reptile"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                Annotation {name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Description text goes here.
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Data set.
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <Button size="small" color="primary" onClick={() => handleClick(name)}>
              View
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  return (
    <>
      <Pagination count={pages} page={currentPage} onChange={handlePageChange} size="small" />
      <Grid container spacing={3}>
        {annotationSelections}
      </Grid>
    </>
  );
}

AnnotationsList.propTypes = {
  selected: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  filterBy: PropTypes.string,
};

AnnotationsList.defaultProps = {
  filterBy: null,
};
