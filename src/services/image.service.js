import { CopyObjectCommand, DeleteObjectsCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import path from 'path';
import sharp from 'sharp';
import config from '../config/config.js';
const { accessKeyId, secretAccessKey, region, Bucket } = config.s3Bucket;
const env = process.env.ENV;


function getContentType(filename) {
	const extension = filename.split('.').pop().toLowerCase();
	switch (extension) {
		case 'png':
			return 'image/png';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'pdf':
			return 'application/pdf';
		// Add more cases for other file types as needed
		default:
			return 'application/octet-stream'; // Default to binary data if file type is unknown
	}
}

async function uploadImageToS3Unix(req, imageFolder, pdf = false) {
	let file;

	if (!req.files) {
		file = req;
	} else {
		file = req.files?.image[0];
	}
	let folder;
	if (req?.body?.folder) {
		folder = req?.body?.folder;
	} else {
		folder = imageFolder;
	}
	const filename = file.originalname.split('.');
	filename.pop();
	const date = Date.now();
	const extension = file.originalname.split('.').pop().toLowerCase();
	const params = {
		Bucket: Bucket,
		Key: folder
			? `${env ? 'devlopment/' : ''}${folder.toLowerCase().replace(/\s+/g, '-')}/${filename.join('')}${date}.${extension}`
			: file.originalname,
		Body: file.buffer,
		ACL: 'public-read',
		ContentType: getContentType(file.originalname),
	};

	try {
		const data = await new Upload({
			client: new S3Client({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			params,
		}).done();
		return '/' + data.Location.split('/').slice(3).join('/');
	} catch (err) {
		throw new Error(`Error uploading image! ${err}`);
	}
}
async function uploadImageToS3(req, imageFolder) {
	let file;

	if (!req.files) {
		file = req;
	} else {
		file = req.files?.image[0];
	}
	let folder;
	if (req?.body?.folder) {
		folder = req?.body?.folder;
	} else {
		folder = imageFolder;
	}

	const params = {
		Bucket: Bucket,
		Key: folder
			? `${env ? 'devlopment/' : ''}${folder.toLowerCase().replace(/\s+/g, '-')}/${file.originalname}`
			: file.originalname,

		Body: file.buffer,
		ACL: 'public-read',
		ContentType: getContentType(file.originalname),
	};

	try {
		const data = await new Upload({
			client: new S3Client({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			params,
		}).done();
		return '/' + data.Location.split('/').slice(3).join('/');
	} catch (err) {
		throw new Error(`Error uploading image! ${err}`);
	}
}

async function deleteImageFromS3(req) {
	const imageKey = req?.body?.image || req;
	const s3Client = new S3Client({
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	});

	const key = '/' + imageKey?.split('amazonaws.com/').pop();
	//console.log(key, 'delete image key');
	const params = {
		Bucket: Bucket,
		// Key: imageKey?.split('amazonaws.com/').pop(),
		Delete: {
			Objects: [{ Key: key }],
		},
		Quiet: false,
	};
	//console.log(params, 'params');
	try {
		const data = await s3Client.send(new DeleteObjectsCommand(params));
		return data;
	} catch (err) {
		throw new Error(`Error deleting image from S3 ${err}`);
	}
}
import { URL } from 'url';
async function copyImageToDestination(sourceUrl, destinationUrl) {
	// const { sourceUrl, destinationUrl } = req.body;

	const s3Client = new S3Client({
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	});

	const sourceParsedUrl = new URL(sourceUrl);
	const destinationParsedUrl = new URL(destinationUrl);

	const sourceBucket = sourceParsedUrl.hostname.split('.')[0];
	const sourceKey = decodeURIComponent(sourceParsedUrl.pathname.slice(1));
	const destinationBucket = destinationParsedUrl.hostname.split('.')[0];
	const destinationKey = decodeURIComponent(
		destinationParsedUrl.pathname.slice(1),
	);

	const copyParams = {
		Bucket: destinationBucket,
		CopySource: `/${sourceBucket}/${sourceKey}`,
		Key: `${env ? 'devlopment/' : ''}${destinationKey}`,
		ACL: 'public-read',
		ContentType: getContentType(destinationKey),
	};
	//console.log(copyParams, 'copyParams');
	try {
		const data = await s3Client.send(new CopyObjectCommand(copyParams));
		// //console.log('Object copied successfully:', data);
		//console.log(
		// 	'Final Obj',
		// 	`https://${destinationBucket}.s3.${region}.amazonaws.com/${destinationKey}`,
		// );
		return {
			url: `https://${destinationBucket}.s3.${region}.amazonaws.com/${destinationKey}`,
		};
	} catch (err) {
		console.error('Error copying object:', err);
		throw { imageKey: sourceParsedUrl, err };
	}
}
async function uploadToS3(file, path, contentType = 'image/png') {
	const params = {
		Bucket: Bucket,
		Key: path,
		Body: file,
		ACL: 'public-read',
		ContentType: contentType,
	};

	try {
		const data = await new Upload({
			client: new S3Client({
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				region,
			}),
			params,
		}).done();
		//console.log(data.Location, 'data.Location', data);
		data.$metadata.httpStatusCode;
		return '/' + data.Location.split('/').slice(3).join('/');
	} catch (err) {
		throw new Error(`Error uploading image! ${err}`);
	}
}

async function resizeAndUploadImage(imageKey) {
	//console.log(imageKey, 'chkk imageKey');

	// Download the original image from S3
	const s3Client = new S3Client({
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	});

	const downloadParams = {
		Bucket: Bucket,
		Key: imageKey,
	};

	// try {
	// Get the original image from S3
	const originalImage = await s3Client.send(
		new GetObjectCommand(downloadParams),
	);
	const originalImageBuffer = await streamToBuffer(originalImage.Body); // Convert stream to buffer

	// Resize the image using sharp
	const resizedImageBuffer = await sharp(originalImageBuffer)
		.resize(80)
		.toBuffer();

	// Generate new key with _map before the extension
	const newImageKey = generateNewKey(imageKey);
	const finalImageKey = imageKey.split('/').slice(0, 2).join('/');

	// Upload resized image with the new key
	const uploadParams = {
		Bucket: Bucket,
		Key: finalImageKey + '/' + newImageKey,
		Body: resizedImageBuffer,
		ACL: 'public-read',
		ContentType: getContentType(imageKey), // Use the same content type as original
	};

	const data = await new Upload({
		client: s3Client,
		params: uploadParams,
	}).done();

	// console.log(`Resized image uploaded successfully: ${data.Location}`);
	return data.Location;
	// } catch (err) {
	// 	throw new Error(`Error resizing and uploading image: ${err}`);
	// }
}

// Helper function to convert stream to buffer
const streamToBuffer = (stream) => {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('end', () => resolve(Buffer.concat(chunks)));
		stream.on('error', reject);
	});
};

// Helper function to append _map before the file extension
function generateNewKey(originalKey) {
	const extname = path.extname(originalKey); // Get file extension
	const basename = path.basename(originalKey, extname); // Get file name without extension
	return `${basename}_map${extname}`; // Append _map to file name
}

export default {
	uploadImageToS3,
	uploadImageToS3Unix,
	deleteImageFromS3,
	uploadToS3,
	copyImageToDestination,
	resizeAndUploadImage,
};
