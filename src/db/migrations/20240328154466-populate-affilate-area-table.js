'use strict';

const { default: axios } = require('axios');
const db = require('../models').default;

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const areas = [];
		const provider = 'platinumlist';
		const options = {
			url: 'https://api.platinumlist.net/v/7/cities?include=country&per_page=80&country.id=254,186,201,21,215,248',
			method: 'GET',
			headers: {
				'Api-Key': 'ddc51f83-65eb-46df-8ac4-ee1b74e2af63',
			},
		};
		const apiResponse = await axios(options);
		for (const area of apiResponse.data.data) {
			if (area && area.name) {
				areas.push({
					reference_id: area.id,
					provider,
					name: area.name,
					country: area.country?.data?.name,
				});
			}
		}
		await db.affiliate_area.bulkCreate(areas);
	},

	down: async (queryInterface, Sequelize) => {},
};
