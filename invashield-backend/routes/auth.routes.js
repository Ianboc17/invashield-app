const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// ✅ Esta línea es OBLIGATORIA
router.post('/login', AuthController.login);

router.post('/register', AuthController.register);
router.get('/verify/:token', AuthController.verifyEmail);

module.exports = router;
