'use strict';

const { default: axios } = require('axios');
const db = require('../models');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		for (let i = 1; i < 5; i++) {
			const categories = [];
			const provider = 'platinumlist';
			const options = {
				url: `https://api.platinumlist.net/v/7/event-types?per_page=1000&page=${i}`,
				method: 'GET',
				headers: {
					'Api-Key': 'ddc51f83-65eb-46df-8ac4-ee1b74e2af63',
				},
			};
			const apiResponse = await axios(options);
			for (const category of apiResponse.data.data) {
				if (category && category.name) {
					categories.push({
						reference_id: [category.id],
						provider,
						title: category.name,
						status: false,
						show: false,
					});
				}
			}

			await db.affiliate.bulkCreate(categories);
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
