import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch attributes by type or all
export const fetchAttributes = createAsyncThunk(
  'attributes/fetchAttributes',
  async (type = null, { rejectWithValue }) => {
    try {
      const url = type ? `/attributes?type=${type}` : '/attributes';
      const response = await api.get(url);
      return { type, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Lỗi tải thuộc tính');
    }
  }
);

const attributeSlice = createSlice({
  name: 'attributes',
  initialState: {
    byType: {
      brand: [],
      gender: [],
      origin: [],
      concentration: [],
      perfumer: [],
      scentGroup: []
    },
    all: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        if (action.payload.type) {
          state.byType[action.payload.type] = action.payload.data;
        } else {
          state.all = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default attributeSlice.reducer;

