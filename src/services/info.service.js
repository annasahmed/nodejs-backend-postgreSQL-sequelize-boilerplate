import db from '../../../db/models/index.js';

async function getInfos(req) {
	const infosArr = await db.info.findAll({
		order: [
			['title', 'ASC']
		],

		attributes: [
			'title',
			'link'
		],
		raw: true,
	});

	const infos = infosArr?.reduce((acc, curr) => {
		acc[curr.title] = curr.link;
		return acc;
	}, {});
	return infos;
}



export default {
	getInfos,
};
