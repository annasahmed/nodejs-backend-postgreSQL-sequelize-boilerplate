'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('appUser');

		if (tableDescription['first_name']) {
			await queryInterface.changeColumn('appUser', 'first_name', {
				type: Sequelize.STRING,
				allowNull: false,
			});
		}
		if (tableDescription['last_name']) {
			await queryInterface.changeColumn('appUser', 'last_name', {
				type: Sequelize.STRING,
				allowNull: false,
			});
		}
		if (tableDescription['image']) {
			await queryInterface.changeColumn('appUser', 'image', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (tableDescription['email']) {
			await queryInterface.changeColumn('appUser', 'email', {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			});
		}
		if (tableDescription['instagram_id']) {
			await queryInterface.changeColumn('appUser', 'instagram_id', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (tableDescription['phone_number']) {
			await queryInterface.changeColumn('appUser', 'phone_number', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (tableDescription['gender']) {
			await queryInterface.changeColumn('appUser', 'gender', {
				type: Sequelize.ENUM('male', 'female'),
				allowNull: true,
			});
		}
		if (tableDescription['date_of_birth']) {
			await queryInterface.changeColumn('appUser', 'date_of_birth', {
				type: Sequelize.DATE,
				allowNull: true,
			});
		}
		if (tableDescription['isLogged']) {
			await queryInterface.changeColumn('appUser', 'isLogged', {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			});
		}
		if (tableDescription['status']) {
			await queryInterface.changeColumn('appUser', 'status', {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
