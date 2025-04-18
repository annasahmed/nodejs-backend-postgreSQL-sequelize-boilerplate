import http from 'http'
import app from './app.js';
import config from './config/config.js';
import logger from './config/logger.js';
import models from './db/models/index.js';

// sync database
models.sequelize.sync();

const server = http.Server(app);

const port = config.port || 3000;
server.listen(port, () => {
	logger.info(`App is listening on port ${config.port}`);
});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			logger.info('Server closed');
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (error) => {
	logger.error(error);
	//console.log(error)
	// exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
	logger.info('SIGTERM received');
	if (server) {
		server.close();
	}
});
