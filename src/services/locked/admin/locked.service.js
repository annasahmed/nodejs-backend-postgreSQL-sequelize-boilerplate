const db = require('../../../db/models').default;
const { Op } = require('sequelize');

const cron = require('node-cron');

// Schedule job to delete expired OTPs every minute
cron.schedule('* * * * *', async () => {
	await db.locked.destroy({
		where: {
			created_date_time: {
				[Op.lt]: new Date(Date.now() - 20 * 60 * 1000),
			},
		},
	});
	// //console.log('Deleted expired OTPs');
});

async function createLocked(req) {
	const { table, recordId, userId } = req.body;
	const record = await getLockedByConditionBody(req);
	if (!record) {
		const createdLocked = await db.locked
			.create({
				table,
				record_id: recordId,
				user_id: userId,
			})
			.then((resultEntity) => resultEntity.get({ plain: true }));

		return createdLocked;
	} else {
		throw new Error(`Someone is already editing`);
	}
}
async function getLockedByConditionBody(req) {
	const { table, recordId, userId } = req.body;
	const lockedData = await db.locked.findOne({
		where: {
			table,
			record_id: recordId,
			user_id: {
				[Op.ne]: userId,
			},
		},
		raw: true,
	});

	return lockedData;
}
async function getLockedByCondition(req) {
	const { table, recordId, userId } = req.params;
	const lockedData = await db.locked.findOne({
		where: {
			table,
			record_id: recordId,
			user_id: {
				[Op.ne]: userId,
			},
		},
		raw: true,
	});

	return lockedData;
}
async function getLockedByUserId(req) {
	const lockedData = await db.locked.findAll({
		where: {
			table: req.params.table,
			user_id: req.params.userId,
		},
		raw: true,
	});

	return lockedData;
}
async function deleteLockedByUserId(req) {
	const lockedData = await db.locked.destroy({
		where: {
			user_id: req.params.userId,
			table: req.params.table,
		},
	});

	return lockedData;
}
async function getLockedByConditionWithoutUserid(req) {
	const { table, recordId } = req.body;
	const lockedData = await db.locked.findOne({
		where: {
			table,
			record_id: recordId,
		},
		raw: true,
	});

	return lockedData;
}

async function deleteLocked(req) {
	const { table, recordId } = req.body;
	const data = await db.locked.destroy({
		where: {
			table,
			record_id: recordId,
		},
	});
}

export default {
	getLockedByCondition,
	createLocked,
	deleteLocked,
	getLockedByUserId,
	deleteLockedByUserId,
};
