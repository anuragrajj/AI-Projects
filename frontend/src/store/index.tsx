import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use local storage for persistence

const rootReducer = combineReducers({
  // Add your reducers here
});

const persistConfig = {
  key: 'root',
  storage, // Use local storage
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const _store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware);
  },
});

export const _persistorStore = persistStore(_store);
export default _store;
