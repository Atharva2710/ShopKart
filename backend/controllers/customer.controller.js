import Customer from "../models/customer.model.js"
import bcrypt from 'bcrypt'
import generateToken from "../utils/generateToken.js"


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}


export const registerCustomer = async (req, res) => {
    try {

        const { fullName, email, password, phone } = req.body


        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields Required' })
        }


        if (password.length < 6) {
            return res.status(400).json({ message: 'Password should be at least 6 characters' })
        }


        const customerExists = await Customer.findOne({ email })

        if (customerExists) {
            return res.status(409).json({ message: 'Customer Already Exists' })
        }


        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)


        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        })


        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}


export const loginCustomer = async (req, res) => {
    try {

        const { email, password } = req.body


        if (!email || !password) {
            return res.status(400).json({ message: 'All fields Required' })
        }


        const customer = await Customer.findOne({ email })

        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }


        const passwordMatched = await bcrypt.compare(password, customer.password)


        if (!passwordMatched) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }


        const token = generateToken(customer._id)


        res.cookie('token', token, cookieOptions)


        res.status(200).json({
            success: true,
            message: 'Login successful'
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}


export const getMyProfile = async (req, res) => {
    try {

        res.status(200).json({
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            phone: req.user.phone
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}


export const logoutCustomer = async (req, res) => {
    try {

        res.clearCookie('token', cookieOptions)

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}


export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields Required' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password should be at least 6 characters' })
        }

        const customer = await Customer.findById(req.user._id)

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        const isMatch = await bcrypt.compare(oldPassword, customer.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' })
        }

        const salt = await bcrypt.genSalt(10)
        customer.password = await bcrypt.hash(newPassword, salt)
        await customer.save()

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}