const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const CalendarController = require('../controllers/calendar.controller');

// Crear evento (todos los roles)
router.post('/create', verifyToken, CalendarController.createEvent);

// Ver eventos del usuario actual
router.get('/my-events', verifyToken, CalendarController.getMyEvents);

// Ver todos los eventos (solo admin/analista)
router.get('/all', verifyToken, requireRole('admin', 'analista'), CalendarController.getAllEvents);

router.get('/user/:id', verifyToken, CalendarController.getEventosPorUsuario);
router.get('/my', verifyToken, CalendarController.getMyEvents);
router.get('/all', verifyToken, CalendarController.getAllEvents);




module.exports = router;
