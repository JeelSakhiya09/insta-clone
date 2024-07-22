import { validateToken } from '../services/auth.js'
import ErrorHandler from './error.js';

export function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName] || req.headers["authorization"].replace("Bearer ", "");
            
        if (!tokenCookieValue) {
            throw new ErrorHandler("Invalid token", 404);
        }   
        try {
            const userPayload = validateToken(tokenCookieValue);
                
            req.user = userPayload;
            next();
        } catch (error) {
            next(error);
        }
    }
}