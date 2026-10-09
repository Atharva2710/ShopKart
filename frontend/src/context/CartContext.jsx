import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    getCart as apiGetCart,
    addToCart as apiAddToCart,
    updateCartQuantity as apiUpdateCartQuantity,
    removeFromCart as apiRemoveFromCart,
    getWishlist as apiGetWishlist,
    toggleWishlist as apiToggleWishlist,
    removeFromWishlist as apiRemoveFromWishlist
} from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Refresh Cart from server
    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        try {
            setCartLoading(true);
            setCartError(null);
            const res = await apiGetCart();
            if (res.data?.success) {
                setCartItems(res.data.cart || []);
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setCartError(err.response?.data?.message || 'Failed to load cart');
        } finally {
            setCartLoading(false);
        }
    }, [user]);

    // Refresh Wishlist from server
    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlistItems([]);
            return;
        }
        try {
            setWishlistLoading(true);
            const res = await apiGetWishlist();
            if (res.data?.success) {
                setWishlistItems(res.data.wishlist || []);
            }
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        } finally {
            setWishlistLoading(false);
        }
    }, [user]);

    // Synchronize on user login / logout
    useEffect(() => {
        if (user) {
            fetchCart();
            fetchWishlist();
        } else {
            setCartItems([]);
            setWishlistItems([]);
        }
    }, [user, fetchCart, fetchWishlist]);

    // Add product to cart
    const addToCart = useCallback(async (productId) => {
        try {
            const res = await apiAddToCart(productId);
            if (res.data?.success) {
                setCartItems(res.data.cart || []);
                return { success: true, message: res.data.message };
            }
            return { success: false, message: 'Could not update cart' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add product to cart';
            return { success: false, message: msg };
        }
    }, []);

    // Update quantity
    const updateQuantity = useCallback(async (productId, quantity) => {
        try {
            const res = await apiUpdateCartQuantity(productId, quantity);
            if (res.data?.success) {
                setCartItems(res.data.cart || []);
                return { success: true };
            }
            return { success: false, message: 'Could not update quantity' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update quantity';
            return { success: false, message: msg };
        }
    }, []);

    // Remove from cart
    const removeFromCart = useCallback(async (productId) => {
        try {
            const res = await apiRemoveFromCart(productId);
            if (res.data?.success) {
                setCartItems(res.data.cart || []);
                return { success: true };
            }
            return { success: false, message: 'Could not remove product' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to remove product';
            return { success: false, message: msg };
        }
    }, []);

    // Clear cart state (used after payment confirmation)
    const clearCartState = useCallback(() => {
        setCartItems([]);
    }, []);

    // Toggle Wishlist
    const toggleWishlist = useCallback(async (productId) => {
        try {
            const res = await apiToggleWishlist(productId);
            if (res.data?.success) {
                // Refresh wishlist items to ensure populated product objects
                const wRes = await apiGetWishlist();
                if (wRes.data?.success) {
                    setWishlistItems(wRes.data.wishlist || []);
                }
                return { success: true, saved: res.data.saved, message: res.data.message };
            }
            return { success: false, message: 'Could not toggle wishlist' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update wishlist';
            return { success: false, message: msg };
        }
    }, []);

    // Remove from Wishlist
    const removeFromWishlist = useCallback(async (productId) => {
        try {
            const res = await apiRemoveFromWishlist(productId);
            if (res.data?.success) {
                setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
                return { success: true };
            }
            return { success: false, message: 'Could not remove from wishlist' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to remove from wishlist';
            return { success: false, message: msg };
        }
    }, []);

    // Derived cart totals (subtotal and total unit count)
    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const price = item.product?.price || 0;
            return acc + price * (item.quantity || 1);
        }, 0);
    }, [cartItems]);

    const cartCount = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }, [cartItems]);

    const wishlistCount = useMemo(() => {
        return wishlistItems.length;
    }, [wishlistItems]);

    const wishlistIds = useMemo(() => {
        return new Set(wishlistItems.map((item) => item._id || item));
    }, [wishlistItems]);

    const isInWishlist = useCallback(
        (productId) => {
            return wishlistIds.has(productId);
        },
        [wishlistIds]
    );

    const value = {
        cartItems,
        cartLoading,
        cartError,
        subtotal,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
        fetchCart,
        wishlistItems,
        wishlistLoading,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
