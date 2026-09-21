import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerCustomer } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
            setError('All fields are required.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }

        try {
            setLoading(true);
            const response = await registerCustomer(formData);
            if (response.data.success) {
                setSuccessMsg('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err) {
            console.error('Registration failed:', err);
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="product-card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Create an Account</h2>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Join ShopKart today to start shopping</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                    <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#16a34a', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="search-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="search-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Phone Number
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Phone className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="search-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="search-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-add-cart"
                        style={{ padding: '12px', fontSize: '14px', marginTop: '8px' }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                {/* Footer Link */}
                <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
