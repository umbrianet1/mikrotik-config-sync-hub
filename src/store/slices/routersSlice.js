
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  routers: [],
  selectedRouter: null,
  connectionStatus: {},
  loading: false,
  error: null,
};

const routersSlice = createSlice({
  name: 'routers',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addRouter: (state, action) => {
      state.routers.push({
        ...action.payload,
        id: Date.now(),
        dateAdded: new Date().toISOString(),
      });
    },
    updateRouter: (state, action) => {
      const index = state.routers.findIndex(router => router.id === action.payload.id);
      if (index !== -1) {
        state.routers[index] = { ...state.routers[index], ...action.payload };
      }
    },
    deleteRouter: (state, action) => {
      state.routers = state.routers.filter(router => router.id !== action.payload);
      delete state.connectionStatus[action.payload];
    },
    setSelectedRouter: (state, action) => {
      state.selectedRouter = action.payload;
    },
    updateConnectionStatus: (state, action) => {
      const { routerId, status } = action.payload;
      state.connectionStatus[routerId] = {
        status,
        lastChecked: new Date().toISOString(),
      };
    },
    setRouterAsMaster: (state, action) => {
      // Reset all routers master status
      state.routers.forEach(router => {
        router.isMaster = false;
      });
      // Set selected router as master
      const router = state.routers.find(r => r.id === action.payload);
      if (router) {
        router.isMaster = true;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  addRouter,
  updateRouter,
  deleteRouter,
  setSelectedRouter,
  updateConnectionStatus,
  setRouterAsMaster,
} = routersSlice.actions;

export default routersSlice.reducer;
