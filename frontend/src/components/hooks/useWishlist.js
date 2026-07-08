import { useState, useCallback } from 'react';

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('af_wishlist') || '[]');
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(getWishlist);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem('af_wishlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return { wishlist, toggleWishlist, isWishlisted };
}
