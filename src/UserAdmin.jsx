import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import NewUserForm from './Admin/NewUserForm';
import config from './config';

const { project } = config;

function UserAdmin() {
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [userList, setUserList] = useState({});
  const [loadState, setLoadState] = useState('preload');

  useEffect(() => {
    setLoadState('loading');
    if (user) {
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      const formattedProject = project.toLowerCase().replace(/ /g, '-');

      const clioUrl = `https://us-east4-${formattedProject}.cloudfunctions.net/${
        config.top_level_function
      }`;

      const usersUrl = `${clioUrl}/users`;

      fetch(usersUrl, options)
        .then((result) => result.json())
        .then((res) => {
          setUserList(res);
          setLoadState('loaded');
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  if (loadState === 'loading') {
    return (
      <div className="userAdmin">
        <Typography>Loading</Typography>
      </div>
    );
  }

  const users = Object.entries(userList).map(([name]) => (
    <TableRow key={name}>
      <TableCell>{name}</TableCell>
      <TableCell>Admin?</TableCell>
      <TableCell>Delete | Update</TableCell>
    </TableRow>
  ));

  return (
    <div className="userAdmin">
      <Typography variant="h5">User Admin</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Permissions</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{users}</TableBody>
      </Table>
      <NewUserForm />
    </div>
  );
}

export default UserAdmin;
