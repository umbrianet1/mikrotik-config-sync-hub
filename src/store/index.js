
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import routersSlice from './slices/routersSlice';
import addressListsSlice from './slices/addressListsSlice';
import firewallSlice from './slices/firewallSlice';
import syncSlice from './slices/syncSlice';
import backupSlice from './slices/backupSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    routers: routersSlice,
    addressLists: addressListsSlice,
    firewall: firewallSlice,
    sync: syncSlice,
    backup: backupSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
