// Importar la biblioteca express para crear el servidor
const express = require('express');
const app = express(); // Crear una aplicación express
const port = 3000; // Definir el puerto en el que escuchará el servidor

// Importar bibliotecas necesarias
const mysql = require('mysql2/promise'); // mysql2/promise para usar promesas en las consultas
const cors = require('cors'); // Para permitir solicitudes de dominios diferentes
const session = require('express-session'); // Para gestionar sesiones de usuario

// Configuración de CORS para permitir solicitudes desde un dominio específico
app.use(cors({
  origin: 'http://localhost:5173', // Asegúrate de usar el puerto correcto para el frontend
  credentials: true, // Permitir el uso de cookies y encabezados de autenticación
}));

// Configuración de las sesiones del servidor
app.use(session({
  secret: 'gfdjgsdjk3434uhjabh3345ñ', // Clave secreta para firmar la sesión (debe ser segura)
  resave: false, // No guardar la sesión si no ha sido modificada
  saveUninitialized: true, // Guardar la sesión incluso si no tiene datos
  cookie: { secure: false } // En desarrollo, usar 'false'; en producción debería ser 'true' con HTTPS
}));

// Crear un pool de conexiones con la base de datos MySQL
const connection = mysql.createPool({
  host: 'localhost', // Dirección del servidor de la base de datos
  user: 'root', // Usuario de la base de datos
  database: 'zapato', // Nombre de la base de datos
});

// Función para manejar el inicio de sesión
async function login(req, res) {
  const { usuario, clave } = req.query; // Obtener los datos de usuario y clave desde la URL
  
  try {
    // Ejecutar una consulta para buscar el usuario en la base de datos
    // Usar parámetros (?) para evitar inyección de SQL
    const [filas] = await connection.execute(
      "SELECT * FROM `usuarios` WHERE `usuario` = ? AND `contrasena` = ?", 
      [usuario, clave]
    );

    // Verificar si el usuario y contraseña coinciden
    if (filas.length === 1) {
      // Si se encuentra el usuario, almacenar en la sesión
      req.session.usuario = usuario;
      res.status(200).json({ logeado: true }); // Respuesta exitosa
    } else {
      // Si no se encuentra, devolver error de credenciales
      res.status(401).json({ error: 'Usuario o contraseña incorrectas' });
    }
  } catch (error) {
    console.error('Error en la consulta de login:', error); // Mostrar error en el servidor
    res.status(500).json({ error: 'Error interno del servidor' }); // Respuesta de error en el servidor
  }
}

// Definir la ruta para el login
app.get('/login', login); // Asignar la función login a la ruta /login

// Función para validar si un usuario está logeado (sesión activa)
function validar(req, res) {
  if (req.session.usuario) {
    res.status(200).json({ logeado: true }); // Usuario está logeado
  } else {
    res.status(401).json({ error: 'Usuario no logeado' }); // No está logeado
  }
}

// Definir la ruta para validar sesión
app.get('/validar', validar);

// Ruta para cerrar sesión
app.get('/cerrar', (req, res) => {
  req.session.destroy(() => { // Destruir la sesión actual
    res.status(200).json({ logeado: false }); // Responder con estado de no logeado
  });
});

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`); // Mensaje de confirmación
});
