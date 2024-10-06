const express = require('express');
const app = express();
const port = 3000;

const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');


app.use(cors({
    origin: 'http://localhost:5173/',
    credentials: true,
}))
app.use(session({
    secret: 'gfdjgsdjk3434uhjabh3345ñ',
}))

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'zapato',
});

async function login(req, res) {
    const datos = req.query;
        // Usar parámetros para prevenir inyección de SQL
        const [filas] = await connection.query("SELECT * FROM `usuarios` WHERE `usuario` = '"+ datos.usuario + "' AND `contrasena` = '"+ datos.clave + "'")

        // Verificar si se encontró un usuario
        if (filas.length == 1) {
            req.session.usuario =datos.usuario
            res.status(200).json({logeado: true})
        } else {
            res.status(401).json({ error: 'usuario o contraseña incorrectas' }); // Enviar error si las credenciales son incorrectas
        }
}

app.get('/login', login);
function validar (req, res) {
    if (req.session.usuario) {
        res.status(200).json({logeado: true})
    } else {
        res.status(401).json({ error: 'usuario no logeado' })
    }
}

app.get('/validar', validar)
app.get('/cerrar', (req, res) => {
    req.session.destroy()
        res.status(200).json({logeado: false})
    })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

