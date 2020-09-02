import React, { useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';

import MouseCoordinates from './MouseCoordinates';

const keyboardText = navigator.appVersion.indexOf('Mac') ? 'option' : 'alt';
const noMatches = (
  <div>
    <p>No matches found</p>
    <p>
      To locate matches use neuroglancer to navigate to a region of interest and
      <span className="kbd">{keyboardText}</span>+ &apos;click&apos; on the point you are
      interested in.
    </p>
  </div>
);

export default function TransferResults({
  mousePosition,
  dataset,
  projectUrl,
  model,
}) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [isLoading, setIsLoading] = useState(0);
  const [resultLinks, dispatch] = useReducer((searchList, { type, value }) => {
    switch (type) {
      case 'init':
        return value;
      case 'add':
        return [...searchList, value];
      case 'remove':
        return searchList.filter((item) => item.id !== value);
      default:
        return searchList;
    }
  }, []);

  useEffect(() => {
    if (mousePosition && mousePosition.length > 0 && user && dataset && projectUrl) {
      const roundedPosition = mousePosition.map((point) => Math.floor(point));

      setIsLoading((i) => i + 1);

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
              coordinates: roundedPosition,
              ...result,
            };
            dispatch({ type: 'add', value: modifiedResult });
          }
          setIsLoading((i) => i - 1);
        });
    }
  }, [dataset, mousePosition, projectUrl, user, model]);

  const linksList = resultLinks.map((link) => (
    <li key={link.addr}>
      <MouseCoordinates position={link.coordinates} />
      <a href={link.addr}>View in Neuroglancer</a>
    </li>
  ));

  return (
    <div>
      <p>Transfer Results</p>
      {isLoading === 0 && linksList.length === 0 && noMatches}
      {isLoading > 0 && <CircularProgress />}
      <ul>{linksList}</ul>
    </div>
  );
}

TransferResults.propTypes = {
  mousePosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  dataset: PropTypes.object.isRequired,
  projectUrl: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
};
