import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';

const annotationsPerPage = 4;

export default function AnnotationsList({ selected, onChange }) {
  const [annotations, setAnnotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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
        <button type="button" onClick={() => handleClick(name)}>
          {selected === name && <p>Selected</p>}
          <p>Annotation {name}</p>
          <p>Show details and thumbnail</p>
        </button>
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
