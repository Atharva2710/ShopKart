import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        cartLoading,
        cartError,
        subtotal,
        cartCount,
        updateQuantity,
        removeFromCart,
        fetchCart
    } = useCart();

    const [updatingId, setUpdatingId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;
        if (newQty > maxStock) {
            setActionError(`Cannot add more. Only ${maxStock} units available.`);
            setTimeout(() => setActionError(null), 3000);
            return;
        }

        setUpdatingId(productId);
        setActionError(null);
        const res = await updateQuantity(productId, newQty);
        setUpdatingId(null);

        if (!res.success) {
            setActionError(res.message);
            setTimeout(() => setActionError(null), 3000);
        }
    };

    const handleRemove = async (productId) => {
        setUpdatingId(productId);
        await removeFromCart(productId);
        setUpdatingId(null);
    };

    // 1. Loading State
    if (cartLoading && cartItems.length === 0) {
        return (
            <div className="products-page-container">
                <div className="products-page-header">
                    <h1 className="products-page-title">Shopping Cart</h1>
                    <p className="products-page-subtitle">Loading your cart items...</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="product-card" style={{ padding: '20px', height: '100px' }}>
                                <div className="skeleton-line" style={{ width: '60%' }}></div>
                                <div className="skeleton-line" style={{ width: '30%', marginTop: '12px' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Error State
    if (cartError && cartItems.length === 0) {
        return (
            <div className="empty-state-box">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3>Unable to Load Cart</h3>
                <p>{cartError}</p>
                <button onClick={fetchCart} className="btn-add-cart" style={{ width: 'auto', display: 'inline-block' }}>
                    Try Again
                </button>
            </div>
        );
    }

    // 3. Empty State
    if (cartItems.length === 0) {
        return (
            <div className="empty-state-box" style={{ maxWidth: '520px', marginTop: '60px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <ShoppingCart className="w-8 h-8" />
                </div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything yet. Explore our products catalog to find great items!</p>
                <Link to="/products" className="btn-add-cart" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
                    Browse Products
                </Link>
            </div>
        );
    }

    const formattedSubtotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(subtotal);

    return (
        <div className="products-page-container">
            {/* Action notification error */}
            {actionError && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            {/* Header */}
            <div className="products-page-header">
                <h1 className="products-page-title">Shopping Cart</h1>
                <p className="products-page-subtitle">Review items in your cart before checking out</p>
            </div>

            {/* Cart Layout: Items + Order Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 2 }}>
                    {cartItems.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        const isBusy = updatingId === product._id;
                        const itemSubtotal = product.price * item.quantity;
                        const formattedItemPrice = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                        }).format(product.price);
                        const formattedTotal = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                        }).format(itemSubtotal);

                        return (
                            <div
                                key={product._id}
                                className="product-card"
                                style={{ padding: '16px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
                            >
                                {/* Thumbnail + Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80';
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <span className="product-card-category">
                                            {product.category}
                                        </span>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '4px 0 2px 0' }}>
                                            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                            {formattedItemPrice} each
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Controls & Total */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {/* [-] Qty [+] */}
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                                        <button
                                            onClick={() => handleQuantityChange(product._id, item.quantity, -1, product.stock)}
                                            disabled={isBusy || item.quantity <= 1}
                                            style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Decrease quantity"
                                        >
                                            <Minus className="w-3.5 h-3.5 text-gray-600" />
                                        </button>

                                        <span style={{ width: '36px', textAlign: 'center', fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => handleQuantityChange(product._id, item.quantity, 1, product.stock)}
                                            disabled={isBusy || item.quantity >= product.stock}
                                            style={{ width: '32px', height: '32px', border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Increase quantity"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                                            {formattedTotal}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(product._id)}
                                        disabled={isBusy}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: '6px', borderRadius: '4px' }}
                                        title="Remove from cart"
                                    >
                                        <Trash2 className="w-4 h-4 hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary Sidebar */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="product-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', margin: 0 }}>
                            Order Summary
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Total Units</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{cartCount} items</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Subtotal</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{formattedSubtotal}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Shipping</span>
                                <span style={{ fontWeight: 600, color: '#16a34a' }}>FREE</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Taxes</span>
                                <span style={{ color: '#6b7280' }}>Included</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #e5e7eb', paddingTop: '14px', marginTop: '4px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Grand Total</span>
                                <span style={{ fontSize: '22px', fontWeight: 800, color: '#4f46e5' }}>
                                    {formattedSubtotal}
                                </span>
                            </div>
                        </div>

                        {/* Value propositions */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px', fontSize: '12px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Free Express Delivery on all orders</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                                <span>Secure Razorpay Encrypted Checkout</span>
                            </div>
                        </div>

                        {/* Proceed to Checkout Action */}
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-add-cart"
                            style={{ padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <Link to="/products" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
                                or Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
