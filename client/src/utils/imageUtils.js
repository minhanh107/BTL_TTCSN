// Image utility functions for zoom and grid display
export const handleImageZoom = (imageUrl, event) => {
  // This can be enhanced with a library like react-image-zoom
  // For now, return the image URL for display
  return imageUrl;
};

export const getImageGridClass = (index, total) => {
  // Return CSS class for grid layout
  if (total === 1) return 'single-image';
  if (total === 2) return 'two-images';
  if (total <= 4) return 'four-images';
  return 'many-images';
};

