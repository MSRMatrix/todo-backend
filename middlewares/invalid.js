export const invalid = (req, res, next) => {
    const error = new Error('Path does not exist');
    error.statusCode = 418;
    next(error);
};