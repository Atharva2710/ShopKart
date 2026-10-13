import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

try {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart12345",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkartTestSecretKey98765"
    });
} catch (error) {
    console.error("Razorpay initialization warning:", error.message);
}

export default razorpayInstance;
