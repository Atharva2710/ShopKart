import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { loginCustomer, getMyProfile } from '../services/api';

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!credentials.email || !credentials.password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            const response = await loginCustomer(credentials);

            if (response.data.success) {
                const userRes = await getMyProfile();
                setUser(userRes.data);
                navigate('/products');
            }
        } catch (err) {
            console.error('Login failed:', err);
            const msg = err.response?.data?.message || 'Invalid Credentials';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="product-card" style={{ maxWidth: '420px', width: '100%', padding: '32px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                        <LogIn className="w-5 h-5" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Welcome Back</h2>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Log in to your ShopKart account</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                value={credentials.email}
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
                                placeholder="••••••••"
                                value={credentials.password}
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
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Link */}
                <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                            Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
