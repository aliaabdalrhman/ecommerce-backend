import { Router } from 'express';
import { SignUp, SignIn ,confirmEmail, sendCode, forgotPassword} from './auth.control.js';

const router = Router();
router.post('/signup', SignUp);
router.post('/signin', SignIn);
//router.post('/matchCode', matchCode);
router.get('/confirmEmail/:token', confirmEmail);
router.patch('/sendCode',sendCode);
router.patch('/forgotPassword',forgotPassword);
export default router;
