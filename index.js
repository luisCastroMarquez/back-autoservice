// importando modulos personalizados
import { agregarUsuarios, verUsuario, actualizarUsuario, eliminarUsuario, agregarImagen, verImagenes, actualizarImagen, eliminarImagen, agregarCompra, verCompra, actualizarCompra, eliminarCompra, agregarProductos, verProducto, actualizarProducto, eliminarProducto, generarToken, verificarToken, obtenerProductoPorId } from "./consultas.js";
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
const PORT = process.env.PORT || 5173;

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
        res.json({
            token: token,
            usuario: user
        });
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

        // Verificar si el usuario ya existe antes de registrarlo
        const usuarioExistente = await pool.query("SELECT * FROM usuarios WHERE mail = $1", [mail]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya está registrado" });
        }

        // Validar que se proporcionen todos los campos requeridos
        if (!nombre || !mail || !clave) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
        }

        // Si el usuario no existe, procede a registrarlo
        const hashedPassword = req.hashedPassword;
        const nuevoUsuario = await agregarUsuarios({ nombre, mail, fotoPerfil, likes, clave: hashedPassword });

        // Generar un token para el nuevo usuario
        const token = generarToken(nuevoUsuario);

        // Devolver los datos del usuario recién registrado como parte de la respuesta
        res.status(201).json({
            mensaje: "Usuario registrado con éxito",
            usuario: nuevoUsuario,
            token
        });
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


//    ----------------------- galeria usuario ----------------------

// GET para ver todos los usuarios
app.get("/galeria", async (req, res) => {
    const imagenes = await verImagenes();
    res.json(imagenes);
});

// Ruta para obtener las imágenes de la galería del usuario actual
app.get('/galeria/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Obtén el userId del query params
        const query = 'SELECT * FROM galeria WHERE userid = $1';
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las imágenes de la galería:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para el registro de galeria del usuario
app.post("/galeria", async (req, res) => {
    const { userId, imagen, titulo } = req.body;

    try {
        // Verificar que se proporcionen todos los campos requeridos
        if (!userId || !imagen || !titulo) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
        }

        // Llama a la función para agregar la imagen a la galería del usuario
        const nuevaImagen = await agregarImagen({ userId, imagen, titulo });
        res.status(200).send(nuevaImagen);
    } catch (error) {
        console.error('Error al actualizar la galería del usuario:', error);
        res.status(500).json({ mensaje: "Hubo un error en el servidor", error: error.message });
    }
});

// Ruta para actualizar una imagen de la galería del usuario
app.put('/galeria/:id', async (req, res) => {
    const { userId } = req.params;
    const { imagen, titulo } = req.body;
    try {
        const imagenActualizada = await actualizarImagen({ imagen, titulo });
        res.json(imagenActualizada);
    } catch (error) {
        console.error('Error al actualizar una imagen:', error);
        res.status(500).json({ error: 'Error al actualizar una imagen' });
    }
});

// Ruta para eliminar un imagen galeria del usuario
app.delete('/galeria/:id', async (req, res) => {
    const { userId } = req.params;
    try {
        const imagenEliminada = await eliminarImagen(userId);
        if (imagenEliminada) {
            res.json({ mensaje: "Producto eliminado con éxito" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error('Error al eliminar un producto:', error);
        res.status(500).json({ error: 'Error al eliminar un producto' });
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

// Ruta para obtener todos los productos por id

app.get('/producto/:productId', async (req, res) => {
    const productId = req.params.id;

    try {
        const producto = await obtenerProductoPorId(productId);
        if (!producto) {
            // Si no se encuentra ningún producto con el ID especificado, responde con un mensaje de error
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        // Si se encuentra el producto, responde con el producto encontrado
        res.json(producto);
    } catch (error) {
        // Si ocurre algún error durante la consulta, responde con un mensaje de error interno del servidor
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Ruta para agregar un nuevo producto
app.post("/productos", async (req, res) => {
    const { nombre, descripcion, precio, imagen } = req.body;
    try {
        const nuevoProducto = await agregarProductos({ nombre, descripcion, precio, imagen });
        res.json(nuevoProducto);
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// Ruta para actualizar un producto
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen } = req.body;
    try {
        const productoActualizado = await actualizarProducto({ id, nombre, descripcion, precio, imagen });
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