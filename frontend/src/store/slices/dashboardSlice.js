import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSpendingTrend = createAsyncThunk(
  'dashboard/fetchSpendingTrend',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getSpendingTrend(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary: null,
    spendingTrend: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch dashboard data';
      })
      // Fetch spending trend
      .addCase(fetchSpendingTrend.fulfilled, (state, action) => {
        state.spendingTrend = action.payload.data;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;