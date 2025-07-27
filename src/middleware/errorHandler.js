const createError = require('../utils/createError'); 

const errorHandler = (err, req, res, next) => {
    
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
   
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }
   
    if (err.name === 'CastError') {
        statusCode = 400;
        err.message = `Resource not found with id of ${err.value}`;
    }
   
    if (err.code === 11000) { 
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        err.message = `Duplicate field value: ${field} must be unique`;
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
       
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;