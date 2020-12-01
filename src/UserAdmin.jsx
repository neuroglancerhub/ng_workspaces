import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import NewUserForm from './Admin/NewUserForm';
import config from './config';

const { project } = config;

// set general users url for use by the handler functions
const formattedProject = project.toLowerCase().replace(/ /g, '-');
const clioUrl = `https://us-east4-${formattedProject}.cloudfunctions.net/${
  config.top_level_function
}`;
const usersUrl = `${clioUrl}/users`;

const useStyles = makeStyles((theme) => ({
  error: {
    width: '90%',
    margin: `${theme.spacing(2)}px auto`,
  },
  userAdmin: {
    margin: theme.spacing(2),
  },
}));

function UserAdmin() {
  const classes = useStyles();
  const user = useSelector((state) => state.user.get('googleUser'), shallowEqual);
  const [userList, setUserList] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadState, setLoadState] = useState('preload');

  useEffect(() => {
    setLoadState('loading');
    if (user) {
      const options = {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().id_token}`,
        },
      };

      fetch(usersUrl, options)
        .then((result) => {
          if (result.status !== 200) {
            if (result.status === 403) {
              throw new Error('Not authorized.');
            }
            throw new Error('Server response failed');
          }
          return result.json();
        })
        .then((res) => {
          setUserList(res);
          setLoadState('loaded');
        })
        .catch((err) => {
          setErrorMsg(err.message);
          setLoadState('failed');
        });
    }
  }, [user]);

  const handleDelete = (userName) => {
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.getAuthResponse().id_token}`,
      },
      body: JSON.stringify([userName]),
    };
    fetch(usersUrl, options)
      .then((result) => result.text())
      .then((res) => {
        console.log(res);
        setUserList((prevList) => {
          const newList = { ...prevList };
          delete newList[userName];
          return newList;
        });
        console.log(`removed ${userName}`);
      });
  };

  function handleNewUser(userInfo) {
    setUserList((prevList) => {
      const newList = { ...prevList, ...userInfo };
      return newList;
    });
  }

  if (loadState === 'loading') {
    return (
      <div className="userAdmin">
        <Typography>Loading</Typography>
      </div>
    );
  }

  if (loadState === 'failed') {
    return (
      <div className={classes.error}>
        <Alert severity="error">Failed to load users list. {errorMsg}</Alert>
      </div>
    );
  }

  const users = Object.entries(userList).map(([name]) => (
    <TableRow key={name}>
      <TableCell>{name}</TableCell>
      <TableCell>{userList[name].clio_global.includes('admin') ? 'Admin' : 'General'}</TableCell>
      <TableCell>
        <Button onClick={() => handleDelete(name)}>Delete</Button> | <Button>Update</Button>
      </TableCell>
    </TableRow>
  ));

  return (
    <div className={classes.userAdmin}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5">User Admin</Typography>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12}>
          <NewUserForm onUpdate={(userInfo) => handleNewUser(userInfo)} />
        </Grid>
      </Grid>
    </div>
  );
}

export default UserAdmin;
