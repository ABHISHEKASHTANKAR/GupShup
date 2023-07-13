import express from 'express';
import { addMessage, getAllMessages } from '../controller/MessageController.js';

const router = express.Router();

router.post('/add', addMessage);
router.post('/', getAllMessages);

export default router;