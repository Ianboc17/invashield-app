const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const transporter = require('../config/mailer');
const crypto = require('crypto');
const UserModel = require('../models/user.model');

const AuthController = {
  async register(req, res) {
    const { nombre, email, password } = req.body;

    try {
      console.log('[DEBUG] Entrando a register', req.body);

      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const result = await pool.query(
        'INSERT INTO users (nombre, email, password, rol, verificado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [nombre, email, hashedPassword, 'usuario', false]
      );

      const userId = result.rows[0].id;
      console.log('[DEBUG] Usuario creado con ID:', userId);

      // Confirmar que el nombre se guardó correctamente
      const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      console.log('[DEBUG] Datos del usuario en BD:', userCheck.rows[0]);

      // Token de verificación
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO verificacion_tokens (user_id, token) VALUES ($1, $2)',
        [userId, token]
      );
      console.log('[DEBUG] Token de verificación generado:', token);

      // Verifica SMTP (debug)
      await transporter.verify()
        .then(() => console.log('[DEBUG] SMTP OK'))
        .catch((err) => console.error('[ERROR] SMTP fallo:', err));

      const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;

      console.log('[DEBUG] Preparando envío de correo a', email);
      console.log('[DEBUG] URL de verificación:', url);

      await transporter.sendMail({
        from: `"InvaShield" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta',
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
              <h2 style="color: #0c6efd;">Bienvenido a InvaShield</h2>
              <p style="font-size: 16px; color: #333;">Hola <strong>${nombre}</strong>,</p>
              <p style="font-size: 15px; color: #555;">Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente botón:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #0c6efd; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Verificar cuenta
                </a>
              </div>
              <p style="font-size: 14px; color: #999;">Si no te registraste en nuestra aplicación, puedes ignorar este mensaje.</p>
              <p style="font-size: 13px; color: #bbb;">InvaShield · Proyecto contra EEIs · Agricultura de precisión 4.0</p>
            </div>
          </div>
        `
      });
      

      res.status(201).json({ message: 'Registro exitoso. Verifica tu correo para activar la cuenta.' });
    } catch (error) {
      console.error('[ERROR] Fallo en register:', error);
      res.status(500).json({ message: 'Error al registrar usuario', error });
    }
  },

  async verifyEmail(req, res) {
    const { token } = req.params;

    try {
      console.log('[DEBUG] Verificando token:', token);

      const tokenResult = await pool.query(
        'SELECT user_id FROM verificacion_tokens WHERE token = $1',
        [token]
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      const userId = tokenResult.rows[0].user_id;

      await pool.query('UPDATE users SET verificado = true WHERE id = $1', [userId]);
      await pool.query('DELETE FROM verificacion_tokens WHERE user_id = $1', [userId]);

      console.log('[DEBUG] Cuenta verificada con éxito para usuario ID:', userId);

      res.json({ message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      console.error('[ERROR] Fallo en verifyEmail:', error);
      res.status(500).json({ message: 'Error al verificar cuenta', error });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await UserModel.getUserByEmail(email);
      console.log('[DEBUG] Usuario encontrado para login:', user);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!user.verificado) {
        console.log('[DEBUG] Usuario no verificado. Acceso denegado.');
        return res.status(403).json({ message: 'Debes verificar tu cuenta antes de iniciar sesión' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
if (!passwordMatch) {
  console.log('[DEBUG] Contraseña incorrecta');
  return res.status(401).json({ message: 'Contraseña incorrecta' });
}


      const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET);
      res.json({ message: 'Login exitoso', token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
    } catch (error) {
      console.error('[ERROR] Fallo en login:', error);
      res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
  }
};

module.exports = AuthController;
