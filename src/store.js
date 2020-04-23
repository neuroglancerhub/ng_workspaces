import { configureStore } from 'redux-starter-kit';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
});

export default store;
