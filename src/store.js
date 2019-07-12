import { configureStore } from "redux-starter-kit";
import rootReducer from "./reducers";
import thunk from "redux-thunk";

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk]
});

export default store;
