import httpStatus from 'http-status';
import config from '../../../config/config.js';
import db from '../../../db/models/index.js';
import ApiError from '../../../utils/ApiError.js';
import { getOffset } from '../../../utils/query.js';

async function getPageByTitle(title) {
	const page = await db.page.findOne({
		where: { title },
		attributes: [
			'id'
		],
	});
	//

	return page;
}

async function createPage(req) {
	const { title, status, view, slug } = req.body;
	const page = await getPageByTitle(title);

	if (page) {
		throw new ApiError(httpStatus.CONFLICT, 'This Page already exits');
	}

	const createdPage = await db.page
		.create({
			title,
			view,
			status,
			slug
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdPage;
}

async function getPages(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const pages = await db.page.findAndCountAll({
		order: [
			['title', 'ASC']
		],
		attributes: [
			'id',
			'title',
			'slug',
			'details',
			'view',
			'status'
		],
		offset,
		limit,
		raw: true,
	});
	return pages;
}

async function deletePageById(req) {
	const deletedPage = await db.page.destroy({
		where: { id: req.params.pageId || req.body.id },
	});

	if (!deletedPage) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
	}

	return deletedPage;
}

async function updatePage(req) {
	const { title } = req.body;
	if (title) {
		const page = await getPageByTitle(title);

		if (page) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This Page already exits',
			);
		}
	}

	const updatedPage = await db.page
		.update(
			{ ...req.body },
			{
				where: { id: req.params.pageId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedPage;
}

export default {
	getPages,
	createPage,
	deletePageById,
	updatePage,
};
