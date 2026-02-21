import express from 'express'

import { getStudents, getStudentById, addStudent, editStudentById ,deleteStudentById} from '../controllers/students.js'

const router = express.Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', addStudent);
router.patch('/:id', editStudentById);
router.delete('/:id', deleteStudentById);


export default router;

