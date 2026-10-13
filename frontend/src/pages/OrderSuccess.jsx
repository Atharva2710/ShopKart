import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Package, MapPin, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { getOrderById } from '../services/api';

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await getOrderById(id);
                if (res.data?.success) {
                    setOrder(res.data.order);
                }
            } catch (err) {
                console.error('Failed to load order confirmation details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const formattedTotal = order ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(order.totalAmount) : '';

    if (loading) {
        return (
            <div className="app-loading-screen">
                <div className="app-spinner"></div>
                <span>Verifying order confirmation details...</span>
            </div>
        );
    }

    return (
        <div className="products-page-container" style={{ maxWidth: '720px' }}>
            <div className="product-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
                {/* Success Icon */}
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <CheckCircle2 className="w-10 h-10" />
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Payment Verified & Confirmed</span>
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
                    Order Placed Successfully!
                </h1>

                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
                    Thank you for shopping with ShopKart. Your order has been placed and payment confirmed.
                </p>

                {/* Order Highlights Box */}
                {order && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', fontSize: '13px' }}>
                            <div>
                                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Order Reference</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>{order._id}</span>
                            </div>
                            <div>
                                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Payment ID</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>{order.razorpayPaymentId || 'Verified Online'}</span>
                            </div>
                            <div>
                                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Order Status</span>
                                <span style={{ display: 'inline-block', marginTop: '2px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>{order.status}</span>
                            </div>
                            <div>
                                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Total Paid</span>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>
                                    {formattedTotal}
                                </span>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {order.shippingAddress && (
                            <div style={{ paddingTop: '16px', fontSize: '13px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin className="w-4 h-4 text-indigo-600" />
                                    <span>Shipping Address</span>
                                </h3>
                                <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
                                <p style={{ margin: 0, color: '#6b7280' }}>
                                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Call to actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <Link to="/orders" className="btn-wishlist" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none' }}>
                        <Package className="w-4 h-4" />
                        <span>View All Orders</span>
                    </Link>

                    <Link to="/products" className="btn-add-cart" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none' }}>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
