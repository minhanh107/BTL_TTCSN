// Config for Cloudinary and other utilities
export const config = {
  VITE_CLOUD_NAME: import.meta.env.VITE_CLOUD_NAME || '',
  VITE_CLOUD_UPLOAD_PRESET: import.meta.env.VITE_CLOUD_UPLOAD_PRESET || ''
};

