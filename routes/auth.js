import { Router } from 'express';
import { body } from 'express-validator';

import * as authController from '../controllers/auth.js';
import User from '../models/user.js';

const router = Router();

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email is not valid.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists!');
                    }
                });
            })
            .normalizeEmail(),
        body('name', 'Name is required.').notEmpty().trim(),
        body('password', 'Password must have aleast 6 characters.')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirm Password does not match!');
            }
            return true;
        }),
        body('birthday', 'Date is not valid.').isDate(),
    ],
    authController.signup
);

router.post('/login', authController.login);

router.post(
    'reset-password',
    [
        body("email")
            .isEmail()
            .withMessage("Email is not valid.")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((userDoc) => {
                if (!userDoc) {
                    return Promise.reject("Email is not existing.");
                }
                });
            })
            .normalizeEmail(),
    ],
);

router.post(
    'reset-password/:token',
);

export default router;