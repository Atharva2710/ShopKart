import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://shopkart-backend-tqp4.onrender.com';
    }
    return 'http://localhost:8085';
};

const API = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach Authorization Bearer token if stored (supports cross-origin Safari/Chrome environments)
API.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('shopkart_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Authentication APIs (Lab 01 & 02)
export const registerCustomer = (data) => API.post('/customers/register', data);
export const loginCustomer = (data) => API.post('/customers/login', data);
export const getMyProfile = () => API.get('/customers/me');
export const logoutCustomer = () => API.post('/customers/logout');
export const changePassword = (data) => API.patch('/customers/change-password', data);

// Product APIs (Lab 03)
export const getProducts = (params) => API.get('/products', { params });
export const getProductById = (id) => API.get(`/products/${id}`);

// Wishlist APIs (Lab 04)
export const addToWishlist = (productId) => API.post(`/wishlist/${productId}`);
export const getWishlist = () => API.get('/wishlist');
export const removeFromWishlist = (productId) => API.delete(`/wishlist/${productId}`);
export const toggleWishlist = (productId) => API.patch(`/wishlist/${productId}/toggle`);

// Cart APIs (Lab 05)
export const addToCart = (productId) => API.post(`/cart/${productId}`);
export const getCart = () => API.get('/cart');
export const updateCartQuantity = (productId, quantity) => API.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);

// Order & Checkout APIs (Lab 06)
export const createPaymentOrder = (shippingAddress) => API.post('/orders/create-payment-order', { shippingAddress });
export const verifyPayment = (paymentData) => API.post('/orders/verify-payment', paymentData);
export const getMyOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });

export default API;
