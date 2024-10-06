const express = require('express');
const app = express();
const port = 3000;

const mysql = require('mysql2/promise');
const cors = require('cors');
app.use(cors());

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'zapato',
});

async function login(req, res) {
    const datos = req.query;

    try {
        // Usar parámetros para prevenir inyección de SQL
        const [filas] = await connection.query("SELECT * FROM `usuarios` WHERE `usuario` = ? AND `contrasena` = ?", [datos.usuario, datos.clave]);

        // Verificar si se encontró un usuario
        if (filas.length === 1) {
            res.json(filas); // Responder con los datos del usuario
        } else {
            res.status(401).json({ error: 'usuario o contraseña incorrectas' }); // Enviar error si las credenciales son incorrectas
        }
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        res.status(500).json({ error: 'Error en el servidor' }); // Manejo de errores del servidor
    }
}

app.get('/login', login);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
