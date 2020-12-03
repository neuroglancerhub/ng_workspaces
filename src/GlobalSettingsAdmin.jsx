import React from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import setTopLevelFunction from './actions/clio';

export default function GlobalSettingsAdmin() {
  const dispatch = useDispatch();
  const clioUrl = useSelector((state) => state.clio.get('projectUrl'), shallowEqual);
  const handleTopLevelChange = (event) => {
    dispatch(setTopLevelFunction(event.target.value));
  };

  return (
    <div>
      <p>Global Settings</p>
      <form noValidate>
        <TextField
          id="top_level_url"
          onChange={handleTopLevelChange}
          label="Top Level URL"
          variant="outlined"
          fullWidth
          value={clioUrl}
        />
      </form>
    </div>
  );
}
