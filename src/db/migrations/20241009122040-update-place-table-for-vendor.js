'use strict'

const db = require('../models').default
const { Op } = require('sequelize')
export default {
  async up(queryInterface, Sequelize) {


    const place = await queryInterface.describeTable('place')
    const toRemove = [
      'email',
      'username',
      'password',
      'name',
      'mobile',
      'trn',
      'start_date',
      'grace_period',
    ]

    if (!place.vendor_id) {
      await queryInterface.addColumn('place', 'vendor_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors',
          key: 'id'
        }
      })
    }
    const places = await db.place.findAll({
      where: {
        vendor_id: null,
        package_id: {
          [Op.ne]: 2
        }
      }
    });
    for (const place1 of places) {
      if (!place1.email) {
        continue;
      }
      const vendorExist = await db.vendors.findOne({
        where: {
          name: place1.title,
        }
      })
      console.log(place1.title)
      if (vendorExist) {
        await place1.update({
          vendor_id: vendorExist.id
        })
      } else {
        const result = await db.vendors.create({
          name: place1.title,
          email: place1.email,
          username: place1.username,
          password: place1.password,
          contact_person_name: place1.name,
          trn_number: place1.trn,
          start_date: place1.start_date,
          grace_period: place1.grace_period,
          status: place1.status,
        }).then((resultEntity) => resultEntity.get({ plain: true }))
        await place1.update({
          vendor_id: result.id
        })
      }
    }
    for (const column of toRemove) {
      if (place[column]) {
        await queryInterface.removeColumn('place', column)
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const place = await queryInterface.describeTable('place')
    const toAdd = [
      {
        name: 'email',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'username',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'password',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'name',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'mobile',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'trn',
        options: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        name: 'start_date',
        options: {
          type: Sequelize.DATE,
          allowNull: true,
        }
      },
      {
        name: 'grace_period',
        options: {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      },
    ]
    for (const column of toAdd) {
      if (!place[column.name]) {
        await queryInterface.addColumn('happening', column.name, column.options)
      }
    }

    if (place.vendor_id) {
      await queryInterface.removeColumn('place', 'vendor_id')
    }
  }
}
