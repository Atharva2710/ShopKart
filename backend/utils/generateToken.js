import jwt from 'jsonwebtoken'

const generateToken = (customerId) => {
    return jwt.sign(
        { customerId },
        process.env.jwt_secret,
        { expiresIn: '1d' }
    )
}

export default generateToken