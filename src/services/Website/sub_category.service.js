const db = require('../../db/models').default;
const { checkDeletedCondition } = require('../../utils/globals');

const getCategories = async () => {
	const subCategories = await db.sub_category.findAll({
		order: [['weight', 'ASC']],
		where: {
			...checkDeletedCondition,
			is_website: true,
			status: true,
		},
		attributes: ['id', 'title', 'color', 'image', 'weight'],
	});

	return subCategories;
};

export default {
	getCategories,
};
