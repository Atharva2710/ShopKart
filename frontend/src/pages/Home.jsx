import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { getMyProfile } from '../services/api';

const Home = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await getMyProfile();
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Unauthorized access. Please log in.');
                setUser(null);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, setUser]);

    if (loading) {
        return (
            <div className="app-loading-screen">
                <div className="app-spinner"></div>
                <span>Loading your profile...</span>
            </div>
        );
    }

    if (error || !user) {
        return null;
    }

    return (
        <div className="products-page-container" style={{ maxWidth: '900px' }}>
            {/* Banner */}
            <div className="product-card" style={{ padding: '32px', marginBottom: '24px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span>Authenticated Customer</span>
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>
                            Welcome back, {user.fullName}! 👋
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>
                            You are securely logged into your ShopKart Customer Dashboard.
                        </p>
                    </div>

                    <Link to="/products" className="btn-add-cart" style={{ textDecoration: 'none', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Browse Products</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Profile Info Cards */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                Account Profile Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="product-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Full Name</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{user.fullName}</p>
                    </div>
                </div>

                <div className="product-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{user.email}</p>
                    </div>
                </div>

                <div className="product-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{user.phone}</p>
                    </div>
                </div>

                <div className="product-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Customer ID</p>
                        <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#4b5563', margin: 0 }}>{user._id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
