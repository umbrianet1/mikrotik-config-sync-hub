
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  firewallRules: {},
  loading: false,
  error: null,
  compareResults: null,
  selectedChain: 'input',
};

const firewallSlice = createSlice({
  name: 'firewall',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFirewallRules: (state, action) => {
      const { routerId, rules } = action.payload;
      state.firewallRules[routerId] = rules;
    },
    addFirewallRule: (state, action) => {
      const { routerId, rule } = action.payload;
      if (!state.firewallRules[routerId]) {
        state.firewallRules[routerId] = [];
      }
      state.firewallRules[routerId].push({
        ...rule,
        id: Date.now(),
      });
    },
    updateFirewallRule: (state, action) => {
      const { routerId, rule } = action.payload;
      if (state.firewallRules[routerId]) {
        const index = state.firewallRules[routerId].findIndex(
          item => item.id === rule.id
        );
        if (index !== -1) {
          state.firewallRules[routerId][index] = rule;
        }
      }
    },
    deleteFirewallRule: (state, action) => {
      const { routerId, ruleId } = action.payload;
      if (state.firewallRules[routerId]) {
        state.firewallRules[routerId] = state.firewallRules[routerId].filter(
          item => item.id !== ruleId
        );
      }
    },
    reorderFirewallRules: (state, action) => {
      const { routerId, rules } = action.payload;
      state.firewallRules[routerId] = rules;
    },
    setCompareResults: (state, action) => {
      state.compareResults = action.payload;
    },
    setSelectedChain: (state, action) => {
      state.selectedChain = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setFirewallRules,
  addFirewallRule,
  updateFirewallRule,
  deleteFirewallRule,
  reorderFirewallRules,
  setCompareResults,
  setSelectedChain,
} = firewallSlice.actions;

export default firewallSlice.reducer;
