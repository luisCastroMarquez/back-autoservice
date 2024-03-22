// La clase Pool nos permite soportar multiconexiones y un mejor rendimiento en las consultas desde paquete pg
import pkg from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Configurar la clave secreta para JWT y la conexión a la base de datos
const secretKey = 'tu_secreto_super_seguro';

const pool = new Pool({
    host: process.env.DB_HOST, //servidor local de maquina
    user: process.env.DB_USER, // bd
    password: process.env.DB_PASSWORD, // password
    database: process.env.DB_DATABASE, // nombre Base Datos
    port: process.env.DB_PORT, // puerto BD
    allowExitOnIdle: true, // cerrar sesion de conexion despues de cada consulta
});


// Función para generar un token JWT
function generarToken(usuario) {
    const token = jwt.sign({ id: usuario.id, mail: usuario.mail }, secretKey, { expiresIn: '12h' });
    return token;
}

// Función middleware para verificar el token
function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const usuarioVerificado = jwt.verify(token.replace("Bearer ", ""), secretKey);
        req.usuario = usuarioVerificado;
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token no válido.' });
    }
}

//    ----------------------- usuarios ----------------------

// Función para obtener todos los usuarios
const verUsuario = async () => {
    const { rows, command, rowCount, fields } = await pool.query(
        "SELECT * FROM usuarios"
    );

    console.log("----------------------------------------------");
    console.log("Usuario registrados en la tabla");
    console.log("Instruccion procesada: ", command);
    console.log("Filas procesadas: ", rowCount);
    console.log("Contenido procesado: ", rows);
    console.log("Campos procesados: ", fields);
    console.log("----------------------------------------------");

    return rows;
};

// Función para insertar un usuario en la tabla
const agregarUsuarios = async ({ nombre, mail, fotoPerfil, likes, clave }) => {
    const consulta =
        "INSERT INTO usuarios (nombre, mail, fotoPerfil, likes, clave) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [nombre, mail, fotoPerfil, likes, clave];
    const result = await pool.query(consulta, values);

    console.log(
        "---------------------------------------------------------------"
    );
    console.log("Usuario agregado");
    console.log("Objeto devuelto de la consulta: ", result);
    console.log("Instrucción procesada: ", result.command);
    console.log("Filas procesadas: ", result.rowCount);
    console.log("Información ingresada: ", result.rows[0]);
    console.log(
        "----------------------------------------------------------------"
    );

    return result.rows[0];
};

// Función para actualizar un usuario
const actualizarUsuario = async ({ id, nombre, mail, fotoPerfil, likes }) => {
    const consulta =
        "UPDATE usuarios SET nombre = $2, mail = $3, fotoPerfil = $4, likes = $5 WHERE id = $1 RETURNING *";
    const values = [id, nombre, mail, fotoPerfil, likes];

    try {
        const result = await pool.query(consulta, values);
        console.log("Usuario actualizado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al actualizar usua:", error);
        throw error;
    }
};

// Función para eliminar un Usuario
const eliminarUsuario = async (id) => {
    const consulta = "DELETE FROM usuarios WHERE id = $1 RETURNING *";

    try {
        const result = await pool.query(consulta, [id]);
        console.log("Usuario eliminado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al eliminar un usuario:", error);
        throw error;
    }
};

//    ----------------------- imagenes ----------------------

const verImagenes = async () => {
    const { rows, command, rowCount, fields } = await pool.query(
        "SELECT * FROM galeria"
    );

    console.log("----------------------------------------------");
    console.log("Usuario registrados en la tabla");
    console.log("Instruccion procesada: ", command);
    console.log("Filas procesadas: ", rowCount);
    console.log("Contenido procesado: ", rows);
    console.log("Campos procesados: ", fields);
    console.log("----------------------------------------------");

    return rows;
};

// Función para insertar una imagen en la tabla galeria
const agregarImagen = async ({ userId, imagen, titulo }) => {
    const consulta =
        "INSERT INTO galeria (userId, imagen, titulo) VALUES ($1, $2, $3) RETURNING *";
    const values = [userId, imagen, titulo];

    try {
        const result = await pool.query(consulta, values);
        console.log("Imagen agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al agregar la imagen:", error);
        throw new Error("Hubo un error al agregar la imagen.");
    }
};

// Función para actualizar una imagen de la galeria
const actualizarImagen = async ({ userId, imagen, titulo }) => {
    const consulta =
        "UPDATE galeria SET imagen = $2, titulo = $3 WHERE id = $1 RETURNING *";
    const values = [userId, imagen, titulo];

    try {
        const result = await pool.query(consulta, values);
        console.log("Imagen actualizada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al actualizar la imagen:", error);
        throw error;
    }
};

// Función para eliminar un producto
const eliminarImagen = async (id) => {
    const consulta = "DELETE FROM galeria WHERE id = $1 RETURNING *";

    try {
        const result = await pool.query(consulta, [id]);
        console.log("Imagen eliminada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al eliminar una imagen:", error);
        throw error;
    }
};

//    ----------------------- productos ----------------------

// Función para obtener todas los productos
const verProducto = async (order) => {
    const orderByClause = order === 'desc' ? 'DESC' : 'ASC';

    const { rows, command, rowCount, fields } = await pool.query(
        `SELECT * FROM productos ORDER BY id ${orderByClause}`
    );

    console.log("----------------------------------------------");
    console.log("compra registrados en la tabla");
    console.log("Instruccion procesada: ", command);
    console.log("Filas procesadas: ", rowCount);
    console.log("Contenido procesado: ", rows);
    console.log("Campos procesados: ", fields);
    console.log("----------------------------------------------");

    return rows;
};

// Función para obtener un producto por su ID
const obtenerProductoPorId = async (id) => {
    try {
        const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (rows.length === 0) {
            console.log("No se encontró ningún producto con el ID:", id);
            return null;
        }
        console.log('Producto encontrado:', rows[0]);
        return rows[0];
    } catch (error) {
        console.error('Error al obtener el producto por ID:', error);
        throw error;
    }
};


// Función para insertar una nueva compra la tabla
const agregarProductos = async ({ nombre, descripcion, precio, imagen }) => {
    const consulta =
        "INSERT INTO productos (nombre, descripcion, precio, imagen) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [nombre, descripcion, precio, imagen];

    try {
        const result = await pool.query(consulta, values);
        console.log("Producto agregado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al agregar una compra:", error);
        throw error;
    }
};

// Función para actualizar un producto
const actualizarProducto = async ({ id, nombre, descripcion, precio, imagen }) => {
    const consulta =
        "UPDATE productos SET nombre = $2, descripcion = $3, precio = $4, imagen = $5 WHERE id = $1 RETURNING *";
    const values = [id, nombre, descripcion, precio, imagen];

    try {
        const result = await pool.query(consulta, values);
        console.log("Producto actualizado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al actualizar un producto:", error);
        throw error;
    }
};

// Función para eliminar un producto
const eliminarProducto = async (id) => {
    const consulta = "DELETE FROM productos WHERE id = $1 RETURNING *";

    try {
        const result = await pool.query(consulta, [id]);
        console.log("Producto eliminado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al eliminar un producto:", error);
        throw error;
    }
};

//    ----------------------- compras ----------------------

// Función para insertar una nueva compra la tabla
const agregarCompra = async ({ nombre, cantidad, total }) => {
    const consulta =
        "INSERT INTO compras (nombre, cantidad, total) VALUES ($1, $2, $3) RETURNING *";
    const values = [nombre, cantidad, total];

    try {
        const result = await pool.query(consulta, values);
        console.log("Compra agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al agregar una compra:", error);
        throw error;
    }
};

// Función para obtener todas las compras
const verCompra = async () => {
    const { rows, command, rowCount, fields } = await pool.query(
        "SELECT * FROM compras"
    );

    console.log("----------------------------------------------");
    console.log("compra registrados en la tabla");
    console.log("Instruccion procesada: ", command);
    console.log("Filas procesadas: ", rowCount);
    console.log("Contenido procesado: ", rows);
    console.log("Campos procesados: ", fields);
    console.log("----------------------------------------------");

    return rows;
};

// Función para actualizar una compra
const actualizarCompra = async ({ id, nombre, cantidad, total }) => {
    const consulta =
        "UPDATE compras SET nombre = $2, cantidad = $3, total = $4 WHERE id = $1 RETURNING *";
    const values = [id, nombre, cantidad, total];

    try {
        const result = await pool.query(consulta, values);
        console.log("Compra actualizada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al actualizar la compra:", error);
        throw error;
    }
};

// Función para eliminar una compra
const eliminarCompra = async (id) => {
    const consulta = "DELETE FROM compras WHERE id = $1 RETURNING *";

    try {
        const result = await pool.query(consulta, [id]);
        console.log("Compra eliminada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error al eliminar una compra:", error);
        throw error;
    }
};


export { pool, agregarUsuarios, verUsuario, actualizarUsuario, eliminarUsuario, agregarImagen, verImagenes, actualizarImagen, eliminarImagen, agregarCompra, verCompra, actualizarCompra, eliminarCompra, agregarProductos, verProducto, actualizarProducto, eliminarProducto, generarToken, verificarToken, obtenerProductoPorId };