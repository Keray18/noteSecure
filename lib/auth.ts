import jwt from "jsonwebtoken"

const jwt_secret = process.env.JWT_SECRET

if (!jwt_secret) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (userId: string) => {
    return jwt.sign(
        { userId },
        jwt_secret,
        { expiresIn: "1d" }
    )
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, jwt_secret) as {
        userId: string
    }
}