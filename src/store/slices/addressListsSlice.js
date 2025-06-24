
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  addressLists: {},
  loading: false,
  error: null,
  compareResults: null,
  filters: {
    name: '',
    address: '',
    list: '',
  },
};

const addressListsSlice = createSlice({
  name: 'addressLists',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAddressLists: (state, action) => {
      const { routerId, lists } = action.payload;
      state.addressLists[routerId] = lists;
    },
    addAddressList: (state, action) => {
      const { routerId, addressList } = action.payload;
      if (!state.addressLists[routerId]) {
        state.addressLists[routerId] = [];
      }
      state.addressLists[routerId].push({
        ...addressList,
        id: Date.now(),
      });
    },
    updateAddressList: (state, action) => {
      const { routerId, addressList } = action.payload;
      if (state.addressLists[routerId]) {
        const index = state.addressLists[routerId].findIndex(
          item => item.id === addressList.id
        );
        if (index !== -1) {
          state.addressLists[routerId][index] = addressList;
        }
      }
    },
    deleteAddressList: (state, action) => {
      const { routerId, addressListId } = action.payload;
      if (state.addressLists[routerId]) {
        state.addressLists[routerId] = state.addressLists[routerId].filter(
          item => item.id !== addressListId
        );
      }
    },
    setCompareResults: (state, action) => {
      state.compareResults = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  setAddressLists,
  addAddressList,
  updateAddressList,
  deleteAddressList,
  setCompareResults,
  setFilters,
} = addressListsSlice.actions;

export default addressListsSlice.reducer;
