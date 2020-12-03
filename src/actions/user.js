import C from '../reducers/constants';

export default function setUserRoles(user) {
  return (dispatch, getState) => {
    const clioUrl = getState().clio.get('projectUrl');
    const rolesUrl = `${clioUrl}/roles`;
    const options = {
      headers: {
        Authorization: `Bearer ${user.getAuthResponse().id_token}`,
      },
    };
    return fetch(rolesUrl, options)
      .then((response) => response.json())
      .then((res) => dispatch({
        type: C.SET_USER_ROLES,
        roles: res,
      }));
  };
}

export function loginGoogleUser(user) {
  return (dispatch) => {
    dispatch(setUserRoles(user));
    dispatch({
      type: 'LOGIN_GOOGLE_USER',
      user,
    });
  };
}
