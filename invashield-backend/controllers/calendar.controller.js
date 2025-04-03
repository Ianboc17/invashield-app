const pool = require('../config/db');

const CalendarController = {
  // POST /api/calendar/create
  async createEvent(req, res) {
    const authUserId = req.user.id;
    const rol = req.user.rol;
    const { tipo_evento, fecha, ubicacion, descripcion, userId } = req.body;

    if (!tipo_evento || !fecha) {
      return res.status(400).json({ message: 'Tipo de evento y fecha son obligatorios' });
    }

    // Determinar a quién pertenece el evento
    const targetUserId = (rol === 'administrador' || rol === 'analista') && userId ? userId : authUserId;

    try {
      const result = await pool.query(
        `INSERT INTO calendar_events (user_id, tipo_evento, fecha, ubicacion, descripcion)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [targetUserId, tipo_evento, fecha, ubicacion, descripcion]
      );

      res.status(201).json({ message: 'Evento creado', evento: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el evento', error });
    }
  },

  // GET /api/calendar/my-events
  async getMyEvents(req, res) {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        'SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY fecha ASC',
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener eventos', error });
    }
  },

  // GET /api/calendar/all (solo admin/analista)
  async getAllEvents(req, res) {
    const rol = req.user.rol;

    if (rol !== 'administrador' && rol !== 'analista') {
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }

    try {
      const result = await pool.query('SELECT * FROM calendar_events ORDER BY fecha ASC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener todos los eventos', error });
    }
  },

  // ✅ GET /api/calendar/user/:id
  async getEventosPorUsuario(req, res) {
    const rol = req.user.rol;
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }
  
    if (rol !== 'administrador' && rol !== 'analista') {
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }
  
    try {
      const result = await pool.query(
        'SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY fecha ASC',
        [id]
      );
  
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener eventos del usuario', error });
    }
  }
  
};

module.exports = CalendarController;
