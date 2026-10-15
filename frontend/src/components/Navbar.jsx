import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount, wishlistCount } = useCart();

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('shopkart_token');
            setUser(null);
            navigate('/login');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                {/* Brand Logo */}
                <Link to="/products" className="navbar-brand">
                    ShopKart
                </Link>

                {/* Navigation Links */}
                <nav className="navbar-nav">
                    <Link
                        to="/home"
                        className={`nav-link ${isActive('/home') ? 'active' : ''}`}
                    >
                        Home
                    </Link>

                    <Link
                        to="/products"
                        className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                    >
                        Products
                    </Link>

                    <Link
                        to="/wishlist"
                        className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}
                    >
                        Wishlist ({wishlistCount || 0})
                    </Link>

                    <Link
                        to="/cart"
                        className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
                    >
                        Cart ({cartCount || 0})
                    </Link>

                    <Link
                        to="/orders"
                        className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
                    >
                        Orders
                    </Link>

                    {user ? (
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    ) : (
                        <div className="auth-nav-group">
                            <Link to="/login" className="login-link">
                                Login
                            </Link>
                            <Link to="/register" className="register-btn">
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
