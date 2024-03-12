// importando modulos personalizados
import { agregarUsuarios, verUsuario, actualizarUsuario, eliminarUsuario, agregarCompra, verCompra, actualizarCompra, eliminarCompra, agregarProductos, verProducto, actualizarProducto, eliminarProducto, generarToken, verificarToken } from "./consultas.js";
import cors from "cors";
// importando express
import express from "express";
import { pool } from "./consultas.js";
import { hashPassword } from "./middlewares.js";
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';


// Configura dotenv para cargar variables de entorno desde .env
dotenv.config();

const app = express();

// middleware para parsear body enviado al servidor
app.use(bodyParser.json());

// Habilita CORS para todas las rutas
app.use(cors());

// levantando servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server en puerto: http://localhost:${PORT}`);
});

// Rutas del enrutador/API REST

//    ----------------------- login -------------------------

// Ruta para iniciar sesión
app.post("/login", async (req, res) => {
    const { mail, clave } = req.body;

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE mail = $1", [mail]);

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(clave, user.clave);

        if (!match) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        const token = generarToken(user);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

//    ----------------------- usuarios ----------------------

// GET para ver todos los usuarios
app.get("/usuarios", async (req, res) => {
    const usuario = await verUsuario();
    res.json(usuario);
});

// Ruta para el registro de usuarios
app.post("/usuarios", hashPassword, async (req, res) => {
    try {
        const { nombre, mail, fotoPerfil, likes, clave } = req.body;
        const hashedPassword = req.hashedPassword;
        // Agregar lógica para verificar si el usuario ya existe antes de registrarlo
        // Puedes hacer una consulta a la base de datos para buscar un usuario con el mismo correo

        // Si el usuario no existe, puedes proceder a registrarlo
        const nuevoUsuario = await agregarUsuarios({ nombre, mail, fotoPerfil, likes, clave: 0 });
        const result = await pool.query("UPDATE usuarios SET clave = $1 WHERE id = $2 RETURNING *", [hashedPassword, nuevoUsuario.id]);
        const user = result.rows[0];

        // Generar un token para el nuevo usuario
        const token = generarToken(user);
        res.json({ mensaje: "Usuario registrado con éxito", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "El Usuario se encuentra registrado" });
    }
});

// Ruta para actualizar un usuario
app.put("/usuarios/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, mail, fotoPerfil, likes } = req.body;

    try {
        const usuarioActualizado = await actualizarUsuario({ id, nombre, mail, fotoPerfil, likes });
        res.json(usuarioActualizado);
    } catch (error) {
        console.error("Error actualiazar un usuario :", error);
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
});

// Ruta para eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const usuarioEliminado = await eliminarUsuario(id);
        if (usuarioEliminado) {
            res.json({ mensaje: "El Usuario se elimino con éxito" });
        } else {
            res.status(404).json({ error: "usuario no encontrado" });
        }
    } catch (error) {
        console.error('Error al eliminar un usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

//    ----------------------- compras ----------------------


// Ruta para obtener todas las compras
app.get("/compras", async (req, res) => {
    try {
        const compras = await verCompra();
        res.json(compras);
    } catch (error) {
        console.error("Error al obtener las compras:", error);
        res.status(500).json({ error: "Error al obtener las compras" });
    }
});

// Ruta para agregar una nueva compra
app.post("/compras", async (req, res) => {
    const { nombre, cantidad, total } = req.body;
    await agregarCompra({ nombre, cantidad, total });
    res.send("Compra realizada con éxito");
});

// Ruta para actualizar una compra
app.put('/compras/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, total } = req.body;
    try {
        const compraActualizada = await actualizarCompra({ id, nombre, cantidad, total });
        res.json(compraActualizada);
    } catch (error) {
        console.error('Error al actualizar un producto:', error);
        res.status(500).json({ error: 'Error al actualizar un producto' });
    }
});

// Ruta para eliminar una compra
app.delete('/compras/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const compraEliminada = await eliminarCompra(id);
        if (compraEliminada) {
            res.json({ mensaje: "La Compra se elimino con éxito" });
        } else {
            res.status(404).json({ error: "Compra no encontrada" });
        }
    } catch (error) {
        console.error('Error al eliminar un producto:', error);
        res.status(500).json({ error: 'Error al eliminar una compra' });
    }
});

//    ----------------------- productos ----------------------

// Ruta para obtener todos los productos
app.get("/productos", async (req, res) => {
    try {
        const producto = await verProducto('asc');
        res.json(producto);
        console.log("Productos obtenidos correctamente:", producto);
    } catch (error) {
        console.error("Error al obtener las compras:", error);
        res.status(500).json({ error: "Error al obtener las compras" });
    }
});

// Ruta para agregar un nuevo producto
app.post("/productos", async (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    try {
        const nuevoProducto = await agregarProductos({ nombre, descripcion, precio });
        res.json(nuevoProducto);
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// Ruta para actualizar un producto
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    try {
        const productoActualizado = await actualizarProducto({ id, nombre, descripcion, precio });
        res.json(productoActualizado);
    } catch (error) {
        console.error('Error al actualizar un producto:', error);
        res.status(500).json({ error: 'Error al actualizar un producto' });
    }
});

// Ruta para eliminar un producto
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const productoEliminado = await eliminarProducto(id);
        if (productoEliminado) {
            res.json({ mensaje: "Producto eliminado con éxito" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error('Error al eliminar un producto:', error);
        res.status(500).json({ error: 'Error al eliminar un producto' });
    }
});