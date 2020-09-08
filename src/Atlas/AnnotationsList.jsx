import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
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

const imageSliceUrlTemplate = 'https://tensorslice-bmcp5imp6q-uk.a.run.app/slice/<xyz>/256_256_1/jpeg?location=<location>';

export default function AnnotationsList({
  selected,
  onChange,
  filterBy,
  datasets,
}) {
  const [annotations, setAnnotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const classes = useStyles();
  const projectUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);

  const annotationsPerPage = selected ? 4 : 12;
  useEffect(() => {
    // load the annotations from an end point
    if (projectUrl) {
      const annotationsUrl = `${projectUrl}/atlas/all`;

      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      fetch(annotationsUrl, options)
        .then((result) => result.json())
        .then((data) => {
          setAnnotations(data);
        });
    }
  }, [projectUrl, user]);

  const handleClick = (annotation) => {
    onChange(annotation);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  let filteredAnnotations = annotations;
  if (filterBy) {
    // TODO: improve the regex creation so that people can use the filter
    // box in the same way they would expect it to work. This could generate
    // a lot of errors, so need to wrap in an ErrorBoundary.
    const re = new RegExp(filterBy);
    filteredAnnotations = annotations.filter((annotation) => re.test(annotation.title));
  }

  const pages = Math.ceil(filteredAnnotations.length / annotationsPerPage);
  const paginatedAnnotations = filteredAnnotations.slice(
    currentPage * annotationsPerPage - annotationsPerPage,
    currentPage * annotationsPerPage,
  );

  const annotationSelections = paginatedAnnotations
    // sort them so that the newest ones are first in the list.
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((annotation) => {
      const {
        title: name,
        dataset: dataSet,
        description,
        timestamp,
        location,
      } = annotation;

      let thumbnailUrl = '';
      const selectedDataSet = datasets[dataSet] || {};
      if (selectedDataSet && 'location' in selectedDataSet) {
        const datasetLocation = selectedDataSet.location.replace('gs://', '');
        const xyzString = `${location[0] - 128}_${location[1] - 128}_${location[2]}`;

        thumbnailUrl = imageSliceUrlTemplate.replace('<location>', datasetLocation).replace('<xyz>', xyzString);
      }

      const key = `${name}_${timestamp}`;
      return (
        <Grid key={key} item xs={12} sm={3}>
          <Card raised={selected === name} className={selected === name ? classes.selected : ''}>
            <CardActionArea onClick={() => handleClick(annotation)}>
              <CardMedia
                component="img"
                alt="x y slice around annotation"
                height="256"
                image={thumbnailUrl}
                title="x y slice around annotation"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {description || 'No description provided'}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  Dataset: {selectedDataSet.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="small" color="primary" onClick={() => handleClick(annotation)}>
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
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  filterBy: PropTypes.string,
  datasets: PropTypes.object.isRequired,
};

AnnotationsList.defaultProps = {
  filterBy: null,
};
