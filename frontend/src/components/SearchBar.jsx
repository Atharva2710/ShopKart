import React from 'react';

const SearchBar = ({ search, setSearch, category, setCategory, sort, setSort, onClear }) => {
    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Books'];

    return (
        <div className="filter-bar">
            {/* Search Input */}
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Category Filter */}
            <div className="filter-select-wrapper">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="filter-select"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === 'All' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-select-wrapper">
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Sort By</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
};

export default SearchBar;
