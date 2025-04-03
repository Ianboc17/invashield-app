const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, requireRole('admin'), UserController.getAllUsers);

// Actualizar usuario por ID (solo admin)
router.put('/:id', verifyToken, requireRole('admin'), UserController.updateUser);


router.get('/', verifyToken, UserController.getAllUsers);
router.get('/seleccionables', verifyToken, UserController.getAllForAdmin); 
router.put('/:id', verifyToken, UserController.updateUser);


module.exports = router;
