-- Database: autoservice

-- DROP DATABASE IF EXISTS autoservice;

CREATE DATABASE autoservice
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Chile.1252'
    LC_CTYPE = 'Spanish_Chile.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Tabla para usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    mail VARCHAR(255) UNIQUE NOT NULL,
    fotoPerfil VARCHAR(255),
    likes INTEGER,
    clave VARCHAR(255) NOT NULL
);

-- Tabla para compras
CREATE TABLE IF NOT EXISTS public.compras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    cantidad INTEGER,
    total NUMERIC(10, 2),
    usuario_id INT REFERENCES usuarios(id)
);

-- Tabla para productos
CREATE TABLE IF NOT EXISTS public.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT,
    precio NUMERIC(10, 2)
);

