'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Step 1: Retrieve all place IDs from the places table
		const places = await queryInterface.sequelize.query(
			'SELECT id FROM place',
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			},
		);

		// Step 2: Check each place ID against the timing table and insert if it doesn't exist
		for (const place of places) {
			const placeId = place.id;

			// Check if the place_id exists in the timing table
			const timing = await queryInterface.sequelize.query(
				'SELECT place_id FROM timing WHERE place_id = ?',
				{
					replacements: [placeId],
					type: queryInterface.sequelize.QueryTypes.SELECT,
				},
			);
			// If the place_id does not exist, insert it
			if (timing.length === 0) {
				await queryInterface.bulkInsert('timing', [
					{
						place_id: placeId,
						day: 'daily',
						// opening: '00:00:00',
						// closing: '23:59:00',
					},
				]);
			}
		}
	},

	// down: async (queryInterface, Sequelize) => {
	// 	// Revert the changes made in the up function if necessary
	// 	// Example: Delete the rows added in the up function
	// 	await queryInterface.bulkDelete('timing', {
	// 		// Assuming you want to delete rows where createdAt is during this migration
	// 		createdAt: {
	// 			[Sequelize.Op.gt]: new Date('2024-01-01'), // Set this to the approximate migration time
	// 		},
	// 	});
	// }
};
