
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { routerService } from '../../services/routerService';
import { routerAPI } from '../../services/routerAPI';

// Async thunks per operazioni PocketBase
export const fetchRouters = createAsyncThunk(
  'routers/fetchRouters',
  async (_, { rejectWithValue }) => {
    try {
      return await routerService.getRouters();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addRouterAsync = createAsyncThunk(
  'routers/addRouter',
  async (routerData, { rejectWithValue }) => {
    try {
      return await routerService.addRouter(routerData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRouterAsync = createAsyncThunk(
  'routers/updateRouter',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await routerService.updateRouter(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRouterAsync = createAsyncThunk(
  'routers/deleteRouter',
  async (routerId, { rejectWithValue }) => {
    try {
      await routerService.deleteRouter(routerId);
      return routerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setRouterAsMasterAsync = createAsyncThunk(
  'routers/setAsMaster',
  async (routerId, { rejectWithValue }) => {
    try {
      await routerService.setAsMaster(routerId);
      return routerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch routers
      .addCase(fetchRouters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouters.fulfilled, (state, action) => {
        state.loading = false;
        state.routers = action.payload;
      })
      .addCase(fetchRouters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add router
      .addCase(addRouterAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRouterAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.routers.push(action.payload);
      })
      .addCase(addRouterAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update router
      .addCase(updateRouterAsync.fulfilled, (state, action) => {
        const index = state.routers.findIndex(router => router.id === action.payload.id);
        if (index !== -1) {
          state.routers[index] = action.payload;
        }
      })
      // Delete router
      .addCase(deleteRouterAsync.fulfilled, (state, action) => {
        state.routers = state.routers.filter(router => router.id !== action.payload);
        delete state.connectionStatus[action.payload];
      })
      // Set as master
      .addCase(setRouterAsMasterAsync.fulfilled, (state, action) => {
        state.routers.forEach(router => {
          router.isMaster = router.id === action.payload;
        });
      });
  },
});

export const {
  setSelectedRouter,
  updateConnectionStatus,
  clearError,
} = routersSlice.actions;

export default routersSlice.reducer;
