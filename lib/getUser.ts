import { cookies } from "next/headers"
import { verifyToken } from "./auth"


export const getCurrentUserId = async () => {
    const cookieStore = await cookies()

    const token = cookieStore.get("token")?.value

    if(!token) {
        return null 
    }

    try {
        const payload = verifyToken(token)
        return payload.userId
    
    } catch {
        return null
    }
}