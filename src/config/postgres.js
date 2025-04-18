import { Client } from 'pg'
import config from './config';
import logger from './logger';

let client;

(async function name() {
	client = new Client(config.sqlDB);
	try {
		await client.connect();
		logger.info('Connect to postgress sucessfully');
		return client;
	} catch (error) {
		logger.error('Connect to postgress error');
		process.exit(1);
	}
})();

export default {
	postgres: client,
};
