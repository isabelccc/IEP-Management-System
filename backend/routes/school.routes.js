import express from 'express'
import {getAllSchools} from '../controllers/school.js'

const router = express.Router();

router.get('/', getAllSchools);

export default router;