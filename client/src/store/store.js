import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice';
import attributeReducer from './slices/attributeSlice';

// Transform để exclude phone và address khỏi persisted user object
// Transform này chỉ áp dụng cho field 'user' trong auth state
const userTransform = createTransform(
  // transform state on its way to being serialized and persisted (inbound)
  // inboundState ở đây là giá trị của field 'user'
  (inboundState, key) => {
    if (inboundState && typeof inboundState === 'object') {
      // Loại bỏ phone và address trước khi persist
      const { phone, address, ...userWithoutSensitiveInfo } = inboundState;
      return userWithoutSensitiveInfo;
    }
    return inboundState;
  },
  // transform state being rehydrated (outbound)
  // outboundState ở đây là giá trị được lấy từ storage
  (outboundState, key) => {
    // Khi lấy ra từ storage, giữ nguyên (phone và address đã bị loại bỏ)
    return outboundState;
  },
  // define which reducers this transform gets called for
  { whitelist: ['user'] }
);

// Cấu hình persist cho auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Chỉ persist user, token, isAuthenticated
  transforms: [userTransform]
};

// Cấu hình persist cho cart
const cartPersistConfig = {
  key: 'cart',
  storage,
};

// Tạo persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Configure store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    products: productReducer,
    cart: persistedCartReducer,
    orders: orderReducer,
    categories: categoryReducer,
    attributes: attributeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Tạo persistor
export const persistor = persistStore(store);

