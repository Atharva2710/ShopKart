import Product from "../models/product.model.js";
import mongoose from "mongoose";

// Task 2 — Create Product API (POST /products)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Validation for missing required fields
        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validation for price and stock
        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({ success: false, message: "Invalid price. Price must be greater than 0" });
        }

        if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ success: false, message: "Invalid stock. Stock cannot be negative" });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 3 & Task 5 — Get All Products API with Search, Category Filter, and Sorting (GET /products)
export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        let query = {};

        // Case-insensitive search on name or description
        if (search && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } }
            ];
        }

        // Category filter
        if (category && category !== "All" && category.trim() !== "") {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        // Sorting (Bonus Challenge +10 Marks)
        let sortOption = { createdAt: -1 }; // default newest
        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(query).sort(sortOption);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 4 — Get Single Product API (GET /products/:id)
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Seed initial products helper
export const seedInitialProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                {
                    name: "Noise Cancelling Headphones",
                    description: "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
                    price: 4999,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    stock: 25
                },
                {
                    name: "RGB Mechanical Keyboard",
                    description: "Tactile blue switches mechanical keyboard with customizable per-key RGB backlighting.",
                    price: 2999,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
                    stock: 12
                },
                {
                    name: "Ultra-Lightweight Running Shoes",
                    description: "Breathable mesh running shoes with memory foam insoles for ultimate comfort and speed.",
                    price: 3499,
                    category: "Fashion",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
                    stock: 18
                },
                {
                    name: "Smart Fitness Watch v2",
                    description: "Waterproof smartwatch with continuous heart rate monitoring, GPS tracking, and sleep analysis.",
                    price: 5999,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                    stock: 8
                },
                {
                    name: "Minimalist Leather Backpack",
                    description: "Crafted from genuine full-grain leather with dedicated 15-inch laptop compartment.",
                    price: 2499,
                    category: "Fashion",
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
                    stock: 15
                },
                {
                    name: "Ergonomic Office Chair",
                    description: "High-back mesh desk chair with adjustable lumbar support and 3D armrests.",
                    price: 8999,
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=600&auto=format&fit=crop&q=80",
                    stock: 5
                },
                {
                    name: "Stainless Steel Insulated Bottle",
                    description: "Double-wall vacuum insulated water bottle keeping drinks cold for 24 hours.",
                    price: 999,
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
                    stock: 40
                },
                {
                    name: "Mastering Fullstack Web Dev",
                    description: "Comprehensive guide to building modern scalable web applications with MERN and React.",
                    price: 799,
                    category: "Books",
                    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                    stock: 30
                }
            ];
            await Product.insertMany(initialProducts);
            console.log("Seeded initial product catalog successfully");
        }
    } catch (err) {
        console.log("Error seeding products:", err.message);
    }
};
