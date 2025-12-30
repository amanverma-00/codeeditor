const handleDatabaseError = (err, req, res, next) => {
    console.error('Database Error:', err);

    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        // Handle specific MongoDB errors
        switch (err.code) {
            case 11000:
                return res.status(409).json({
                    status: 'error',
                    message: 'Duplicate entry found',
                    error: 'A record with this information already exists'
                });
            default:
                return res.status(500).json({
                    status: 'error',
                    message: 'Database operation failed',
                    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                });
        }
    }

    if (err.name === 'ValidationError') {
        // Handle Mongoose validation errors
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }

    if (err.name === 'CastError') {
        // Handle invalid ObjectId errors
        return res.status(400).json({
            status: 'error',
            message: 'Invalid ID format',
            error: 'The provided ID is not valid'
        });
    }

    // Pass other errors to the default error handler
    next(err);
};

module.exports = handleDatabaseError;
