import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';

function UserAdmin() {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  if (user) {
    console.log(user);
    // if they are not admin, then redirect to another page.
  }
  return (
    <div className="about">
      <Typography variant="h5">User Admin</Typography>
      <Typography>Users List</Typography>
      <Typography>Forms to add a new user</Typography>
      <Typography>Have edit / remove icons in user list.</Typography>
    </div>
  );
}

export default UserAdmin;
