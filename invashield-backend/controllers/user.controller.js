const pool = require('../config/db');

const UserController = {
  // Obtener todos los usuarios (admin)
  async getAllUsers(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, nombre, email, rol, precio_producto FROM users ORDER BY id'
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
  },

  // Obtener solo usuarios normales (para analistas/administradores)
  async getAllForAdmin(req, res) {
    const { rol } = req.user;

    if (rol !== 'administrador' && rol !== 'analista') {
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }

    try {
      const result = await pool.query(
        'SELECT id, nombre, email, rol FROM users WHERE rol = $1 ORDER BY nombre',
        ['usuario']
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios filtrados', error });
    }
  },

  // Actualizar usuario por ID (para administrador)
  async updateUser(req, res) {
    const { id } = req.params;
    const { nombre, email, rol, precio_producto } = req.body;

    try {
      const result = await pool.query(
        `UPDATE users 
         SET nombre = $1, rol = $2, precio_producto = $3 
         WHERE id = $4 
         RETURNING id, nombre, email, rol, precio_producto`,
        [nombre, rol, precio_producto, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario actualizado', user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar usuario', error });
    }
  }
};

module.exports = UserController;
