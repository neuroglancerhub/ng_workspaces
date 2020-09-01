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

const annotationsPerPage = 4;

export default function AnnotationsList({ selected, onChange }) {
  const [annotations, setAnnotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const classes = useStyles();

  useEffect(() => {
    setAnnotations([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    console.info('loading the annotations list');
  }, []);

  console.log(annotations);

  const handleClick = (name) => {
    onChange(name);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const pages = Math.ceil(annotations.length / annotationsPerPage);

  const paginatedAnnotations = annotations.slice(
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
              height="140"
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
};
