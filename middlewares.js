import bcrypt from 'bcrypt';


// Función middleware para encriptar contraseñas
async function hashPassword(req, res, next) {
    const { clave } = req.body;
    const saltRounds = 10;

    try {
        if (!clave) {
            throw new Error('No se proporcionó una contraseña');
        }
        const hashedPassword = await bcrypt.hash(clave, saltRounds);
        req.hashedPassword = hashedPassword;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor al encriptar la contraseña' });
    }
}

export { hashPassword };
