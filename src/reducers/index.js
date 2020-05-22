import { combineReducers } from 'redux';

import user from './user';
import viewer from './viewer';
import alerts from './alerts';

export default combineReducers({
  user,
  viewer,
  alerts,
});
