import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { _id, name, price, category, image, stock } = product;
    const navigate = useNavigate();
    const { isInWishlist, toggleWishlist, addToCart } = useCart();

    const [savingWishlist, setSavingWishlist] = useState(false);
    const [addingCart, setAddingCart] = useState(false);
    const [btnFeedback, setBtnFeedback] = useState('');

    const isSaved = isInWishlist(_id);

    // Format currency in INR (₹)
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSavingWishlist(true);
        const result = await toggleWishlist(_id);
        setSavingWishlist(false);

        if (!result.success && result.message?.toLowerCase().includes('unauthorized')) {
            navigate('/login');
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (stock === 0) return;

        setAddingCart(true);
        const result = await addToCart(_id);
        setAddingCart(false);

        if (!result.success && result.message?.toLowerCase().includes('unauthorized')) {
            navigate('/login');
            return;
        }

        if (result.success) {
            setBtnFeedback('Added!');
            setTimeout(() => setBtnFeedback(''), 1500);
        } else {
            setBtnFeedback(result.message || 'Error');
            setTimeout(() => setBtnFeedback(''), 1500);
        }
    };

    return (
        <div className="product-card">
            {/* Product Image Area */}
            <div className="product-card-img-wrapper">
                <img
                    src={image}
                    alt={name}
                    className="product-card-img"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80';
                    }}
                />
            </div>

            {/* Product Info Area */}
            <div className="product-card-body">
                {/* Name & Category Row */}
                <div className="product-card-header">
                    <h3 className="product-card-title" title={name}>
                        {name}
                    </h3>
                    <span className="product-card-category">
                        {category}
                    </span>
                </div>

                {/* Price */}
                <div className="product-card-price">
                    {formattedPrice}
                </div>

                {/* Stock Left */}
                <div className="product-card-stock">
                    {stock > 0 ? `${stock} units left` : 'Out of stock'}
                </div>

                {/* Action Buttons */}
                <div className="product-card-actions">
                    <button
                        onClick={handleAddToCart}
                        disabled={addingCart || stock === 0}
                        className="btn-add-cart"
                    >
                        {addingCart ? 'Adding...' : btnFeedback ? btnFeedback : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button
                        onClick={handleWishlistClick}
                        disabled={savingWishlist}
                        className={`btn-wishlist ${isSaved ? 'in-wishlist' : ''}`}
                    >
                        {savingWishlist ? (
                            'Saving...'
                        ) : isSaved ? (
                            <span><span className="heart-icon filled">♥</span> Remove from Wishlist</span>
                        ) : (
                            <span><span className="heart-icon">♡</span> Add to Wishlist</span>
                        )}
                    </button>

                    <Link to={`/products/${_id}`} className="view-details-link">
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
