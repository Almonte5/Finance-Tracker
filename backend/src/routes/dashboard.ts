import express from 'express';
import { getDashboardSummary, getSpendingTrend } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', getDashboardSummary);
router.get('/spending-trend', getSpendingTrend);

export default router