import C from '../reducers/constants';
import config from '../config';

const { project } = config;
const formattedProject = project.toLowerCase().replace(/ /g, '-');
const clioUrl = `https://us-east4-${formattedProject}.cloudfunctions.net/${
  config.top_level_function
}`;
const rolesUrl = `${clioUrl}/roles`;

export default function setUserRoles(user) {
  return (dispatch) => {
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
