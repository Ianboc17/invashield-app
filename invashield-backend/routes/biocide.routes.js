const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const BiocideController = require('../controllers/biocide.controller');

router.post('/calculate', verifyToken, BiocideController.calculate);
router.get('/my-records', verifyToken, BiocideController.getByUser);
router.get('/user/:id', verifyToken, requireRole('admin', 'analista'), BiocideController.getByUserId); // 👈 esta es la que fallaba

module.exports = router;
