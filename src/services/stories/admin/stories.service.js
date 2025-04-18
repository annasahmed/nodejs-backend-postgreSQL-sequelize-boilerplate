import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');

async function createStory(req) {
	const {
		title,
		link_type,
		link,
		placeId,
		monthlyDealId,
		userId,
		status = true,
		logo,
		featured,
		videos,
		start_date,
		end_date,
	} = req.body;

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdStory = await db.stories
		.create({
			title,
			link_type,
			link: link || null,
			place_id: placeId || null,
			monthly_deal_id: monthlyDealId || null,
			user_id: userId,
			status,
			logo,
			featured,
			videos,
			start_date,
			end_date,
		})
		.then(async (resultEntity) => {
			return resultEntity.get({ plain: true });
		});

	return createdStory;
}

async function updateStory(req) {
	const {
		title,
		link_type,
		link,
		placeId,
		userId,
		monthlyDealId,
		status,
		logo,
		featured,
		videos,
		start_date,
		end_date,
	} = req.body;

	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}
	let featuredArr;
	try {
		featuredArr = JSON.parse(featured);
	} catch (error) {
		featuredArr = featured;
	}
	let videosArr;
	try {
		videosArr = JSON.parse(videos);
	} catch (error) {
		videosArr = videos;
	}

	console.log(
		featured,
		videos,
		featuredArr,
		videosArr,
		'chkkfeatiures and videos',
	);

	const updatedStory = await db.stories
		.update(
			{
				title,
				link_type,
				link: link || null,
				place_id: placeId || null,
				user_id: userId,
				monthly_deal_id: monthlyDealId || null,
				status,
				logo,
				featured: featuredArr,
				videos: videosArr,
				start_date: start_date || null,
				end_date: end_date || null,
			},
			{
				where: { id: req.params.storyId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then(async (data) => {
			return data[1];
		});

	return updatedStory;
}

async function getStories(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const stories = await db.stories.findAndCountAll({
		order: [['title', 'ASC']],
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
			{
				model: db.place,
				require: true,
				attributes: ['id', 'title'],
			},
			{
				model: db.monthly_deal,
				require: true,
				attributes: ['id', 'title'],
			},
		],
		offset,
		limit,
	});

	return stories;
}

async function deleteStoryById(req) {
	const deletedStory = await db.statusId.destroy({
		where: { id: req.params.storyId || req.body.id },
	});

	if (!deletedStory) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Story not found');
	}

	return deletedStory;
}

export default {
	getStories,
	updateStory,
	createStory,
	deleteStoryById,
};
