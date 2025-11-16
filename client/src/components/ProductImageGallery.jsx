import { useState } from 'react';
import { cn } from '@/lib/utils';

function ProductImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || '');
  const [zoomStyle, setZoomStyle] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-surface rounded-lg border border-border">
        <p className="text-muted-foreground">Không có ảnh</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] border border-border rounded-lg overflow-hidden relative cursor-zoom-in bg-surface"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-full object-contain transition-transform duration-300"
          style={zoomStyle}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={cn(
                "relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all hover:opacity-80",
                selectedImage === img 
                  ? "border-primary ring-2 ring-primary ring-offset-2" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={img}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;

