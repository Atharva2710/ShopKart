import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { ArrowLeft, ShoppingCart, Tag, ShieldCheck, Truck, AlertTriangle, CheckCircle2, Heart, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, isInWishlist, toggleWishlist } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [addingCart, setAddingCart] = useState(false);
    const [savingWishlist, setSavingWishlist] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    const isSaved = isInWishlist(id);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProductById(id);
                if (response.data.success) {
                    setProduct(response.data.product);
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError(err.response?.data?.message || 'Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || product.stock === 0) return;

        setAddingCart(true);
        const result = await addToCart(product._id);
        setAddingCart(false);

        if (!result.success && result.message?.toLowerCase().includes('unauthorized')) {
            navigate('/login');
            return;
        }

        if (result.success) {
            setAddedToCart(true);
            setActionMessage('Added to cart successfully!');
            setTimeout(() => {
                setAddedToCart(false);
            }, 2500);
        } else {
            alert(result.message);
        }
    };

    const handleWishlistClick = async () => {
        if (!product) return;

        setSavingWishlist(true);
        const result = await toggleWishlist(product._id);
        setSavingWishlist(false);

        if (!result.success && result.message?.toLowerCase().includes('unauthorized')) {
            navigate('/login');
            return;
        }

        setActionMessage(result.message);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (loading) {
        return (
            <div className="detail-page-container">
                <div className="detail-card">
                    <div className="skeleton-img" style={{ height: '360px', borderRadius: '12px' }}></div>
                    <div className="detail-info-skeleton">
                        <div className="skeleton-line" style={{ width: '40%' }}></div>
                        <div className="skeleton-line" style={{ width: '80%', height: '28px' }}></div>
                        <div className="skeleton-line" style={{ width: '30%', height: '32px' }}></div>
                        <div className="skeleton-line" style={{ width: '100%', height: '60px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="empty-state-box">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3>Product Not Found</h3>
                <p>{error || 'The requested product does not exist.'}</p>
                <Link to="/products" className="btn-add-cart" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
                    Back to Products
                </Link>
            </div>
        );
    }

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(product.price);

    return (
        <div className="detail-page-container">
            {/* Back Link */}
            <Link to="/products" className="back-link">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Products</span>
            </Link>

            {/* Notification Toast */}
            {addedToCart && (
                <div className="toast-notification">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Success!</p>
                        <p style={{ fontSize: '12px', color: '#4b5563' }}>{actionMessage || `${product.name} updated.`}</p>
                    </div>
                </div>
            )}

            {/* Details Layout */}
            <div className="detail-card">
                {/* Product Image */}
                <div className="detail-img-box">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="detail-img"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80';
                        }}
                    />
                </div>

                {/* Info Container */}
                <div className="detail-info">
                    <div>
                        {/* Category & Stock Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span className="product-card-category">
                                {product.category}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: product.stock > 0 ? '#16a34a' : '#ef4444' }}>
                                {product.stock > 0 ? `${product.stock} units left` : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="detail-title">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="detail-price-row">
                            <span className="detail-price">
                                {formattedPrice}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>inclusive of all taxes</span>
                        </div>

                        {/* Description */}
                        <div className="detail-desc-box">
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>Description</h3>
                            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                                {product.description}
                            </p>
                        </div>

                        {/* Value props */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', fontSize: '12px', color: '#4b5563' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Truck className="w-4 h-4 text-indigo-600" />
                                <span>Free Express Delivery</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span>1-Year Official Warranty</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions: Add to Cart and Wishlist Toggle */}
                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={addingCart || product.stock === 0}
                            className="btn-add-cart"
                            style={{ padding: '12px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {addingCart ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleWishlistClick}
                            disabled={savingWishlist}
                            className={`btn-wishlist ${isSaved ? 'in-wishlist' : ''}`}
                            style={{ width: 'auto', padding: '12px 18px', fontSize: '14px' }}
                            title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                            {savingWishlist ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSaved ? (
                                <span><span className="heart-icon filled">♥</span> In Wishlist</span>
                            ) : (
                                <span><span className="heart-icon">♡</span> Wishlist</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
