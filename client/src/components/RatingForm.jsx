import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, MessageSquare, Edit } from 'lucide-react';

function RatingForm({ productId, onRatingSubmitted }) {
  const [open, setOpen] = useState(false);
  const [scentRating, setScentRating] = useState(0);
  const [longevityRating, setLongevityRating] = useState(0);
  const [effectivenessRating, setEffectivenessRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, open]);

  const loadUserRating = async () => {
    try {
      const response = await api.get(`/ratings/user/${productId}`);
      if (response.data) {
        setExistingRating(response.data);
        setScentRating(response.data.scentRating);
        setLongevityRating(response.data.longevityRating);
        setEffectivenessRating(response.data.effectivenessRating);
        setComment(response.data.comment || '');
      } else {
        // Reset if no existing rating
        setExistingRating(null);
        setScentRating(0);
        setLongevityRating(0);
        setEffectivenessRating(0);
        setComment('');
      }
    } catch (error) {
      // User hasn't rated yet - reset form
      setExistingRating(null);
      setScentRating(0);
      setLongevityRating(0);
      setEffectivenessRating(0);
      setComment('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (scentRating === 0 || longevityRating === 0 || effectivenessRating === 0) {
      setError('Vui lòng đánh giá tất cả các tiêu chí');
      return;
    }

    try {
      setLoading(true);
      await api.post('/ratings', {
        productId,
        scentRating,
        longevityRating,
        effectivenessRating,
        comment
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        onRatingSubmitted();
        if (!existingRating) {
          setScentRating(0);
          setLongevityRating(0);
          setEffectivenessRating(0);
          setComment('');
        }
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-0 bg-transparent border-0 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => onChange(star)}
            >
              <Star
                size={24}
                className={star <= value ? 'text-primary fill-primary' : 'text-muted-foreground fill-transparent'}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground font-medium">{value}/5</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          {existingRating ? (
            <>
              <Edit size={18} />
              Cập nhật đánh giá
            </>
          ) : (
            <>
              <MessageSquare size={18} />
              Viết đánh giá
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            {existingRating ? 'Cập nhật đánh giá của bạn' : 'Đánh giá sản phẩm'}
          </DialogTitle>
          <DialogDescription>
            Chia sẻ cảm nhận của bạn về sản phẩm này
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRating
            value={scentRating}
            onChange={setScentRating}
            label="Mùi hương"
          />
          <StarRating
            value={longevityRating}
            onChange={setLongevityRating}
            label="Độ lưu hương"
          />
          <StarRating
            value={effectivenessRating}
            onChange={setEffectivenessRating}
            label="Hiệu quả"
          />
          
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
            <Textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              className="resize-none"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                {existingRating ? 'Cập nhật đánh giá thành công!' : 'Đánh giá thành công!'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                existingRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RatingForm;

