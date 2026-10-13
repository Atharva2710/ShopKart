import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, ShoppingBag, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyOrders, updateOrderStatus } from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getMyOrders();
            if (res.data?.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Something went wrong while fetching your orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAdvanceStatus = async (orderId, currentStatus) => {
        const progression = {
            PENDING_PAYMENT: 'PLACED',
            PLACED: 'CONFIRMED',
            CONFIRMED: 'SHIPPED',
            SHIPPED: 'DELIVERED',
            DELIVERED: 'DELIVERED'
        };

        const nextStatus = progression[currentStatus];
        if (!nextStatus || nextStatus === currentStatus) return;

        try {
            setUpdatingStatusId(orderId);
            const res = await updateOrderStatus(orderId, nextStatus);
            if (res.data?.success) {
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
                );
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>Delivered</span>;
            case 'SHIPPED':
                return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#fffbeb', color: '#d97706' }}>Shipped</span>;
            case 'CONFIRMED':
                return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>Confirmed</span>;
            case 'PLACED':
                return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#f0f9ff', color: '#0284c7' }}>Placed</span>;
            default:
                return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#f3f4f6', color: '#4b5563' }}>{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="products-page-container">
                <div className="products-page-header">
                    <h1 className="products-page-title">My Orders</h1>
                    <p className="products-page-subtitle">Loading your purchase history...</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="product-card" style={{ padding: '24px', height: '120px' }}>
                            <div className="skeleton-line" style={{ width: '40%' }}></div>
                            <div className="skeleton-line" style={{ width: '70%', marginTop: '14px' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state-box">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3>Unable to Load Orders</h3>
                <p>{error}</p>
                <button onClick={fetchOrders} className="btn-add-cart" style={{ width: 'auto', display: 'inline-block' }}>
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="empty-state-box" style={{ maxWidth: '520px', marginTop: '60px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Package className="w-8 h-8" />
                </div>
                <h2>You have not placed any orders yet.</h2>
                <p>When you purchase items from ShopKart, your orders will appear here.</p>
                <Link to="/products" className="btn-add-cart" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="products-page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 className="products-page-title">My Orders</h1>
                    <p className="products-page-subtitle">
                        Review all {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed with your account
                    </p>
                </div>

                <Link to="/products" className="btn-wishlist" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none' }}>
                    Browse More Products
                </Link>
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });

                    const formattedTotal = new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                    }).format(order.totalAmount);

                    const isExpanded = expandedOrder === order._id;

                    return (
                        <div key={order._id} className="product-card" style={{ padding: '24px' }}>
                            {/* Card Top: Order metadata & Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                                            #{order._id}
                                        </span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Ordered on {formattedDate}</span>
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Total</span>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formattedTotal}</span>
                                    </div>

                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                        className="btn-wishlist"
                                        style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        {isExpanded ? (
                                            <><span>Hide Details</span> <ChevronUp className="w-3.5 h-3.5" /></>
                                        ) : (
                                            <><span>View Details</span> <ChevronDown className="w-3.5 h-3.5" /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Items preview */}
                            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {order.items.map((item, idx) => {
                                    const itemPrice = new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                        maximumFractionDigits: 0
                                    }).format(item.price * item.quantity);

                                    return (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{item.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{itemPrice}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Expanded Details: Shipping Address & Status update */}
                            {isExpanded && (
                                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#4b5563' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#111827', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>Delivery Address:</span>
                                        </p>
                                        <p style={{ margin: 0 }}>{order.shippingAddress?.fullName} ({order.shippingAddress?.phone})</p>
                                        <p style={{ margin: 0 }}>{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                    </div>

                                    {order.status !== 'DELIVERED' && (
                                        <div style={{ alignSelf: 'flex-end' }}>
                                            <button
                                                onClick={() => handleAdvanceStatus(order._id, order.status)}
                                                disabled={updatingStatusId === order._id}
                                                className="btn-wishlist"
                                                style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                                            >
                                                {updatingStatusId === order._id ? 'Updating...' : `Advance Status (Demo)`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;
