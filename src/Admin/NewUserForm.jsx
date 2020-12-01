import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import config from '../config';

const { project } = config;

const formattedProject = project.toLowerCase().replace(/ /g, '-');

export default function NewUserForm({ onUpdate }) {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [userName, setUserName] = useState('');
  const [permissions, setPermissions] = useState('');

  const handleUserChange = (event) => {
    setUserName(event.target.value);
  };

  const handlePermissionsChange = (event) => {
    setPermissions(event.target.value);
  };
  const handleSubmit = () => {
    // TODO: validation
    // submit the data to the clio_toplevel/users end point.
    const clioUrl = `https://us-east4-${formattedProject}.cloudfunctions.net/${
      config.top_level_function
    }`;

    const usersUrl = `${clioUrl}/users`;

    const userSettings = {};
    userSettings[userName] = {
      clio_global: ['clio_general'],
    };

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.getAuthResponse().id_token}`,
      },
      body: JSON.stringify(userSettings),
    };

    fetch(usersUrl, options)
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        onUpdate(userSettings);
      });

    console.log('submitting the data');
  };

  return (
    <form noValidate autoComplete="off">
      <TextField
        id="username"
        required
        label="Email address"
        variant="outlined"
        value={userName}
        onChange={handleUserChange}
      />
      <TextField
        id="permissions"
        required
        label="Permissions"
        variant="outlined"
        value={permissions}
        onChange={handlePermissionsChange}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Create
      </Button>
    </form>
  );
}

NewUserForm.propTypes = {
  onUpdate: PropTypes.func.isRequired,
};
