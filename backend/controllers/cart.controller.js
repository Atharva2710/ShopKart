import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Task 2 — Add Product to Cart (POST /cart/:productId)
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // 2. Find Product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 3. Load authenticated Customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        // 4. Check if already present in cart
        const itemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (itemIndex === -1) {
            // New item to cart
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is currently out of stock" });
            }
            customer.cart.push({ product: productId, quantity: 1 });
        } else {
            // Existing item: increment quantity
            const targetQuantity = customer.cart[itemIndex].quantity + 1;
            if (targetQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more units. Available stock is ${product.stock}`
                });
            }
            customer.cart[itemIndex].quantity = targetQuantity;
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate("cart.product");

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 3 — Get Current User Cart (GET /cart)
export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate("cart.product");
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Clean up any items where product was removed from database
        const validCart = (customer.cart || []).filter((item) => item.product !== null);

        if (validCart.length !== (customer.cart || []).length) {
            customer.cart = validCart;
            await customer.save();
        }

        res.status(200).json({
            success: true,
            cart: validCart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 4 — Update Product Quantity (PATCH /cart/:productId)
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity. Quantity must be a number greater than or equal to 1"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const itemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product is not in cart" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Quantity exceeds available stock. Only ${product.stock} units available`
            });
        }

        customer.cart[itemIndex].quantity = quantity;
        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate("cart.product");

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};

// Task 5 — Remove Product from Cart (DELETE /cart/:productId)
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        customer.cart = (customer.cart || []).filter(
            (item) => item.product.toString() !== productId.toString()
        );

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate("cart.product");

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server crashed", error: error.message });
    }
};
