import { combineReducers } from 'redux';

import user from './user';
import viewer from './viewer';

export default combineReducers({
  user,
  viewer
});
