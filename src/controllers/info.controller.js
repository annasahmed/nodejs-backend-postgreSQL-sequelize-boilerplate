import httpStatus from 'http-status';
import {
	adminInfoService,
	apiInfoService,
	imageService,
} from '../services/index.js';
import catchAsync from '../utils/catchAsync.js';

const getInfos = catchAsync(async (req, res) => {
	const clientId = req.headers['clientid'] === 'cms';
	const infos = clientId
		? await adminInfoService.getInfos(req)
		: await apiInfoService.getInfos(req);
	res.send({ infos });
});

const addInfo = catchAsync(async (req, res) => {
	const info = await adminInfoService.createInfo(req);
	res.status(httpStatus.CREATED).send({ info });
});

const deleteInfo = catchAsync(async (req, res) => {
	await adminInfoService.deleteInfoById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});

function getContentType(extension) {
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
const updateInfo = catchAsync(async (req, res) => {
	const files = req.files;
	console.log(files, 'chkk files');

	if (files && files.pdf_file?.length > 0) {
		const file = files.pdf_file[0];
		const path = await imageService.uploadImageToS3Unix(file, 'info');
		req.body.link = path || null;
	}
	if (files && files.image?.length > 0) {
		const file = files.image[0];
		const path = await imageService.uploadImageToS3Unix(file, 'info');
		req.body.link = path || null;
	}
	const info = await adminInfoService.updateInfo(req);
	res.status(httpStatus.ACCEPTED).send({ info });
});
export default {
	getInfos,
	addInfo,
	deleteInfo,
	updateInfo,
};
