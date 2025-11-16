import { formatPrice } from '../utils/formatPrice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function VariantSelector({ variants, selectedVariantIndex, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {variants.map((variant, index) => (
          <Button
            key={index}
            variant={selectedVariantIndex === index ? 'default' : 'outline'}
            className={cn(
              "h-auto flex flex-col items-center justify-center px-4 py-3 min-w-[100px]",
              selectedVariantIndex === index && "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
            onClick={() => onSelect(index)}
          >
            <span className="font-semibold">{variant.volume}</span>
            <span className="text-xs opacity-90">{formatPrice(variant.price)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default VariantSelector;

