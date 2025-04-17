const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { apiPageService, adminPageService } = require('../services');

const getPageById = catchAsync(async (req, res) => {
	const page = await apiPageService.getPageById(req.params.pageId);
	res.send({ page });
});
const getPages = catchAsync(async (req, res) => {
	const clientId = req.headers['clientid'] === 'cms';
	const pages = clientId?await adminPageService.getPages(req): await apiPageService.getPages(req);
	res.send({ pages });
});

const addPage = catchAsync(async (req, res) => {
	const page = await adminPageService.createPage(req);
	res.status(httpStatus.CREATED).send({ page });
});

const deletePage = catchAsync(async (req, res) => {
	await adminPageService.deletePageById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updatePage = catchAsync(async (req, res) => {
	const page = await adminPageService.updatePage(req);
	res.status(httpStatus.ACCEPTED).send({ page });
});
module.exports = {
	getPages,
	getPageById,
	addPage,
	deletePage,
	updatePage,
};
