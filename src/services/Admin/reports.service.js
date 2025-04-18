const db = require('../../db/models').default;
const { Op, Sequelize, where } = require('sequelize');
const { countanalytic } = require('../analytic/admin/analytic.service');
import dayjs from 'dayjs'
const config = require('../../config/config');

const appUsersReport = async (req) => {
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;
	const sort = req.query.sort ?? 'id';
	const sortType = req.query.order ?? 'DESC';
	let whereClauses = [];

	if (req.query.search) {
		whereClauses.push(
			`"appUser"."first_name" ILIKE '%${req.query.search}%'`,
			`"appUser"."last_name" ILIKE '%${req.query.search}%'`,
			`"appUser"."email" ILIKE '%${req.query.search}%'`,
			`"appUser"."instagram_id" ILIKE '%${req.query.search}%'`,
		);
	}

	if (req.query.fromDate) {
		whereClauses.push(
			`"appUser"."created_date_time" >= '${req.query.fromDate}'`,
		);
	}

	if (req.query.toDate) {
		whereClauses.push(
			`"appUser"."created_date_time" <= '${req.query.toDate}'`,
		);
	}

	const whereQuery =
		whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

	const query = `
      SELECT "appUser"."id",
             "appUser"."first_name",
             "appUser"."last_name",
             "appUser"."email",
             "appUser"."instagram_id",
             "appUser"."created_date_time",
             SUM("deal_redemption"."discount_amount") AS "total_savings",
             SUM("deal_redemption"."total")           AS "total_spent"
      FROM "appUser"
               LEFT JOIN "deal_redemption" ON "appUser"."id" = "deal_redemption"."user_id"
          ${whereQuery}
      GROUP BY "appUser"."id", "appUser"."first_name"
      ORDER BY ${sort} ${sortType}
          LIMIT :limit
      OFFSET :offset;
  `;

	const replacements = {
		limit,
		offset,
	};

	const [results, metadata] = await db.sequelize.query(query, {
		replacements,
	});

	const countQuery = `
      SELECT COUNT(DISTINCT "appUser"."id") AS "count"
      FROM "appUser";
  `;

	const countResult = await db.sequelize.query(countQuery, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	const count = countResult[0].count;
	const rows = results;

	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};
const vendorsReport = async (req) => {
	const limit = parseInt(req.query.limit ?? 10);

	const search = req.query.search ?? '';
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;
	const sort = req.query.sort ?? 'id';
	const sortType = req.query.order ?? 'DESC';

	const sortMapping = {
		views: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'place_click'
    )`),
		book_now: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'book_now_click'
    )`),
		redeem_now: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'redeem_now_click'
    )`),
		redeem_now_success: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM deal_redemption AS a
      WHERE a.place_id = place.id
    )`),
		pin_add: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'place_pin_add'
    )`),
		show_code: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'show_code_click'
    )`),
		copy_code: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'copy_code_click'
    )`),
		buy_now: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'buy_now_click'
    )`),
		nearby_place_item: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'nearby_place_item'
    )`),
		specialdeal_item: Sequelize.literal(`(
      SELECT COUNT(*)
      FROM analytic AS a
      WHERE a.place_id = place.id AND a.event = 'specialdeal_item'
    )`),
	};

	let order = [];
	if (sort in sortMapping) {
		order.push([sortMapping[sort], sortType]);
	} else {
		order.push([sort, sortType]);
	}

	const vendors = await db.place.findAndCountAll({
		where: {
			title: {
				[Op.iLike]: `%${search}%`,
			},
		},
		attributes: [
			'id',
			'title',
			[sortMapping.book_now, 'book_now'],
			[sortMapping.views, 'views'],
			[sortMapping.redeem_now, 'redeem_now'],
			[sortMapping.redeem_now_success, 'redeem_now_success'],
			[sortMapping.pin_add, 'pin_add'],
			[sortMapping.show_code, 'show_code'],
			[sortMapping.copy_code, 'copy_code'],
			[sortMapping.buy_now, 'buy_now'],
		],
		order: order,
		include: [
			{
				model: db.analytic,
				required: false,
				attributes: ['id', 'event'],
			},
		],
		limit: limit,
		offset: offset,
	});

	return {
		total: vendors.count,
		page: parseInt(page),
		data: vendors.rows,
		limit: limit,
	};
};
const specialDealsReport = async (req) => {
	const limit = parseInt(req.query.limit ?? 10);

	const search = req.query.search ?? '';
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const whereClause = {
		[Op.and]: [
			req.query.fromDate
				? { created_date_time: { [Op.gte]: req.query.fromDate } }
				: null,
			req.query.toDate
				? { created_date_time: { [Op.lte]: req.query.toDate } }
				: null,
		].filter(Boolean), // Exclude null conditions
	};

	const specialDeals = await db.monthly_deal.findAndCountAll({
		where: {
			title: {
				[Op.iLike]: `%${search}%`,
			},
		},
		attributes: ['id', 'title'],

		// order: [['weight', 'ASC']],
		include: [
			{
				model: db.analytic,
				required: false,
				attributes: ['id', 'event'],
				where: { ...whereClause },
				include: [
					{
						model: db.place,
						required: false,
						attributes: ['id', 'title'],
					},
				],
			},
		],
		// limit: limit,
		offset: offset,
	});

	return {
		total: limit,
		// total: specialDeals.count,
		page: parseInt(page),
		data: specialDeals.rows,
		limit: limit,
	};
};

const homepageReport = async (req) => {
	const fromDate = req.query.fromDate
		? new Date(req.query.fromDate).toISOString()
		: null; // Format 'YYYY-MM-DD'
	const toDate = req.query.toDate
		? new Date(req.query.toDate).toISOString()
		: null;

	const whereClause = {
		[Op.and]: [
			fromDate ? { created_date_time: { [Op.gte]: fromDate } } : null,
			toDate ? { created_date_time: { [Op.lte]: toDate } } : null,
		].filter(Boolean), // Exclude null conditions
	};
	const analytics = (
		await db.analytic.count({
			where: {
				...whereClause,
			},
			attributes: ['event'],
			group: ['event'],
		})
	).reduce((acc, item) => {
		acc[item.event] = item.count;
		return acc;
	}, {});
	const searchKeywords = (
		await db.analytic.findAll({
			where: {
				event: 'search_place',
				...whereClause,
			},
			attributes: ['description'],
		})
	)?.map((v) => v.description);
	return {
		data: analytics,
		searchKeywords,
	};
};
const specialDealsReport1 = async (req) => {
	const fromDate = req.query.fromDate
		? new Date(req.query.fromDate).toISOString()
		: null; // Format 'YYYY-MM-DD'
	const toDate = req.query.toDate
		? new Date(req.query.toDate).toISOString()
		: null;

	const whereClause = {
		[Op.and]: [
			fromDate ? { created_date_time: { [Op.gte]: fromDate } } : null,
			toDate ? { created_date_time: { [Op.lte]: toDate } } : null,
		].filter(Boolean), // Exclude null conditions
	};
	const analytics = await db.analytic.count({
		where: {
			event: ['specialdeal_item', 'specialdeals_all'],
			...whereClause,
		},

		attributes: ['monthly_deal_id'],
		group: ['monthly_deal_id'],
	});
	return analytics;
	return {
		data: analytics,
		// searchKeywords,
	};
};

// const specialDealsReport = async (req) => {
// 	const limit = req.query.limit ?? 10;
// 	const page = req.query.page ?? 1;
// 	const offset = (page - 1) * limit;
// 	const sort = req.query.sort ?? 'id';
// 	const sortType = req.query.order ?? 'DESC';

// 	let whereClauses = {};
// 	if (req.query.search) {
// 		const search = req.query.search;
// 		whereClauses = {
// 			[Op.or]: [{ '$place.title$': { [Op.iLike]: `%${search}%` } }],
// 		};
// 	}

// 	if (req.query.fromDate) {
// 		whereClauses['$deal_redemption.created_date_time$'] = {
// 			[Op.gte]: req.query.fromDate,
// 		};
// 	}

// 	if (req.query.toDate) {
// 		whereClauses['$deal_redemption.created_date_time$'] = {
// 			[Op.lte]: req.query.toDate,
// 		};
// 	}

// 	const { rows, count } = await db.analytic.findAndCountAll({
// 		limit,
// 		offset,
// 		// order: [[sort, sortType]],
// 		include: [
// 			{
// 				model: db.monthly_deal,
// 				as: 'monthly_deal',
// 				attributes: ['id', 'title'],
// 			},
// 			// {
// 			// 	model: db.place,
// 			// 	as: 'place',
// 			// 	attributes: ['title'],
// 			// },
// 		],
// 		where: {
// 			event: ['specialdeal_item', 'specialdeals_all'],
// 			// ...whereClauses,
// 		},
// 		attributes: ['monthly_deal_id'],
// 		group: ['monthly_deal_id', 'monthly_deal.id', 'monthly_deal.title'], // Include related table columns
// 		// attributes: ['event'],
// 		// group: ['event'],
// 	});
// 	console.log(count, 'chkk count');

// 	return {
// 		total: count.length, // Since findAndCountAll returns grouped counts
// 		page: parseInt(page),
// 		data: rows,
// 		limit: limit,
// 	};
// };

const dealRedemptionReport = async (req) => {
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;
	const sort = req.query.sort ?? 'id';
	const sortType = req.query.order ?? 'DESC';

	let whereClauses = {};
	if (req.query.search) {
		const search = req.query.search;
		whereClauses = {
			[Op.or]: [
				{ '$user.first_name$': { [Op.iLike]: `%${search}%` } },
				{ '$user.last_name$': { [Op.iLike]: `%${search}%` } },
				{ '$user.email$': { [Op.iLike]: `%${search}%` } },
				{ '$place.title$': { [Op.iLike]: `%${search}%` } },
			],
		};
	}

	if (req.query.fromDate) {
		whereClauses['$deal_redemption.created_date_time$'] = {
			[Op.gte]: req.query.fromDate,
		};
	}

	if (req.query.toDate) {
		whereClauses['$deal_redemption.created_date_time$'] = {
			[Op.lte]: req.query.toDate,
		};
	}

	const { rows, count } = await db.deal_redemption.findAndCountAll({
		limit,
		offset,
		order: [[sort, sortType]],
		include: [
			{
				model: db.appUser,
				as: 'user',
				attributes: [
					'first_name',
					'last_name',
					'email',
					'instagram_id',
					'created_date_time',
				],
			},
			{
				model: db.place,
				as: 'place',
				attributes: ['title'],
			},
		],
		where: whereClauses,
	});

	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};
const getExpiringHappenings = async (req) => {
	const today = dayjs().startOf('day');
	const nextSevenDays = today.add(7, 'day');

	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const sort = req.query.sort ?? 'id';
	const sortType = req.query.order ?? 'DESC';
	let whereClauses = {};

	let startDate = today.toDate();
	let endDate = nextSevenDays.toDate();
	if (req.query.fromDate) {
		startDate = dayjs(req.query.fromDate).startOf('day').toDate();
	}
	if (req.query.toDate) {
		endDate = dayjs(req.query.toDate).endOf('day').toDate();
	}
	if (req.query.search) {
		const search = req.query.search;
		whereClauses = {
			[Op.and]: [
				{ title: { [Op.iLike]: `%${search}%` } },
				{ '$place.title$': { [Op.iLike]: `%${search}%` } },
				{ '$season.title$': { [Op.iLike]: `%${search}%` } },
			],
		};
	}

	const { count, rows } = await db.happening.findAndCountAll({
		include: [
			{
				model: db.seasons,
				required: false,
				where: {
					end_date: {
						[Op.between]: [startDate, endDate],
					},
				},
				attributes: ['id', 'title', 'start_date', 'end_date'],
			},
			{
				model: db.place,
				attributes: ['id', 'title'],
			},
		],
		attributes: ['id', 'title', 'season_id', 'start_date', 'end_date'],
		where: {
			[Op.or]: [
				{
					end_date: {
						[Op.between]: [startDate, endDate],
					},
				},
				{
					'$season.end_date$': {
						[Op.between]: [startDate, endDate],
					},
				},
			],
			// ...whereClauses
		},
		order: [[sort, sortType]],
		offset: offset,
		limit: limit, // Optional pagination
	});

	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};
export default {
	appUsersReport,
	dealRedemptionReport,
	vendorsReport,
	homepageReport,
	getExpiringHappenings,
	specialDealsReport,
};
