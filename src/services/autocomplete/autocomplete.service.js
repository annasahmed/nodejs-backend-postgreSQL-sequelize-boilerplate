const db = require('../../db/models/index.js').default;
const { Op } = require('sequelize')

async function searchPlace(req) {
  const title = req.query.search || '';
  //console.log('title', title)
  return await db.place.findAll({
    where: {
      title: {
        [Op.iLike]: `%${title}%`
      }
    },
    attributes: [['id', 'value'], ['title', 'label'],['id','id']],
    order: [
      ['title', 'ASC'],
      ['created_date_time', 'DESC'],
      ['modified_date_time', 'DESC'],
    ],
    limit: 20
  });
}

module.exports = {
  searchPlace
}
