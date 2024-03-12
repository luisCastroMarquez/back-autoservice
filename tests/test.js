// test.js

import { expect } from 'chai';
import {
  agregarUsuarios,
  verUsuario,
  actualizarUsuario,
  eliminarUsuario,
  agregarCompra,
  verCompra,
  actualizarCompra,
  eliminarCompra,
  agregarProductos,
  verProducto,
  actualizarProducto,
  eliminarProducto,
} from '../consultas.js';

describe('Pruebas Unitarias', () => {
  // Pruebas para la función agregarUsuarios
  it('Debería agregar un usuario correctamente', async () => {
    const nuevoUsuario = {
      nombre: 'Hello world !',
      mail: 'Hello@gmail.com',
      fotoPerfil: 'url_de_la_imagen',
      likes: 200,
      clave: '200',
    };

    const usuarioAgregado = await agregarUsuarios(nuevoUsuario);
    expect(usuarioAgregado).to.have.property('id');
  });

  // Pruebas para la función verUsuario
  it('Debería obtener todos los usuarios', async () => {
    const usuarios = await verUsuario();
    expect(usuarios).to.be.an('array');
  });

  // Pruebas para la función actualizarUsuario
  it('Debería actualizar un usuario correctamente', async () => {
    const usuarioActualizado = await actualizarUsuario({
      id: 43, // Reemplaza con el ID correcto
      nombre: 'Pazkal Castro',
      mail: 'PazkalC@gmail.com',
      fotoPerfil: 'imagen',
      likes: 1000000000,
    });

    expect(usuarioActualizado).to.have.property('id');
  });

  // Pruebas para la función eliminarUsuario
  it('Debería eliminar un usuario correctamente', async () => {
    const usuarioEliminado = await eliminarUsuario(77); // Reemplaza con el ID correcto
    expect(usuarioEliminado).to.have.property('id');
  });

  // Seguir generando test para las demás funciones...

  // npx mocha test.js

});
