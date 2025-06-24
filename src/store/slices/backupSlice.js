
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  backups: {},
  loading: false,
  error: null,
  autoBackupEnabled: true,
};

const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addBackup: (state, action) => {
      const { routerId, backup } = action.payload;
      if (!state.backups[routerId]) {
        state.backups[routerId] = [];
      }
      state.backups[routerId].unshift({
        ...backup,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
    setBackups: (state, action) => {
      const { routerId, backups } = action.payload;
      state.backups[routerId] = backups;
    },
    deleteBackup: (state, action) => {
      const { routerId, backupId } = action.payload;
      if (state.backups[routerId]) {
        state.backups[routerId] = state.backups[routerId].filter(
          backup => backup.id !== backupId
        );
      }
    },
    setAutoBackup: (state, action) => {
      state.autoBackupEnabled = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  addBackup,
  setBackups,
  deleteBackup,
  setAutoBackup,
} = backupSlice.actions;

export default backupSlice.reducer;
