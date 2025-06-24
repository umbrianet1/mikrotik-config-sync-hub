
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  syncOperations: [],
  activeSync: null,
  loading: false,
  error: null,
  syncWizard: {
    step: 1,
    masterRouter: null,
    slaveRouters: [],
    syncOptions: {
      addressLists: true,
      firewallRules: false,
    },
    previewData: null,
  },
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addSyncOperation: (state, action) => {
      state.syncOperations.unshift({
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
    setSyncWizardStep: (state, action) => {
      state.syncWizard.step = action.payload;
    },
    setSyncWizardMaster: (state, action) => {
      state.syncWizard.masterRouter = action.payload;
    },
    setSyncWizardSlaves: (state, action) => {
      state.syncWizard.slaveRouters = action.payload;
    },
    setSyncWizardOptions: (state, action) => {
      state.syncWizard.syncOptions = { ...state.syncWizard.syncOptions, ...action.payload };
    },
    setSyncWizardPreview: (state, action) => {
      state.syncWizard.previewData = action.payload;
    },
    resetSyncWizard: (state) => {
      state.syncWizard = {
        step: 1,
        masterRouter: null,
        slaveRouters: [],
        syncOptions: {
          addressLists: true,
          firewallRules: false,
        },
        previewData: null,
      };
    },
    setActiveSync: (state, action) => {
      state.activeSync = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  addSyncOperation,
  setSyncWizardStep,
  setSyncWizardMaster,
  setSyncWizardSlaves,
  setSyncWizardOptions,
  setSyncWizardPreview,
  resetSyncWizard,
  setActiveSync,
} = syncSlice.actions;

export default syncSlice.reducer;
