import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Task 2 — Add Product to Wishlist (POST /wishlist/:productId)
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // 2. Find Product in database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 3. Load authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 4. Check for duplicate wishlist entry
        const isAlreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId.toString()
        );

        if (isAlreadyWishlisted) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        // 5. Add product reference and persist
        customer.wishlist.push(productId);
        await customer.save();

        res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 3 — Get Current User's Wishlist (GET /wishlist)
export const getWishlist = async (req, res) => {
    try {
        // Find user & populate product references
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock"
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Filter out any stale references where product was deleted
        const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

        // Clean up stale IDs if any were found
        if (validWishlist.length !== (customer.wishlist || []).length) {
            customer.wishlist = validWishlist.map((item) => item._id);
            await customer.save();
        }

        res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 4 — Remove Product from Wishlist (DELETE /wishlist/:productId)
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // 2. Load authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Verify item exists in wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId.toString()
        );

        if (!exists) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        // 4. Remove reference and persist
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId.toString()
        );
        await customer.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Bonus Task 23 — Toggle Wishlist (PATCH /wishlist/:productId/toggle)
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isSaved = customer.wishlist.some(
            (id) => id.toString() === productId.toString()
        );

        if (isSaved) {
            customer.wishlist = customer.wishlist.filter(
                (id) => id.toString() !== productId.toString()
            );
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};
