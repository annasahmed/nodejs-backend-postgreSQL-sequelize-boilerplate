import { sign, verify } from 'jsonwebtoken';
import { genSalt, hash, compare } from 'bcrypt';
import { jwt as _jwt } from '../config/config.js';

function generateToken(data, expiresMs = null, secret = _jwt.secret) {
	const payload = { ...data };
	if (expiresMs) {
		payload.exp = Math.floor(expiresMs / 1000);
	}
	return sign(payload, secret);
}

function verifyToken(token, secret = _jwt.secret) {
	try {
		return verify(token, secret);
	} catch (err) {
		throw new Error('Invalid or expired token');
	}
}
function generateExpires(hours) {
	return new Date(Date.now() + hours * 60 * 60 * 1000);
}


async function encryptData(string) {
	const salt = await genSalt(10);
	const hashedString = await hash(string, salt);
	return hashedString;
}

async function decryptData(string, hashedString) {
	const isValid = await compare(string, hashedString);
	return isValid;
}

function setCookie(res, cookieName, cookieValue, expiresMs) {
	res.cookie(cookieName, cookieValue, {
		httpOnly: true,
		expires: new Date(expiresMs),
	});
}


export {
	generateToken,
	generateExpires,
	verifyToken,

	encryptData,
	decryptData,
	setCookie,
};
