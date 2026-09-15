import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import { seedInitialProducts } from './controllers/product.controller.js'

dotenv.config()

const app = express()
const Port = process.env.PORT || 8085

// Enable CORS for frontend cross-origin requests with HttpOnly cookies
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Connect DB & Seed initial products
mongoose.connect(process.env.dbUrl).then(() => {
    console.log("Db Connected")
    seedInitialProducts()
}).catch((err) => {
    console.log("Db Connection Error")
    console.log(err)
})

// Routes
app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.get('/', (req, res) => {
    res.send('ShopKart Server On')
})

app.listen(Port, () => {
    console.log(`Server Started at ${Port}`)
})