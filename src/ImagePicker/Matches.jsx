import React from 'react';
import PropTypes from 'prop-types';
import MouseCoordinates from './MouseCoordinates';

export default function Matches({ matches }) {
  const matchList = matches.map((match) => (
    <li key={match.point}>
      <MouseCoordinates position={match.point} />
      <p>
        Dist:
        {match.dist}
      </p>
      <p>
        Score:
        {match.score}
      </p>
    </li>
  ));

  return <ul>{matchList}</ul>;
}

Matches.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
};
