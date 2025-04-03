const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const biocideRoutes = require('./routes/biocide.routes');
const calendarRoutes = require('./routes/calendar.routes');



const app = express(); // 🟢 ESTA LÍNEA DEBE IR ANTES de cualquier uso de `app`


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/biocide', biocideRoutes);
app.use('/api/calendar', calendarRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
