class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {

    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    return res.status(err.statusCode).json({
        sucess: false,
        error: err.message,
        stack: err.stack
    });
}

export default ErrorHandler;