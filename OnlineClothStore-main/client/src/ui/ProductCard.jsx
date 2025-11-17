
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsFavourite(wishlist.some((p) => p._id === product._id));
  }, [product._id]);

  const handleFavourite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (wishlist.some((p) => p._id === product._id)) {
      wishlist = wishlist.filter((p) => p._id !== product._id);
      setIsFavourite(false);
    } else {
      wishlist.push(product);
      setIsFavourite(true);
      // Notify user via Web3Forms (frontend) — mirrors BecomeDeliveryPartner pattern.
      // Note: Web3Forms will send to the configured recipient; enable autoresponder in your Web3Forms dashboard
      // to email the end-user (the email provided below).
      (async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            toast.info('Added to wishlist. Log in to receive email notifications.');
            return;
          }

          // Try to fetch user's email from profile endpoint
          let userEmail = '';
          let userName = '';
          try {
            const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.ok) {
              const json = await profileRes.json().catch(() => null);
              const user = json?.data?.user || json?.data || null;
              if (user) {
                userEmail = user.email || '';
                userName = (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.fullName) || '';
              }
            }
          } catch (e) {
            console.warn('Failed to fetch profile for wishlist notify', e);
          }

          if (!userEmail) {
            // If email not available, prompt login or skip notify
            toast.info('Added to wishlist. Log in to receive email notifications.');
            return;
          }

          const formData = new FormData();
          // Use the same Web3Forms access_key as BecomeDeliveryPartner
          formData.append('access_key', '79b3efa6-70a9-44f7-848f-decfbd9dd944');
          formData.append('name', userName || userEmail);
          formData.append('email', userEmail);
          formData.append('subject', 'You added an item to your wishlist');
          formData.append('message', `You added ${typeof product.name === 'string' ? product.name : product._id} to your wishlist. View it here: ${window.location.origin}/product/${product._id}`);

          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            toast.success('Added to wishlist — notification email queued.');
          } else {
            // Try to parse JSON error for clearer debug info
            const body = await res.json().catch(async () => await res.text().catch(() => null));
            console.warn('Web3Forms notify failed', res.status, body);
            const msg = (body && (body.message || body.error)) || (typeof body === 'string' ? body : `status:${res.status}`);
            toast.warn('Added to wishlist. Notification failed: ' + msg);
          }
        } catch (err) {
          console.warn('Error notifying wishlist add via Web3Forms:', err);
          toast.success('Added to wishlist.');
        }
      })();
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlistChanged"));
  };

  return (
    <div className="bg-white rounded-lg  transition-shadow duration-200 overflow-hidden w-full max-w-sm mx-auto">
      <div className="relative">
        <img
          src={
            (product.image && typeof product.image === 'object' && product.image.url)
              ? product.image.url
              : (typeof product.image === 'string' && product.image.trim() !== ''
                ? product.image
                : "/placeholder.svg")
          }
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
          onError={e => { e.target.onerror = null; e.target.src = "/placeholder.svg"; }}
        />

        {/* TOP Badge */}
        <div
          className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 text-xs font-bold rounded bg-yellow-400 text-black shadow"
        >
          TOP
        </div>
        {/* Existing Badge (if any) */}
        {product.badge && (
          <div
            className={`absolute top-10 left-2 sm:top-12 sm:left-3 px-2 py-1 text-xs font-medium rounded ${
              product.badge === "NEW" ? "bg-green-400 text-white" : "bg-red-400 text-white"
            }`}
          >
            {product.badge}
          </div>
        )}

        {/* Heart Icon */}
        <button
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow ${isFavourite ? "text-red-500" : "text-gray-400"}`}
          onClick={handleFavourite}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavourite ? "text-red-500" : "text-gray-400"}`} fill={isFavourite ? "#ef4444" : "none"} />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-gray-800 font-medium mb-2 text-sm sm:text-base line-clamp-2">
          {product._id ? (
            <a
              href={`/product/${product._id}`}
              className="text-gray-900 hover:underline cursor-pointer"
              title={typeof product.name === 'string' ? product.name : undefined}
            >
              {typeof product.name === 'string' ? product.name : ''}
            </a>
          ) : (
            typeof product.name === 'string' ? product.name : ''
          )}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(product.price)}
          </span>
          {(!product.totalQuantity || product.totalQuantity === 0) && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-600 align-middle">Out of Stock</span>
          )}
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
