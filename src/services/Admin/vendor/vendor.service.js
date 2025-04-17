const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const db = require('../../../db/models').default;
const {
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');
const { encryptData } = require('../../../utils/auth');
const { Op, Sequelize } = require('sequelize');
const { emailService, imageService } = require('../../index');
const stripe = require('../../../config/stripe');
const dayjs = require('dayjs');
const {
	sendInvoiceEmail,
	attachContractFormat,
} = require('../../email.service');
const { uploadToS3 } = require('../../image.service');
const {
	standartContractFormat,
} = require('../../../htmlFormats/contracts/standardContractFormat.js');
const {
	premuimContractFormat,
} = require('../../../htmlFormats/contracts/premuimContractFormat.js');
const {
	vipStandartContractFormat,
} = require('../../../htmlFormats/contracts/vipStandardContractFormat.js');
const config = require('../../../config/config.js');
const { getOffset } = require('../../../utils/query.js');
const jwt = require('jsonwebtoken');

// Get vendor by ID
async function getVendorById(id) {
	let record = await db.vendors.findOne({
		where: { id },
		attributes: [
			'id',
			'name',
			'email',
			'username',
			'contact_person_name',
			'phone_number',
			'trn_number',
			'start_date',
			'grace_period',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		include: [
			{
				model: db.place,
				attributes: ['id', 'title'],
				through: {
					model: db.vendor_place,
					attributes: [
						'package_id',
						'place_id',
						'vendor_id',
						'is_invoiced',
						'id',
						'next_package_id',
					],
					where: {
						status: true,
					},
				},
			},
			{
				model: db.contracts,
			},
		],
	});
	record = JSON.parse(JSON.stringify(record));

	let index = 0;
	for (const place of record.places) {
		record.places[index].package = await db.packages.findOne({
			where: { id: place.vendor_place.package_id },
			attributes: ['id', 'name', 'fee'],
		});
		++index;
	}
	record.has_pending_contract =
		(await db.contracts.count({
			where: { status: true, is_contract_signed: false, vendor_id: id },
		})) > 0;

	return record;
}
async function getVendorName(id) {
	let record = await db.vendors.findOne({
		where: { id },
		attributes: [
			'id',
			'name',
			'email',
			'status',
			'username',
			'is_email_sent',
		],
		raw: true,
	});

	record.places = await db.place.findAll({
		where: {
			vendor_id: record.id,
		},
		attributes: ['id', 'title', 'place_pin'],
		raw: true,
	});

	return record;
}
async function getVendorEmail(email) {
	let record = await db.vendors.findOne({
		where: { email },
		attributes: ['id', 'name', 'email', 'status'],
		raw: true,
	});

	return record;
}

// Get vendor by username
async function getVendorByUsername(username, vendorId = null) {
	const conditions = {
		where: { username, ...checkDeletedCondition },
	};
	if (vendorId) {
		conditions.where.id = {
			[db.Sequelize.Op.ne]: vendorId,
		};
	}
	return await db.vendors.findOne(conditions);
}

async function getVendorByName(name, vendorId = null) {
	const conditions = {
		where: { name, ...checkDeletedCondition },
	};
	if (vendorId) {
		conditions.where.id = {
			[db.Sequelize.Op.ne]: vendorId,
		};
	}
	return await db.vendors.findOne(conditions);
}

// Create a new vendor
async function createVendor(req) {
	let {
		name,
		email,
		username,
		password,
		contact_person_name,
		phone_number,
		trn_number,
		start_date,
		grace_period,
		status,
	} = req.body;

	if (username) {
		const existingVendor = await getVendorByUsername(username);
		if (existingVendor) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This vendor already exists',
			);
		}
	}

	if (name) {
		const existingVendor = await getVendorByName(name);
		if (existingVendor) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This vendor already exists',
			);
		}
	}

	const data = {
		name,
		email,
		username,
		password,
		contact_person_name,
		phone_number,
		trn_number,
		start_date,
		grace_period,
		status,
		allow_portal_access: true,
	};

	if (password && password.length > 0) {
		const hashedPassword = await encryptData(password);
		if (!hashedPassword) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Can't hash password",
			);
		}
		data.password = hashedPassword;
	} else {
		delete data.password;
	}
	const vendor = await db.vendors
		.create(data)
		.then((resultEntity) => resultEntity.get({ plain: true }));
	delete vendor.password;
	return vendor;
}

// Get all vendors with pagination
async function getVendors(req) {
	const { page = 1, limit = 10, search = null, package = null } = req.query;
	const offset = (page - 1) * limit;
	let whereClause = {};
	if (search) {
		whereClause = {
			[Op.or]: {
				name: {
					[Op.iLike]: `%${search}%`,
				},
				email: {
					[Op.iLike]: `%${search}%`,
				},
			},
		};
	}

	const { count, rows } = await db.vendors.findAndCountAll({
		order: [
			['id', 'DESC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			[Op.and]: [whereClause, checkDeletedCondition],
		},
		attributes: [
			'id',
			'name',
			'email',
			'username',
			'contact_person_name',
			'phone_number',
			'trn_number',
			'start_date',
			'grace_period',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
	});

	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: parseInt(limit),
	};
}

// Soft delete a vendor by ID
async function deleteVendorById(req) {
	const id = req.params.vendorId || req.body.id;
	await softDelete(req, 'vendors', id);
	return true;
}

// Update a vendor by ID
async function updateVendor(req) {
	let {
		name,
		email,
		username,
		password,
		contact_person_name,
		phone_number,
		trn_number,
		start_date,
		grace_period,
		status,
	} = req.body;
	const vendorId = req.params.vendorId;

	if (username) {
		const existingVendor = await getVendorByUsername(username, vendorId);
		if (existingVendor) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This vendor already exists',
			);
		}
	}

	if (name) {
		const existingVendor = await getVendorByName(name, vendorId);
		if (existingVendor) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This vendor already exists',
			);
		}
	}

	const data = {
		name,
		email,
		username,
		password,
		contact_person_name,
		phone_number,
		trn_number,
		start_date,
		grace_period,
		status,
	};

	if (password && password.length > 0) {
		const hashedPassword = await encryptData(password);
		if (!hashedPassword) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Can't hash password",
			);
		}
		data.password = hashedPassword;
	} else {
		delete data.password;
	}

	const vendor = await db.vendors
		.update(data, {
			where: { id: vendorId },
			returning: true,
			raw: true,
		})
		.then((data) => {
			return data[1];
		});

	delete vendor[0].password;
	return vendor[0];
}

async function addPlaceToVendor(req) {
	const transaction = await db.sequelize.transaction();
	const records = [];
	try {
		const { places } = req.body;
		for (const place of places) {
			const exist = await db.vendor_place.findOne({
				where: {
					vendor_id: req.params.vendorId,
					place_id: place.place_id,
				},
			});
			let result;
			if (exist && !exist.status) {
				result = exist
					.update(
						{
							status: 1,
							package_id: place.package_id,
							next_package_id: place.package_id,
							is_invoiced: false,
						},
						{ transaction },
					)
					.then((resultEntity) => resultEntity.get({ plain: true }));
			} else {
				result = await db.vendor_place
					.create(
						{
							status: 1,
							is_invoiced: false,
							vendor_id: req.params.vendorId,
							place_id: place.place_id,
							package_id: place.package_id,
							next_package_id: place.package_id,
						},
						{ transaction },
					)
					.then((resultEntity) => resultEntity.get({ plain: true }));
			}

			await db.place.update(
				{ vendor_id: req.params.vendorId },
				{
					where: { id: place.place_id },
					returning: true,
					plain: true,
					raw: true,
					transaction,
				},
			);

			records.push(result);
		}
		await db.contracts.destroy({
			where: {
				vendor_id: req.params.vendorId,
				status: true,
				is_contract_signed: false,
			},
			transaction,
		});
		await transaction.commit();
	} catch (e) {
		await transaction.rollback();
		throw e;
	}
	return records;
}

async function changeVendorPlacePackage(req) {
	const { vendor_place_id, new_package_id, new_next_package_id } = req.body;
	const { vendorId } = req.params;
	if (!vendorId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Vendor ID is required');
	}
	const vendorPlace = await db.vendor_place.findOne({
		where: {
			id: vendor_place_id,
			vendor_id: vendorId,
		},
	});
	if (!vendorPlace) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Place not found against this vendor.',
		);
	}
	if (!vendorPlace.is_invoiced) {
		vendorPlace.package_id = new_package_id;
	}
	vendorPlace.next_package_id = new_next_package_id;
	await db.contracts.destroy({
		where: {
			vendor_id: vendorId,
			status: true,
			is_contract_signed: false,
		},
	});
	await vendorPlace.save();
	return await vendorPlace.reload();
}

const selectContractFormat = (id) => {
	switch (id) {
		case 'standard':
			return standartContractFormat;
		case 'premium':
			return premuimContractFormat;
		default:
			return vipStandartContractFormat;
	}
};

async function sendContract(req) {
	const vendorId = req.params.vendorId;
	const vendor = await getVendorById(vendorId);
	const package_types = [];
	for (const place of vendor.places) {
		if (
			!package_types.filter((v) => v.title === place.package.name)
				.length > 0
		) {
			package_types.push({
				title: place.package.name,
				amount: parseFloat(place.package.fee) || 0,
				id: place.package.id,
			});
		} else {
			package_types[
				package_types.findIndex(
					(item) => item.title === place.package.name,
				)
			].amount += parseFloat(place.package.fee) || 0;
		}
	}
	let contract = await db.contracts.findOne({
		where: {
			vendor_id: vendorId,
			is_contract_signed: false,
			status: true,
		},
	});

	if (!contract) {
		// const { contract_file } = req.files
		// const file = contract_file[0]
		const image = await db.info.findOne({
			where: {
				title: 'contract_signature',
			},
			attributes: ['link'],
			raw: true,
		});
		for (const index in package_types) {
			const pkg = package_types[index];
			const placesLength = vendor.places.filter(
				(place) =>
					!place.vendor_place.is_invoiced &&
					place.vendor_place.package_id === pkg.id,
			).length;
			if (placesLength === 0) {
				continue;
			}

			const file = await attachContractFormat({
				vendor_name: vendor.name,
				number_of_venues: placesLength,
				amount: pkg.amount,
				date_of_contract: new Date().toLocaleDateString(),
				image:
					image && image.link
						? process.env.S3_BUCKET_URL + image.link
						: null,
				html: selectContractFormat(pkg.title.toLowerCase()),
			});
			vendor.image = image;

			// const extension = file.originalname.split('.').pop().toLowerCase();
			const extension = 'pdf';
			const path = await uploadToS3(
				file,
				`vendors/${vendorId}/contracts/${dayjs().unix() + index}.${extension}`,
				'application/pdf',
			);

			contract = await db.contracts.create({
				vendor_id: vendorId,
				is_contract_signed: false,
				status: true,
				contract_path: path,
			});
		}
	}
	// return;
	if (!vendor) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
	}
	if (!contract) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Contract not found');
	}
	if (vendor.is_contract_signed) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Contract already signed');
	}
	if (!vendor.email) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid vendor email');
	}
	await emailService.sendContractEmail(vendor, contract);
	return vendor;
}

async function detachPlace(req) {
	const vendorId = req.params.vendorId;
	const placeId = req.params.placeId;
	const transaction = await db.sequelize.transaction();
	try {
		if (!vendorId) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Vendor Id is required');
		}
		if (!placeId) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Place Id is required');
		}
		const updatedPlace = await db.place.update(
			{
				vendor_id: null,
				package_id: 2,
			},
			{
				where: {
					id: placeId,
				},
				returning: true,
				plain: true,
				raw: true,
				transaction,
			},
		);
		const subscription = await db.subscriptions.findOne({
			where: { place_id: placeId },
		});
		if (subscription) {
			await subscription.destroy({
				transaction,
			});
		}
		const record = await db.vendor_place.update(
			{ status: 0 },
			{
				where: { vendor_id: vendorId, place_id: placeId },
				returning: true,
				plain: true,
				raw: true,
				transaction,
			},
		);

		transaction.commit();
		return { updatedPlace, record };
	} catch (e) {
		transaction.rollback();
		throw e;
	}
}

const sendInvoice = async (req) => {
	const { vendorId } = req.params;
	const vendor = await db.vendors.findByPk(vendorId);
	if (!vendor) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
	}
	if (!vendor.email) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			'Vendor Email needs to configured',
		);
	}
	if (!vendor.start_date) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			'Vendor Start date needs to configured',
		);
	}
	const vendorPlaces = await db.vendor_place.findAll({
		where: {
			vendor_id: vendorId,
			status: true,
			is_invoiced: false,
		},
		include: [
			{
				model: db.place,
				attributes: ['title'],
			},
			{
				model: db.packages,
			},
		],
	});
	if (vendorPlaces.length === 0) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'No Places found for pending invoice',
		);
	}
	let invoice = await db.invoice.findOne({
		where: {
			vendor_id: vendorId,
			status_id: 4,
			invoice_type: 1,
		},
		include: [
			{
				model: db.invoice_items,
			},
		],
	});
	debugger;
	let data;
	const packageNames = new Set();
	if (invoice) {
		const stripeInvoice = await stripe.invoices.retrieve(
			invoice.stripe_invoice_id,
		);
		if (
			stripeInvoice &&
			invoice.invoice_items.length === vendorPlaces.length
		) {
			vendorPlaces.forEach((vendorPlace) => {
				packageNames.add(vendorPlace.package.name);
			});
			data = {
				invoiceNumber: invoice.id,
				title: vendor.name,
				name: vendor.contact_person_name,
				address: vendor.address,
				startDate: dayjs(vendor.start_date).format('DD MMM, YYYY'),
				package_name: Array.from(packageNames).join(','),
				fee: invoice.total_amount,
			};
			await sendInvoiceEmail(
				vendor.email,
				stripeInvoice.hosted_invoice_url,
				data,
			);
			return invoice;
		} else if (stripeInvoice) {
			await stripe.invoices.voidInvoice(stripeInvoice.id);
			await invoice.update({
				status_id: 5,
			});
			await db.invoice_items.update(
				{
					status_id: 5,
				},
				{
					where: {
						invoice_id: invoice.id,
					},
				},
			);
		}
	}
	const customer = await stripe.customers.create({ email: vendor.email });
	let total = 0;
	const transaction = await db.sequelize.transaction();
	try {
		const stripeInvoice = await stripe.invoices.create({
			customer: customer.id,
			collection_method: 'send_invoice',
			auto_advance: false,
			due_date: dayjs()
				.add(vendor.grace_period ? vendor.grace_period : 15, 'days')
				.toDate(),
		});
		for (const vendorPlace of vendorPlaces) {
			// if (!subscription){
			// 	subscription = await db.subscriptions.build();
			// 	let startDate = vendor.start_date ? dayjs(vendor.start_date) : dayjs();
			//
			// 	if (startDate.isBefore(dayjs(), 'day')) {
			// 		startDate = dayjs();
			// 	}
			//
			// 	subscription.start_date = startDate.toDate();
			// 	subscription.end_date = dayjs().add(pkg.month+pkg.trial_months, 'month').toDate()
			// 	subscription.place_id = vendorPlace.place_id;
			// 	subscription.first_purchase_date = startDate;
			// 	subscription.renewal_date = dayjs().add(pkg.month+pkg.trial_months, 'month');
			// 	subscription.package_id = vendorPlace.package_id;
			// 	subscription.next_package_id = vendorPlace.next_package_id;
			// 	subscription.subscription_status_id = 1;
			// 	await subscription.save();
			// }
			await stripe.invoiceItems.create({
				customer: customer.id,
				amount: (vendorPlace.package.fee * 100).toFixed(0),
				currency: 'aed',
				description:
					(vendorPlace.place.title ?? 'Dubai Daily Deals') +
					' - ' +
					vendorPlace.package.name,
				invoice: stripeInvoice.id,
			});
			total += Number(vendorPlace.package.fee);
		}
		total = total.toFixed(2);
		invoice = await db.invoice.create(
			{
				vendor_id: vendorId,
				stripe_invoice_id: stripeInvoice.id,
				status_id: 4,
				subscription_id: null,
				total_amount: total,
				discount_reason: null,
				discount_amount: 0,
			},
			{
				transaction,
			},
		);
		const packageNames = new Set();
		for (const vendorPlace of vendorPlaces) {
			packageNames.add(vendorPlace.package.name);
			await db.invoice_items.create(
				{
					invoice_id: invoice.id,
					vendor_place_id: vendorPlace.id,
					total_amount: vendorPlace.package.fee,
					discount_amount: 0,
					discount_reason: '',
					status_id: 4,
				},
				{
					transaction,
				},
			);
		}
		data = {
			invoiceNumber: invoice.id,
			title: vendor.name,
			name: vendor.contact_person_name,
			address: vendor.address,
			startDate: dayjs(invoice.start_date).format('DD MMM, YYYY'),
			package_name: Array.from(packageNames).join(','),
			fee: total,
		};
		await stripe.invoices.finalizeInvoice(stripeInvoice.id);
		await sendInvoiceEmail(
			vendor.email,
			stripeInvoice.hosted_invoice_url,
			data,
		);
		transaction.commit();
		return invoice;
	} catch (e) {
		console.log(e, 'e');
		transaction.rollback();
		throw e;
	}
};

const vendorInvoicesReport = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;
	const offset = getOffset(page, limit);
	const { rows, count } = await db.invoice.findAndCountAll({
		distinct: true,
		include: [
			{
				model: db.invoice_items,
				attributes: ['id', 'total_amount'],
				include: [
					{
						model: db.vendor_place,
						attributes: ['id'],
						include: [
							{
								model: db.place,
								where: {
									status: true,
									...checkDeletedCondition,
								},
								attributes: ['id', 'title'],
							},
						],
					},
				],
			},
			{
				model: db.vendors,
				attributes: ['id', 'name'],
			},
			{
				model: db.packages,
				attributes: ['id', 'name'],
			},
		],
		attributes: [
			'id',
			'vendor_id',
			'paid_at',
			'invoice_type',
			'total_amount',
			'created_date_time',
		],
		order: [['id', 'ASC']],
		offset,
		limit,
	});

	return {
		data: rows,
		total: count,
		limit,
		page,
	};
};

const sendOnboardingEmailVendor = async (vendorId) => {
	const vendor = await getVendorName(vendorId);

	await emailService.sendWelcomeEmailVendorWithOnbarding(
		vendor.email,
		vendorId,
		vendor.name,
		vendor.username,
		vendor.places || [],
	);

	if (!vendor.is_email_sent) {
		await db.vendors.update(
			{
				is_email_sent: true,
			},
			{
				where: {
					id: vendor.id,
				},
			},
		);
	}

	return;
};
const sendResetPasswordEmail = async (req) => {
	const { email } = req.body;
	const vendor = await getVendorEmail(email);
	if (!vendor) {
		throw new Error(`Invalid email`);
	}

	await emailService.resetPasswordVendorEmail(
		vendor.email,
		vendor.id,
		vendor.name,
	);

	return;
};

const setPasswordVendor = async (req) => {
	const { password, token } = req.body;
	let id;

	try {
		const payload = jwt.verify(token, config.jwt.secret);
		id = payload.vendorId;
	} catch (err) {
		throw new Error(`Invalid token`);
		// throw new Error(`Invalid token: ${err}`);
	}
	const vendor = await getVendorName(id);
	if (!vendor) {
		throw new Error(`Invalid token`);
	}
	// console.log(id, 'chkking token payload');
	// const id = '';
	// return;
	const hashedPassword = await encryptData(password);
	if (!hashedPassword) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Can't hash password",
		);
	}

	await db.vendors
		.update(
			{ password: hashedPassword },
			{
				where: { id },
				returning: true,
				raw: true,
			},
		)
		.then((data) => {
			return data[1];
		});
};

const getVendorsExport = async (req) => {
	const vendors = await db.vendors.findAll({
		order: [
			['id', 'DESC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			[Op.and]: [checkDeletedCondition, { status: true }],
		},
		attributes: [
			'id',
			'name',
			'email',
			'username',
			'contact_person_name',
			'phone_number',
			'trn_number',
			'start_date',
			'grace_period',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		include: [
			{
				model: db.place,
				attributes: ['title', 'place_pin', 'commission'],
				// where: { status: true },
				through: {
					model: db.vendor_place,
					attributes: [
						'package_id',
						'place_id',
						'vendor_id',
						'is_invoiced',
						'id',
						'next_package_id',
					],
					where: {
						status: true,
					},
				},
				include: [
					{
						model: db.deal,
						through: {
							model: db.place_to_deal,
						},
						where: {
							status: true,
						},
						attributes: ['title'],
						include: [
							{
								model: db.parent_deal,
								attributes: ['type', 'discount'],
							},
						],
					},
				],
			},
			{
				model: db.contracts,
				attributes: [
					'contract_path',
					'signed_at',
					'status',
					'deleted_at',
					'deleted_by',
				],
			},
		],
		// include: [
		// 	{
		// 		model: db.vendor_place,
		// 	},
		// ],
	});
	return vendors;
};

module.exports = {
	getVendors,
	createVendor,
	deleteVendorById,
	updateVendor,
	getVendorById,
	addPlaceToVendor,
	sendContract,
	detachPlace,
	sendInvoice,
	changeVendorPlacePackage,
	vendorInvoicesReport,

	sendOnboardingEmailVendor,
	setPasswordVendor,
	sendResetPasswordEmail,
	getVendorsExport,
};
