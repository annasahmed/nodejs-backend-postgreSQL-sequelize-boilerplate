const express = require('express');

const router = express.Router();
router.delete('/', async (req, res) => {
	try {
		await dropAllTables();
		res.status(200).send('All tables dropped successfully.');
	} catch (error) {
		console.error('Error dropping tables:', error);
		res.status(500).send('Internal server error.');
	}
});

module.exports = router;
