import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const {
	userService,
	adminappUserService,
	imageService,
} from '../services'

const getAppUserById = catchAsync(async (req, res) => {
	const user = await adminappUserService.getAppUserById(req.params.userId);
	res.send({ user });
});
const validateColumns = catchAsync(async (req, res) => {
	const attr = await adminappUserService.validateAttributes(req);
	res.send({ attr });
});

const getAppUserDetails = catchAsync(async (req, res) => {
	const user = await adminappUserService.getAppUserDetails(req.params.userId);
	res.send({ user });
});
const getAppUsers = catchAsync(async (req, res) => {
	const clientId = await req.headers['clientid'];
	const appUsers = !clientId
		? await adminappUserService.getAppUsers(req)
		: await adminappUserService.testGetAppUsers(req);
	res.send({ appUsers });
});
const getFavouritePlaces = catchAsync(async (req, res) => {
	const places = await adminappUserService.getFavouritePlacesById(
		req.params.userId,
	);
	res.send({ places });
});
const addFavouritePlace = catchAsync(async (req, res) => {
	const place = await adminappUserService.addFavouritePlace(req);
	res.status(httpStatus.CREATED).send({ message: 'added successfully' });
});
const removeFavouritePlace = catchAsync(async (req, res) => {
	const place = await adminappUserService.removeFavouritePlace(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});

const deleteAppUser = catchAsync(async (req, res) => {
	await adminappUserService.deleteAppUserById(req.params.userId);
	res.send({ success: true });
});

const updateAppUser = catchAsync(async (req, res) => {
	if (req?.files?.image?.length > 0) {
		const image =
			req?.files.image &&
			(await imageService.uploadImageToS3Unix(
				req?.files?.image[0],
				'appUser',
			));
		req.body.image = image || '';
	}

	const user = await adminappUserService.updateAppUser(req);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'App User not found');
	}

	delete user.password;
	res.send({ user });
});

export default {
	getAppUsers,
	updateAppUser,
	addFavouritePlace,
	removeFavouritePlace,
	getAppUserById,
	getFavouritePlaces,
	deleteAppUser,
	getAppUserDetails,
	validateColumns,
};
