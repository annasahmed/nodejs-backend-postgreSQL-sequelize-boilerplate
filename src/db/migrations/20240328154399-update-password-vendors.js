'use strict';
const { encryptData } = require('../../utils/auth');

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['password']) {
			await queryInterface.addColumn('place', 'password', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		const [results, metadata] = await queryInterface.sequelize.query(`
			SELECT id, title
			FROM place
			WHERE package_id != 2
		  `);

		for (const place of results) {
			const { id, title } = place;
			const cleanTitle = title.replace(/[\s']/g, '').toLowerCase();
			const password = cleanTitle.substring(0, 8) + id.toString();

			await queryInterface.sequelize.query(`
			  UPDATE place
			  SET password = '${password}'
			  WHERE id = ${id}
			`);
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
