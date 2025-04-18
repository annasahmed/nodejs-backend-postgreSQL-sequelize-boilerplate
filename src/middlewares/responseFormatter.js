import logger from '../config/logger.js';  // Adjust path to your logger if necessary

const responseFormatter = async ({ response }, next) => {
    try {
        // Proceed to the next middleware or controller action
        await next();

        // If response has already been sent, no need to modify
        if (response.finished) {
            return;
        }

        const originalResponse = response.getBody();
        const statusCode = response.getStatus();

        // Format the response based on status codes
        const formattedResponse = {
            code: statusCode,
            data: statusCode >= 200 && statusCode < 300 ? originalResponse : null,
            error: statusCode >= 400 ? originalResponse : null,
        };

        // Logging for all responses
        logger.info({
            message: `Response Sent: ${JSON.stringify(formattedResponse)}`,
            statusCode,
        });

        // Send the formatted response to the client
        response.status(statusCode).json(formattedResponse);
    } catch (err) {
        // If there is any error in the responseFormatter, pass it to next error handler
        next(err);
    }
};

export default responseFormatter;
