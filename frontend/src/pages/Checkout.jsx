import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, AlertCircle, Loader2, Lock, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, subtotal, cartCount, clearCartState } = useCart();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
    const [serverError, setServerError] = useState(null);

    // If cart is empty, redirect to cart page
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: null }));
        }
        if (serverError) setServerError(null);
    };

    const validateForm = () => {
        const errors = {};
        if (!shippingAddress.fullName.trim()) errors.fullName = 'Full Name is required';
        if (!shippingAddress.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim().replace(/\s+/g, ''))) {
            errors.phone = 'Must be a valid 10-digit mobile number';
        }

        if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = 'Address line is required';
        if (!shippingAddress.city.trim()) errors.city = 'City is required';
        if (!shippingAddress.state.trim()) errors.state = 'State is required';

        if (!shippingAddress.pincode.trim()) {
            errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            errors.pincode = 'Pincode must contain exactly 6 digits';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setServerError(null);

        if (!validateForm()) return;

        const resScript = await loadRazorpayScript();
        if (!resScript) {
            setServerError('Razorpay SDK failed to load. Check your internet connection.');
            return;
        }

        try {
            setSubmitting(true);
            setPaymentStatusMessage('Creating secure payment order...');

            const orderResponse = await createPaymentOrder(shippingAddress);
            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || 'Failed to initiate order.');
            }

            const {
                shopKartOrderId,
                orderId,
                razorpayOrderId,
                amount,
                currency,
                key,
                keyId
            } = orderResponse.data;

            const finalKey = key || keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
            const finalOrderId = razorpayOrderId || orderId;

            setPaymentStatusMessage('Opening Razorpay Gateway...');

            const options = {
                key: finalKey,
                amount: amount,
                currency: currency || 'INR',
                name: 'ShopKart',
                description: `Payment for ${cartCount} items`,
                order_id: finalOrderId,
                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone
                },
                theme: {
                    color: '#4f46e5'
                },
                handler: async function (response) {
                    try {
                        setPaymentStatusMessage('Cryptographically verifying payment signature...');
                        const verifyRes = await verifyPayment({
                            shopKartOrderId: shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id || finalOrderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            clearCartState();
                            navigate(`/order-success/${verifyRes.data.order._id}`);
                        } else {
                            setServerError('Signature verification failed! Order not placed.');
                        }
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        setServerError(err.response?.data?.message || 'Payment verification failed.');
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                        setPaymentStatusMessage('');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed response:', response.error);
                setServerError(`Payment Failed: ${response.error.description}`);
                setSubmitting(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setServerError(err.response?.data?.message || err.message || 'Unable to start checkout.');
            setSubmitting(false);
        }
    };

    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(subtotal);

    return (
        <div className="products-page-container">
            {/* Back link */}
            <Link to="/cart" className="back-link">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Cart</span>
            </Link>

            {/* Header */}
            <div className="products-page-header">
                <h1 className="products-page-title">Complete Your Order</h1>
                <p className="products-page-subtitle">
                    Enter delivery information and proceed with Razorpay Test Mode Payment
                </p>
            </div>

            {/* Error Banner */}
            {serverError && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{serverError}</span>
                </div>
            )}

            {/* Progress / Status banner */}
            {submitting && paymentStatusMessage && (
                <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1d4ed8', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                    <span>{paymentStatusMessage}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {/* Left: Shipping Form */}
                <div style={{ flex: 2 }}>
                    <div className="product-card" style={{ padding: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck className="w-5 h-5 text-indigo-600" />
                            <span>1. Shipping Details</span>
                        </h2>

                        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Aarav Sharma"
                                    value={shippingAddress.fullName}
                                    onChange={handleChange}
                                    className="search-input"
                                    style={{ borderColor: formErrors.fullName ? '#ef4444' : undefined }}
                                />
                                {formErrors.fullName && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="9876543210"
                                    value={shippingAddress.phone}
                                    onChange={handleChange}
                                    className="search-input"
                                    style={{ borderColor: formErrors.phone ? '#ef4444' : undefined }}
                                />
                                {formErrors.phone && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                    Address (Flat, Street, Area) *
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    placeholder="Flat 402, Sunshine Heights, MG Road"
                                    value={shippingAddress.addressLine1}
                                    onChange={handleChange}
                                    className="search-input"
                                    style={{ borderColor: formErrors.addressLine1 ? '#ef4444' : undefined }}
                                />
                                {formErrors.addressLine1 && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.addressLine1}</p>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Bengaluru"
                                        value={shippingAddress.city}
                                        onChange={handleChange}
                                        className="search-input"
                                        style={{ borderColor: formErrors.city ? '#ef4444' : undefined }}
                                    />
                                    {formErrors.city && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="Karnataka"
                                        value={shippingAddress.state}
                                        onChange={handleChange}
                                        className="search-input"
                                        style={{ borderColor: formErrors.state ? '#ef4444' : undefined }}
                                    />
                                    {formErrors.state && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.state}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        maxLength="6"
                                        placeholder="560001"
                                        value={shippingAddress.pincode}
                                        onChange={handleChange}
                                        className="search-input"
                                        style={{ borderColor: formErrors.pincode ? '#ef4444' : undefined }}
                                    />
                                    {formErrors.pincode && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.pincode}</p>
                                    )}
                                </div>
                            </div>

                            <div style={{ paddingTop: '12px' }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-add-cart"
                                    style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing Razorpay Checkout...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Pay {formattedTotal} with Razorpay</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: Order Summary Snapshot */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="product-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Order Summary</span>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>{cartCount} items</span>
                        </h2>

                        {/* Snapshot of items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                            {cartItems.map((item) => {
                                const product = item.product;
                                if (!product) return null;
                                const itemTotal = product.price * item.quantity;
                                const formattedItemTotal = new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0
                                }).format(itemTotal);

                                return (
                                    <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', background: '#f3f4f6', flexShrink: 0 }}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80';
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Qty: {item.quantity}</p>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formattedItemTotal}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Subtotal</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{formattedTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                                <span>Delivery</span>
                                <span style={{ fontWeight: 600, color: '#16a34a' }}>FREE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Amount to Pay</span>
                                <span style={{ fontSize: '22px', fontWeight: 800, color: '#4f46e5' }}>
                                    {formattedTotal}
                                </span>
                            </div>
                        </div>

                        {/* Security notice */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#4b5563' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#4f46e5', marginBottom: '4px' }}>
                                <CreditCard className="w-4 h-4" />
                                <span>Razorpay Standard Checkout (Test Mode)</span>
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.4 }}>
                                Payments are cryptographically validated on the server via HMAC SHA-256 signature verification. No real money will be deducted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
