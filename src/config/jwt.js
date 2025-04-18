import { expressjwt as expressJwt } from 'express-jwt';
import config from './config.js';


async function isRevoked(_req, _payload, done) {
	done();
}

function jwt() {
	const { secret } = config.jwt;
	return expressJwt({
		secret,
		getToken: function fromHeaderOrQuerystring(req) {
			const header = req.headers.authorization;
			if (header && header.split(' ')[0] === 'Bearer') {
				return header.split(' ')[1];
			}
			return null;
		},
		algorithms: ['HS256'],
		isRevoked,
	}).unless({
		path: [
			// public routes that don't require authentication
			/\/v[1-9](\d)*\/(auth|appauth|vendors\/portal\/contract|vendors\/portal\/login|vendors\/portal\/reset-password|test\/|website\/|health-check|image|page|stripe|convert-html|contract\/|check\/)\/*.*/,
		],
	}).on('error', (err, req, res, next) => {
		// Customize error response
		res.status(401).json({ message: 'Unauthorized access', error: err.message });
	});
}

export default jwt;
