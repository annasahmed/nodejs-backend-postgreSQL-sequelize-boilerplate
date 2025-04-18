import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');
const {
	refactorCode,
	checkDeletedCondition,
} = require('../../../utils/globals.js');
const { Op } = require('sequelize');

async function getHappeningByTitle(title) {
	const happening = await db.happening.findOne({
		where: { title },
	});

	return happening;
}

async function createHappening(req) {
	const { title, description, placeId, userId, statusId, status } = req.body;

	const createdHappening = await db.happening
		.create({
			title,
			description,
			status,
			place_id: placeId,
			user_id: userId,
			// status_id: statusId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdHappening;
}

async function getHappenings(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const Happenings = await db.happening.findAndCountAll({
		order: [
			['title', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(Happenings, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return Happenings;
}

async function deleteHappeningById(req) {
	const deletedHappening = await db.happening.destroy({
		where: { id: req.params.HappeningId || req.body.id },
	});

	if (!deletedHappening) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Happening not found');
	}

	return deletedHappening;
}

async function updateHappening(req) {
	const { name, statusId, userId } = req.body;

	if (name) {
		const Happening = await getHappeningByTitle(name);

		if (Happening) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This Happening already exits',
			);
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedHappening = await db.happening
		.update(
			{ ...req.body },
			{
				where: { id: req.params.HappeningId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedHappening;
}

// async function getPlacesHappenings(req) {
// 	const { page: defaultPage, limit: defaultLimit } = config.pagination;
// 	const {
// 		page = defaultPage,
// 		limit = defaultLimit,
// 		search,
// 		status,
// 	} = req.query;

// 	const offset = getOffset(page, limit);

// 	const searchCondition = {
// 		...(search && {
// 			[Op.or]: [
// 				{
// 					title: { [Op.iLike]: `%${search}%` },
// 				},
// 			],
// 		}),
// 		...(status !== undefined && {
// 			status,
// 		}),
// 	};

// 	const places = await db.place.findAndCountAll({
// 		where: {
// 			...checkDeletedCondition,
// 			...searchCondition,
// 		},
// 		attributes: ['id', 'title'],
// 		order: [['id', 'DESC']],
// 		offset,
// 		limit,
// 		raw: true,
// 	});

// 	// Loop through places to fetch happenings with pagination
// 	for (const place of places.rows) {
// 		// Fetch happenings with pagination
// 		const happenings = await db.happening.findAndCountAll({
// 			where: { place_id: place.id },
// 			attributes: [
// 				'id',
// 				'title',
// 				'description',
// 				'status',
// 				'start_date',
// 				'end_date',
// 			],
// 			include: [
// 				{
// 					model: db.seasons,
// 					attributes: ['id', 'title'],
// 				},
// 			],
// 			raw: true,
// 		});

// 		// Combine happenings with places
// 		place.happening = happenings.rows;
// 		place.totalHappenings = happenings.count; // Total count for pagination
// 	}

// 	places.page = page;
// 	places.limit = limit;
// 	return places;
// }

async function getPlacesHappenings(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		search,
		status,
		happeningTitle,
	} = req.query;

	const offset = getOffset(page, limit);

	const searchCondition = {
		...(search && {
			title: { [Op.iLike]: `%${search}%` },
		}),
		...(status !== undefined && {
			status,
		}),
	};

	const places = await db.happening.findAndCountAll({
		order: [
			['place_id', 'DESC'],
			['id', 'DESC'],
		],
		include: [
			{
				model: db.seasons,
				attributes: ['id', 'title'],
			},
		],
		where: happeningTitle
			? {
				title: { [Op.iLike]: `%${happeningTitle}%` },
			}
			: {},
		include: [
			{
				model: db.place,
				attributes: ['id', 'title'],
				require: true,
				where: { ...searchCondition, ...checkDeletedCondition },
				include: [
					{
						model: db.sub_category,
						attributes: ['id', 'title'],
					},
				],
			},
		],
		// raw: true,
		offset,
		limit,
	});
	places.page = page;
	places.limit = limit;
	return places;
}

async function updatePlaceHappeningById(req) {
	const { happenings, userId } = req.body;
	let happeningsArr;

	try {
		happeningsArr = happenings && JSON.parse(happenings);
	} catch (error) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid happenings format');
	}

	if (userId) {
		const user = await userService.getUserById(userId);
		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const transaction = await db.sequelize.transaction();

	try {
		// Update happenings
		const updatePromises = happeningsArr.map((happening) => {
			return db.happening.update(
				{
					title: happening.title,
					description: happening.description,
					season_id: happening.seasonId || null,
					start_date: happening.start_date || null,
					end_date: happening.end_date || null,
					status: happening.status,
					user_id: userId,
				},
				{
					where: { id: happening.id },
					transaction,
				},
			);
		});

		await Promise.all(updatePromises);

		// Update categories if they exist
		const updateCategoriesPromises = happeningsArr.flatMap(
			(v) =>
				v.categories?.map(({ place_to_subcategory }) => {
					console.log(place_to_subcategory, 'chkk days');

					let daysArray = place_to_subcategory.days;
					// try {
					// 	daysArray = JSON.parse(place_to_subcategory.days);
					// } catch {
					// 	daysArray = ['daily']; // Default if parsing fails
					// }
					return db.place_to_subcategory.update(
						{
							days: Array.isArray(daysArray)
								? daysArray
								: ['daily'],
						},
						{
							where: {
								place_id: place_to_subcategory.placeId,
								sub_category_id:
									place_to_subcategory.subCategoryId,
							},
							transaction,
						},
					);
				}) || [],
		);

		await Promise.all(updateCategoriesPromises);

		await transaction.commit();
		return true;
	} catch (error) {
		await transaction.rollback();
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			'Failed to update happenings',
		);
	}
}

async function deletePlaceHappeningById(req) {
	const { happenings } = req.body;

	let happeningsArr;
	try {
		happeningsArr = happenings && JSON.parse(happenings);
	} catch (error) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid happenings format');
	}
	console.log(happeningsArr, 'happeningsArrhkkk');

	// Start a transaction for atomicity
	const transaction = await db.sequelize.transaction();

	try {
		// Map delete operations to a Promise array for concurrent execution
		const deletePromises = happeningsArr.map((happening) =>
			db.happening.destroy({
				where: { id: happening },
				transaction,
			}),
		);

		await Promise.all(deletePromises); // Run all deletions concurrently
		await transaction.commit(); // Commit transaction if all deletions succeed
		return true;
	} catch (error) {
		console.log(error, 'chkkerror');

		await transaction.rollback(); // Roll back transaction on error
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			'Failed to delete happenings',
		);
	}
}

async function updatePlaceHappeningStatusById(req) {
	const { status } = req.body;
	await db.happening.update(
		{
			status,
		},
		{
			where: { id: req.params.happeningId },
		},
	);

	return true;
}
async function createHappeningByPlaceId(req) {
	const {
		title,
		description,
		placeId,
		userId,
		status = true,
		start_date,
		end_date,
		seasonId,
	} = req.body;

	const createdHappening = await db.happening
		.create({
			title,
			description,
			status,
			place_id: placeId,
			user_id: userId,
			start_date,
			end_date,
			seasonId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdHappening;
}

export default {
	getHappenings,
	createHappening,
	deleteHappeningById,
	updateHappening,
	getHappeningByTitle,

	//
	getPlacesHappenings,
	updatePlaceHappeningById,
	deletePlaceHappeningById,
	updatePlaceHappeningStatusById,
	createHappeningByPlaceId,
};
