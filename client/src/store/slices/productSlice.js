import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch products with filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ filters = {}, page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      // Filter out null, undefined, and empty string values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== 'all') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString(),
        ...cleanFilters 
      });
      const response = await api.get(`/products?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Lỗi tải sản phẩm');
    }
  }
);

// Fetch single product
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Lỗi tải sản phẩm');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    filters: {
      category: null,
      brand: null,
      gender: null,
      origin: null,
      concentration: null,
      perfumer: null,
      scentGroup: null,
      style: null,
      minPrice: null,
      maxPrice: null,
      search: null
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        brand: null,
        gender: null,
        origin: null,
        concentration: null,
        perfumer: null,
        scentGroup: null,
        style: null,
        minPrice: null,
        maxPrice: null,
        search: null
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;

