import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export default function NewUserForm() {
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
