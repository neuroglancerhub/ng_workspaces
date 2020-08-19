import { combineReducers } from 'redux';

import user from './user';
import viewer from './viewer';
import alerts from './alerts';
import clio from './clio';

export default combineReducers({
  user,
  viewer,
  alerts,
  clio,
});
