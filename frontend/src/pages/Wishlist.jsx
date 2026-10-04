import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
    const {
        wishlistItems,
        wishlistLoading,
        removeFromWishlist,
        addToCart,
        fetchWishlist
    } = useCart();

    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemove = async (productId) => {
        setActionLoadingId(productId);
        const res = await removeFromWishlist(productId);
        setActionLoadingId(null);

        if (res.success) {
            setNotification('Removed from wishlist');
            setTimeout(() => setNotification(null), 2000);
        }
    };

    const handleMoveToCart = async (product) => {
        setActionLoadingId(product._id);
        const addRes = await addToCart(product._id);
        if (addRes.success) {
            await removeFromWishlist(product._id);
            setNotification(`Moved ${product.name} to Cart!`);
        } else {
            setNotification(addRes.message);
        }
        setActionLoadingId(null);
        setTimeout(() => setNotification(null), 2500);
    };

    // 1. Loading State
    if (wishlistLoading && wishlistItems.length === 0) {
        return (
            <div className="products-page-container">
                <div className="products-page-header">
                    <h1 className="products-page-title">My Wishlist</h1>
                    <p className="products-page-subtitle">Loading your saved items...</p>
                </div>
                <div className="products-grid">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="product-card skeleton-card">
                            <div className="skeleton-img"></div>
                            <div className="skeleton-body">
                                <div className="skeleton-line" style={{ width: '70%' }}></div>
                                <div className="skeleton-line" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. Empty State
    if (!wishlistLoading && wishlistItems.length === 0) {
        return (
            <div className="empty-state-box" style={{ maxWidth: '520px', marginTop: '60px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Heart className="w-8 h-8 fill-current" />
                </div>
                <h2>Your wishlist is empty</h2>
                <p>Save products you love and find them here later. Start exploring our rich catalog!</p>
                <Link to="/products" className="btn-add-cart" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="products-page-container">
            {/* Notification Toast */}
            {notification && (
                <div className="toast-notification">
                    <Heart className="w-5 h-5 text-red-500 fill-current shrink-0" />
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{notification}</p>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 className="products-page-title">My Wishlist</h1>
                    <p className="products-page-subtitle">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your collection
                    </p>
                </div>

                <Link to="/products" className="btn-wishlist" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none' }}>
                    Continue Shopping
                </Link>
            </div>

            {/* Wishlist Grid */}
            <div className="products-grid">
                {wishlistItems.map((product) => {
                    const isBusy = actionLoadingId === product._id;
                    const formattedPrice = new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                    }).format(product.price);

                    return (
                        <div key={product._id} className="product-card">
                            {/* Product Image */}
                            <div className="product-card-img-wrapper">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="product-card-img"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80';
                                    }}
                                />
                            </div>

                            {/* Details & Actions */}
                            <div className="product-card-body">
                                <div className="product-card-header">
                                    <h3 className="product-card-title" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <span className="product-card-category">
                                        {product.category}
                                    </span>
                                </div>

                                <div className="product-card-price">
                                    {formattedPrice}
                                </div>

                                <div className="product-card-stock">
                                    {product.stock > 0 ? `${product.stock} units left` : 'Out of Stock'}
                                </div>

                                <div className="product-card-actions">
                                    <button
                                        onClick={() => handleMoveToCart(product)}
                                        disabled={isBusy || product.stock === 0}
                                        className="btn-add-cart"
                                    >
                                        {isBusy ? 'Moving...' : 'Move to Cart'}
                                    </button>

                                    <button
                                        onClick={() => handleRemove(product._id)}
                                        disabled={isBusy}
                                        className="btn-wishlist in-wishlist"
                                    >
                                        <span><span className="heart-icon filled">♥</span> Remove from Wishlist</span>
                                    </button>

                                    <Link to={`/products/${product._id}`} className="view-details-link">
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Wishlist;
