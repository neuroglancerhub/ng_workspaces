import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';

export default function TransferResults({
  mousePosition,
  dataset,
  projectUrl,
  model,
}) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [resultLink, setResultLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mousePosition && mousePosition.length > 0 && user && dataset && projectUrl) {
      const roundedPosition = mousePosition.map((point) => Math.floor(point));

      setIsLoading(true);

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
      console.log(options, transferUrl);
      fetch(transferUrl, options)
        .then((resp) => resp.json())
        .then((result) => {
          if ('addr' in result) {
            setResultLink(result.addr);
          }
          setIsLoading(false);
        });
    }
  }, [dataset, mousePosition, projectUrl, user, model]);

  return (
    <div>
      <p>Transfer Results</p>
      {isLoading ? <p>Loading</p> : <a href={resultLink}>View in neuroglancer</a>}
    </div>
  );
}

TransferResults.propTypes = {
  mousePosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  dataset: PropTypes.object.isRequired,
  projectUrl: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
};
