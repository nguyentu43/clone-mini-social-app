import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import userReducer from './userSlider';
import loaderReducer from './loaderSlider';
import notiReducer from './notiSlider';
import routeStateReducer from './routeStateSlider';

export default configureStore({
  reducer: {
    loader: loaderReducer,
    user: userReducer,
    notifications: notiReducer,
    routeState: routeStateReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActionPaths: ['payload.lastLogin'],
    },
  }),
});
