const pool = require('../config/db');

const BiocideController = {
  // POST /api/biocide/calculate
  async calculate(req, res) {
    const userId = req.user.id;
    const {
      dosis,
      caudal,
      tiempo_dosificacion,
      dias_dosificacion,
      dosificaciones_dia,
      producto_consumido,
      guardar
    } = req.body;

    if (
      !dosis || !caudal || !tiempo_dosificacion ||
      !dias_dosificacion || !dosificaciones_dia || !producto_consumido 
    ) {
      return res.status(400).json({ message: 'Faltan datos para realizar el cálculo' });
    }

    try {
      const volumen_agua_m3 = (caudal * tiempo_dosificacion) / 1000;
      const cantidad_producto_l = (dosis * caudal * tiempo_dosificacion) / 1000000;

      const precioResult = await pool.query(
        'SELECT precio_producto FROM users WHERE id = $1',
        [userId]
      );
      const precio_producto = precioResult.rows[0]?.precio_producto || 0;

      const producto_mensual_l = cantidad_producto_l * dias_dosificacion * dosificaciones_dia * precio_producto;
      const ppm_producto_medio = (producto_consumido * 1000) / volumen_agua_m3;

      if (guardar) {
        await pool.query(
          `INSERT INTO biocide_records 
          (user_id, dosis, caudal, tiempo_dosificacion, dias_dosificacion, dosificaciones_dia,
           producto_consumido, volumen_agua_m3, cantidad_producto_l, producto_mensual_l, ppm_producto_medio)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            userId,
            dosis,
            caudal,
            tiempo_dosificacion,
            dias_dosificacion,
            dosificaciones_dia,
            producto_consumido,
            volumen_agua_m3,
            cantidad_producto_l,
            producto_mensual_l,
            ppm_producto_medio
          ]
        );
      }

      res.json({
        volumen_agua_m3,
        cantidad_producto_l,
        producto_mensual_l,
        ppm_producto_medio,
        guardado: guardar ? true : false
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el cálculo de biocida', error });
    }
  },

  // GET /api/biocide/my-records
  async getByUser(req, res) {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        'SELECT * FROM biocide_records WHERE user_id = $1 ORDER BY fecha DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener registros del usuario' });
    }
  },

  // GET /api/biocide/user/:id
  async getByUserId(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'SELECT * FROM biocide_records WHERE user_id = $1 ORDER BY fecha DESC',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No hay registros para este usuario' });
      }

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener registros del usuario' });
    }
  }
};

module.exports = BiocideController;
