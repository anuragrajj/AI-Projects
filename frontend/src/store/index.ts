import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { AnyAction } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use local storage for persistence
import { api as baseApi } from '../services/httpClient';
import AuthSlice from './slices/AuthSlice';
import LoaderSlice from './slices/LoaderSlice';

const persistConfig = {
   key: 'root',
   storage, // Use local storage
   whitelist: ['auth'],
};

const appReducer = combineReducers({
   auth: AuthSlice,
   loader: LoaderSlice,
   [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof appReducer>;

const rootReducer = (state: RootState | undefined, action: AnyAction) => {
   if (action.type === 'RESET_STORE') {
      state = undefined; // Resets the entire store
   }
   return appReducer(state, action);
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

export type AppDispatch = typeof _store.dispatch;

export const _persistorStore = persistStore(_store);
export default _store;
