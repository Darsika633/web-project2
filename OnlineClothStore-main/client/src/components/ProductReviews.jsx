import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';

const ProductReviews = ({ productId: propProductId }) => {
  const { id: paramProductId } = useParams();
  const productId = propProductId || paramProductId;
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  React.useEffect(() => {
    if (!productId) return;
    setLoadingReviews(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        } else if (data.success && data.data) {
          setReviews([data.data]);
        } else {
          setReviews([]);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [productId]);

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${interactive ? 'cursor-pointer' : ''} ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const token = localStorage.getItem('authToken') || '';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/api/reviews", {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId: productId,
          rating: reviewRating,
          title: reviewText.slice(0, 50),
          description: reviewText,
          name: reviewName,
          email: reviewEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitMessage({ type: "success", text: data.message || "Review submitted!" });
        setReviewRating(0);
        setReviewText("");
        setReviewName("");
        setReviewEmail("");
      } else {
        setSubmitMessage({ type: "error", text: data.message || "Failed to submit review." });
      }
    } catch {
      setSubmitMessage({ type: "error", text: "Failed to submit review." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reviews List - Left Side */}
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-500">No reviews yet.</div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <h4 
                      className="capitalize p-0"
                      style={{ 
                        color: 'rgb(0, 0, 0)',
                        font: '400 20px / 24px "Josefin Sans", sans-serif'
                      }}
                    >
                      {review.user?.firstName || review.name || 'Anonymous'}
                    </h4>
                    <span 
                      className="relative"
                      style={{ 
                        color: 'rgb(68, 68, 68)',
                        font: '16px / 27px Raleway, sans-serif',
                        background: 'rgb(255, 255, 255)'
                      }}
                    >
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <img 
                      src={review.user?.avatar?.url || "https://mollee-html-ten.vercel.app/assets/img/svg/review__red.svg"}
                      alt="Review"
                      className="w-5 h-5 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                <p 
                  className="relative"
                  style={{ 
                    color: 'rgb(68, 68, 68)',
                    font: '16px / 27px Raleway, sans-serif',
                    background: 'rgb(255, 255, 255)'
                  }}
                >
                  {review.description || review.comment}
                </p>
                {review.adminReply && (
                  <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <div className="text-xs text-green-700 mb-1 font-semibold">Admin reply:</div>
                    <div className="text-sm text-green-900">{review.adminReply.message}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Leave A Review Form - Right Side */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg h-fit">
          <h3 
            className="capitalize"
            style={{ 
              padding: '0px 0px 16px',
              font: '400 32px / 38px "Josefin Sans", sans-serif'
            }}
          >
            Leave A Review
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Write us your impressions of the purchase
          </p>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <div className="flex items-center space-x-1 mb-6">
                {renderStars(reviewRating, true, setReviewRating)}
              </div>
            </div>

            <div>
              <textarea
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm resize-none"
                placeholder="Enter your feedback"
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <input
                type="email"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            {submitMessage && (
              <div className={`mb-2 text-sm rounded px-3 py-2 ${submitMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {submitMessage.text}
              </div>
            )}
            <Button 
              type="submit"
              className="bg-black text-white hover:bg-gray-800 py-4 px-8 text-sm font-medium rounded-lg"
              disabled={submitting || !reviewRating || !reviewText.trim() || !reviewName.trim() || !reviewEmail.trim()}
            >
              {submitting ? "Posting..." : "Post A Review"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;