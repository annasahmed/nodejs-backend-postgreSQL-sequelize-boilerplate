import express from 'express';
import { logController } from '../../controllers/index.js';

const router = express.Router();

router.route('/').get(logController.getLogs);

export default router;
