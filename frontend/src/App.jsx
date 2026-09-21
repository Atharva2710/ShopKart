import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import { getMyProfile } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await getMyProfile();
                if (res.data && res.data._id) {
                    setUser(res.data);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="app-loading-screen">
                <div className="app-spinner"></div>
                <span>Loading ShopKart...</span>
            </div>
        );
    }

    return (
        <CartProvider user={user}>
            <Router>
                <div className="app-wrapper">
                    <Navbar user={user} setUser={setUser} />

                    <main className="app-main">
                        <Routes>
                            <Route path="/" element={<Navigate to="/products" replace />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/home" element={<Home user={user} setUser={setUser} />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/:id" element={<ProductDetails />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" replace />} />
                            <Route path="/order-success/:id" element={<OrderSuccess />} />
                            <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
                            <Route path="/orders/:id" element={<OrderSuccess />} />
                            <Route path="*" element={<Navigate to="/products" replace />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;
