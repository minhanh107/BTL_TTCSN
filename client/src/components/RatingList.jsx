import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Star, User } from 'lucide-react';

function RatingList({ ratings, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <Alert>
        <AlertDescription>Chưa có đánh giá nào</AlertDescription>
      </Alert>
    );
  }

  const StarDisplay = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground fill-transparent'}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating._id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {rating.userId?.name || rating.userId?.username || 'Người dùng'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Mùi hương:</span>
                <StarDisplay rating={rating.scentRating} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Độ lưu hương:</span>
                <StarDisplay rating={rating.longevityRating} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Hiệu quả:</span>
                <StarDisplay rating={rating.effectivenessRating} />
              </div>
            </div>

            {rating.comment && (
              <>
                <Separator className="my-4" />
                <p className="text-sm leading-relaxed">{rating.comment}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default RatingList;

