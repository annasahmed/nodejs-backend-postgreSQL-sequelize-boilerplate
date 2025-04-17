const {uploadToS3} = require('../services/image.service');

const bwipjs = require('bwip-js');

async function generateBarcode(text) {
	return new Promise((resolve, reject) => {
		bwipjs.toBuffer({
			bcid: 'code128',       // Barcode type
			text: text,            // Text to encode
			scale: 3,              // 3x scaling factor
			height: 10,            // Bar height, in millimeters
			includetext: false,     // Show human-readable text
			textxalign: 'center',  // Always good to set this
		}, function (err, png) {
			if (err) {
				reject(err);
			} else {
				resolve(png);
			}
		});
	});
}


async function generateBarCode(barcodeText, userId) {
	const date = new Date();
	const fileName = `barcodes/${userId}/${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${barcodeText}.png`;
	let path = null;
	const pngBuffer = await generateBarcode(barcodeText);
	if (!pngBuffer) {
		return null;
	}
	path = await uploadToS3(pngBuffer, fileName);
	return path;
}

module.exports = {
	generateBarCode
}
