import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filter states
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (category && category !== 'All') params.category = category;
            if (sort) params.sort = sort;

            const response = await getProducts(params);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Something went wrong while loading products.');
        } finally {
            setLoading(false);
        }
    }, [search, category, sort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleClear = () => {
        setSearch('');
        setCategory('All');
        setSort('');
    };

    return (
        <div className="products-page-container">
            {/* Header */}
            <div className="products-page-header">
                <h1 className="products-page-title">
                    Products
                </h1>
                <p className="products-page-subtitle">
                    Discover products from our catalog
                </p>
            </div>

            {/* Search & Filter Component */}
            <SearchBar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                sort={sort}
                setSort={setSort}
                onClear={handleClear}
            />

            {/* Loading State */}
            {loading && (
                <div className="products-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="product-card skeleton-card">
                            <div className="skeleton-img"></div>
                            <div className="skeleton-body">
                                <div className="skeleton-line" style={{ width: '70%' }}></div>
                                <div className="skeleton-line" style={{ width: '40%' }}></div>
                                <div className="skeleton-line" style={{ width: '100%', height: '36px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="empty-state-box">
                    <h3>Unable to Load Products</h3>
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="btn-add-cart" style={{ width: 'auto', padding: '8px 20px' }}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
                <div className="empty-state-box">
                    <h3>No Products Found</h3>
                    <p>We couldn't find any products matching your search criteria.</p>
                    <button onClick={handleClear} className="btn-wishlist" style={{ width: 'auto', padding: '8px 20px', margin: '0 auto' }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;
