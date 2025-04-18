import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js');
const roleService = require('../../role.service.js');
const { refactorCode } = require('../../../utils/globals.js');
const { default: axios } = require('axios');

async function getAppUserByEmail(email) {
	const user = await db.appUser.findOne({
		where: { email },
		raw: true,
	});
	return user;
}

async function createAppUser(req) {
	const {
		email,
		firstName,
		lastName,
		password,
		instagramId,
		phoneNumber,
		status,
		is_social,
	} = req.body;
	const hashedPassword = password ? await encryptData(password) : null;
	const user = await getAppUserByEmail(email);

	if (user) {
		throw new ApiError(httpStatus.CONFLICT, 'This email already exits');
	}

	const createdAppUser = await db.appUser
		.create({
			first_name: firstName,
			last_name: lastName,
			email,
			status,
			instagram_id: instagramId,
			phone_number: phoneNumber,
			password: hashedPassword,
			is_social: is_social || false,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdAppUser;
}
async function deleteAppUserById(userId) {
	const deletedUser = await db.appUser.destroy({
		where: { id: userId },
	});

	if (!deletedUser) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	return deletedUser;
}

async function getFavouriteById(appUserId, placeId) {
	const favouritePlace = await db.appUser_favourite_place.findOne({
		where: { place_id: placeId, app_user_id: appUserId },
	});

	return favouritePlace;
}

async function getFavouritePlacesById(appUserId) {
	const favouritePlacesIds = await db.appUser_favourite_place.findAll({
		where: { app_user_id: appUserId },
		raw: true,
	});
	//console.log(favouritePlacesIds, 'favouritePlacesIds');
	const placeIds = favouritePlacesIds.map((place) => place.placeId);

	const favouritePlaces = await db.place.findAll({
		where: { id: placeIds, status: true },
		include: [
			{
				model: db.media,
				required: true,
				attributes: ['logo', 'featured', 'reel'],
			},
		],
		attributes: [
			'id',
			'title',
			'address',
			'trending',
			'latitude',
			'longitude',
			'ratings',
			'reviews',
		],
		order: [['id', 'DESC']],
		raw: true,
	});
	refactorCode(favouritePlaces, [
		{
			title: 'media',
			items: ['logo', 'featured', 'reel'],
		},
	]);
	for (const place of favouritePlaces) {
		const cuisines = await db.place_to_cuisine.findAll({
			where: { place_id: place.id },
			attributes: ['cuisine_id'],
			raw: true,
		});
		const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
		place.cuisines = await db.cuisine.findAll({
			where: { id: cuisineIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		const sub_categories = await db.place_to_subcategory.findAll({
			where: {
				place_id: place.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		place.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		const deals = await db.place_to_deal.findAll({
			where: { place_id: place.id },
			attributes: ['deal_id'],
			raw: true,
		});
		const dealIds = deals.map((deal) => deal.deal_id);
		place.deals = await db.deal.findAll({
			where: { id: dealIds, status: true },
			attributes: ['title'],
			raw: true,
		});
	}
	return favouritePlaces;
}

async function addFavouritePlace(req) {
	const { placeId } = req.body;
	const appUserId = req.params.userId;

	const favouritePlaceId = await getFavouriteById(appUserId, placeId);
	if (favouritePlaceId) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This favourite place already exits',
		);
	}

	const favouritePlace = await db.appUser_favourite_place
		.create({
			placeId,
			appUserId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	// return favouritePlace;
}
async function removeFavouritePlace(req) {
	const { placeId } = req.body;
	const appUserId = req.params.userId;

	const favouritePlace = await db.appUser_favourite_place.destroy({
		where: { place_id: placeId, app_user_id: appUserId },
	});
	// .then((resultEntity) => resultEntity.get({ plain: true }));
	if (!favouritePlace) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
	}
	// return favouritePlace;
}

async function updateAppUser(req) {
	const {
		password,
		email,
		firstName,
		lastName,
		instagramId,
		phoneNumber,
		dateOfBirth,
	} = req.body;
	if (password) {
		const hashedPassword = await encryptData(password);

		if (!hashedPassword) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Internal Server Error',
			);
		}

		req.body.password = hashedPassword;
	}
	if (email) {
		const existedUser = await getAppUserByEmail(email);

		if (existedUser) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This email is already exist',
			);
		}
	}
	if (firstName) {
		req.body.first_name = firstName;
	}
	if (lastName) {
		req.body.last_name = lastName;
	}
	if (instagramId) {
		req.body.instagram_id = instagramId;
	}
	if (phoneNumber) {
		req.body.phone_number = phoneNumber;
	}
	if (dateOfBirth) {
		req.body.date_of_birth = dateOfBirth;
	}

	const updatedUser = await db.appUser
		.update(
			{ ...req.body },
			{
				where: { id: req.params.userId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => {
			return data[1];
		});

	return updatedUser;
}

async function getAppUsers(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const appUsers = await db.appUser.findAndCountAll({
		order: [
			['first_name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		attributes: [
			'id',
			'first_name',
			'last_name',
			'email',
			'instagram_id',
			'status',
			'isLogged',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});

	for (const appUser of appUsers.rows) {
		//console.log(appUser);
		const places = await db.appUser_favourite_place.findAll({
			where: {
				app_user_id: appUser.id,
			},
			attributes: ['place_id'],
			raw: true,
		});
		//console.log(places, 'places');
		const placeIds = places.map((place) => place.place_id);
		appUser.favourites = await db.place.findAll({
			where: { id: placeIds, status: true },
			attributes: ['id', 'title', 'ratings', 'reviews'],
			raw: true,
		});
	}
	//console.log(appUsers);
	return appUsers;
}

async function getAppUserById(id, req) {
	const user = await db.appUser.findOne({
		where: { id },
		attributes: [
			'id',
			'first_name',
			'last_name',
			'email',
			'instagram_id',
			'image',
			'gender',
			'is_social',
			'date_of_birth',
			'phone_number',
			'isLogged',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		raw: true,
	});
	const places = await db.appUser_favourite_place.findAll({
		where: { app_user_id: user.id },
		attributes: ['place_id'],
		raw: true,
	});
	user.favorites = places?.map((v) => v.place_id);

	return user;
}

export default {
	createAppUser,
	getAppUsers,
	updateAppUser,
	getAppUserById,
	addFavouritePlace,
	removeFavouritePlace,
	getFavouritePlacesById,
	deleteAppUserById,
};
