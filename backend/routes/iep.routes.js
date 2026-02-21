import express from 'express'
import {getByiepId,addIepRecord, updateIepById,addIepStatus, getAllIeps} from '../controllers/iep.js'

const router = express.Router();
router.get('/', getAllIeps);

router.get('/:id',getByiepId);
router.post('/', addIepRecord);
router.patch('/:id', updateIepById);
router.post('/:id/status', addIepStatus);



export default router;