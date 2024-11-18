export const errorHandler = (err, req, res, next) => {
    const error = new Error(err);
    error.status = err.statusCode;
    res.status(err.statusCode || 500).json({ message: err.message, statusCode: err.statusCode });
};