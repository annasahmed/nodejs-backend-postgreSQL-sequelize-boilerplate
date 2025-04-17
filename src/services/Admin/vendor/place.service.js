const { Op } = require('sequelize');
const db = require('../../../db/models').default;
const Sequelize = require('sequelize');
const httpStatus = require('http-status');

const {
	refactorCode,
	convert24to12,
	getAssociatePlaces,
} = require('../../../utils/globals.js');
const { sendEmail } = require('../../email.service.js');
const ApiError = require('../../../utils/ApiError');
const dayjs = require('dayjs');

async function checkVendorById(id) {
	return await db.vendors.findOne({
		where: {
			id,
			allow_portal_access: true,
		},

		attributes: ['id'],
	});
}

async function getVendorByEmail(email) {
	return await db.vendors.findOne({
		where: {
			email,
			allow_portal_access: true,
		},
		attributes: ['id', 'password'],
	});
}

async function getVendorByUsername(username) {
	return await db.vendors.findOne({
		where: {
			username,
			allow_portal_access: true,
		},
		attributes: ['id', 'password', 'name', 'is_logged'],
	});
}

async function getVendorById(vendorId, req) {
	let places = await db.vendor_place.findAll({
		where: {
			vendor_id: vendorId,
			status: true,
		},
	});
	places = JSON.parse(JSON.stringify(places));
	const placeDetails = [];
	for (const vendorPlace of places) {
		const id = vendorPlace.place_id;
		const rawPlace = await db.place.findOne({
			where: {
				id,
				// package_id: {
				// 	[Op.ne]: 2,
				// },
			},
			include: [
				{
					model: db.packages,
					require: true,
					attributes: ['name', 'description', 'fee', 'month'],
				},
				{
					model: db.subscription_status,
					require: true,
					attributes: ['name'],
				},
				{
					model: db.emirate,
					require: false,
					attributes: ['name'],
				},
				{
					model: db.area,
					require: true,
					attributes: ['name'],
				},
				{
					model: db.user,
					require: true,
					attributes: ['first_name', 'last_name'],
				},
				{
					model: db.media,
					require: true,
					attributes: ['logo', 'featured', 'reel'],
				},
			],

			attributes: [
				'id',
				'title',
				'slug',
				'excerpt',
				'about',
				'address',
				'iframe',
				'contact',
				'website',
				'hotel',
				'ratings',
				'reviews',
				'instagram',
				'booking_url',
				'menu',
				'location',
				'latitude',
				'longitude',
				'status',
				'trending',
				'is_commission',
				'commission',
				'is_ecommerce',
				'ecommerce_code',
				'ecommerce_affiliation',
				'place_pin',
				'created_date_time',
				'modified_date_time',
			],
		});

		const place = {
			...rawPlace?.get({ plain: true }), // Get a plain object without Sequelize metadata
		};
		place.associatedPlace = (
			await db.place_to_place.findAll({
				where: {
					[Op.or]: [
						{ placeId: place.id },
						{ relatedPlaceId: place.id },
					],
				},
				raw: true,
			})
		)?.map((place) => (place.relatedPlaceId != id ? id : place.placeId));
		place.media = place.media[0];
		const sub_categories = await db.place_to_subcategory.findAll({
			where: {
				place_id: place.id,
			},
			attributes: ['sub_category_id', 'days'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		place.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title', 'color'],
			raw: true,
		});
		place.sub_categories = place.sub_categories?.map((v) => {
			const id = sub_categories.find((id) => {
				return id.sub_category_id === v.id;
			});
			return { ...v, days: id.days };
		});
		const usps = await db.place_to_usp.findAll({
			where: { place_id: place.id },
			attributes: ['usp_id'],
			raw: true,
		});
		const uspIds = usps.map((usp) => usp.usp_id);
		place.usps = await db.usp.findAll({
			where: { id: uspIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		place.timings = await db.timing.findAll({
			where: { place_id: place.id },
			attributes: ['id', 'day', 'opening', 'closing'],
			raw: true,
		});

		place.timings = place.timings?.reduce((acc, timing) => {
			if (timing?.opening || timing?.closing) {
				const newTiming = {
					...timing,
					opening: timing?.opening
						? convert24to12(timing.opening)
						: timing?.opening,
					closing: timing?.closing
						? convert24to12(timing.closing)
						: timing?.closing,
				};
				acc.push(newTiming);
			}
			return acc;
		}, []);

		place.happening = await db.happening.findAll({
			where: { place_id: place.id },
			order: [['weight', 'ASC']],
			attributes: ['id', 'title', 'description', 'user_id'],
			raw: true,
		});
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
		const deals = await db.place_to_deal.findAll({
			where: { place_id: place.id },
			attributes: ['deal_id'],
			raw: true,
		});

		const dealIds = deals.map((deal) => deal.deal_id);
		place.deals = await db.deal.findAll({
			where: { id: dealIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		place.deals = await db.deal.findAll({
			where: { id: dealIds },
			attributes: ['id', 'title'],
			include: [
				{
					model: db.parent_deal,
					require: true,
					attributes: ['id', 'image', 'type', 'discount'],
				},
			],
			raw: true,
		});
		refactorCode(place.deals, [
			{
				title: 'parent_deal',
				items: ['id', 'image', 'type', 'discount'],
			},
		]);
		if (place?.deals.length) {
			for (const deal of place.deals) {
				deal.parent_deal.discount = parseFloat(
					deal.parent_deal.discount,
				);
				const dealSub_categories = await db.deal_to_subcategory.findAll(
					{
						where: {
							deal_id: deal.id,
						},
						attributes: ['sub_category_id'],
						raw: true,
					},
				);
				const dealSubCategoryIds = dealSub_categories.map(
					(subCategory) => subCategory.sub_category_id,
				);
				deal.sub_categories = await db.sub_category.findAll({
					where: { id: dealSubCategoryIds },
					attributes: ['id', 'title'],
					include: [
						{
							model: db.category,
							require: false,
							attributes: ['id', 'name'],
						},
					],
					raw: false,
				});
				let category = '';

				for (const subCat of deal.sub_categories) {
					if (subCat?.category?.name === 'both') {
						category = 'Foods & Beverages, Lifestyle & Activities';
					} else if (
						!category.includes(subCat?.category?.name) &&
						category !== ''
					) {
						category += `, ${subCat?.category?.name}`;
					} else {
						category = subCat?.category?.name;
					}
				}
				deal.category = category;
			}
		}
		placeDetails.push(place);
	}
	return placeDetails;
}

async function requestEdit(req) {
	let bodyContent = '';
	Object.keys(req.body).forEach(function (key) {
		bodyContent += `<tr><td style="border: 1px solid black; padding:5px;">${key}:</td><td style="border: 1px solid black; padding:5px;">${req.body[key]}</td></tr>`; // Append each key-value pair to the string
	});
	const text = `Hi Admin,
		<br/>
		<br/>
		Received following edit request from ${req.body.title}, please review the edit request and update details accordingly.
		<br/>
		<br/>
		
		<b>Request Data</b>
		<br/>
		<table style="border: 1px solid black;">
		${bodyContent}
		</table>
		<br/>
		<br/>

	Best regards,
	<br/>
	Dubai Daily Deal
	<br/>
	<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>
	`;
	// await sendEmail(
	// 	'annasahmed1609@gmail.com',
	// 	`Edit Request Recieved from ${req.body.title}`,
	// 	text,
	// 	[],
	// 	[],
	// );
	await sendEmail(
		'sarah@dubaidailydeals.app',
		`Edit Request Received from ${req.body.title}`,
		text,
		[],
		['salmanazeemkhan@gmail.com', 'ammarzahid007@gmail.com'],
	);
}

const getContract = async (id) => {
	return await db.vendors.findOne({
		where: { id },
		attributes: ['id', 'name', 'email'],
		include: [
			{
				model: db.contracts,
				where: { is_contract_signed: false },
				attributes: ['contract_path', 'id'],
				required: false,
			},
		],
	});
};

const signContract = async (req) => {
	const { vendorId } = req.params;
	const vendor = await db.vendors.findByPk(vendorId);

	if (!vendor) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
	}
	const contractIds = req.body.contract_ids;
	for (const contractId of contractIds) {
		const contract = await db.contracts.findOne({
			where: {
				vendor_id: vendorId,
				is_contract_signed: false,
				id: contractId,
			},
		});
		if (!contract) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Contract not found');
		}
		if (contract.is_contract_signed) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Contract already signed',
			);
		}

		await contract.update({
			is_contract_signed: true,
			signature: req.body.signature,
			signed_at: dayjs(),
		});
	}
	return await getContract(vendorId);
};

module.exports = {
	getVendorById,
	getVendorByEmail,
	getVendorByUsername,
	checkVendorById,
	requestEdit,
	getContract,
	signContract,
};
