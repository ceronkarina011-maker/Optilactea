# Optilactea - Configuración de Base de Datos PostgreSQL

## Requisitos Previos

Asegúrate de tener PostgreSQL instalado y ejecutándose en tu sistema.

## Configuración

1. **Actualiza las credenciales de la base de datos** en el archivo `.env`:
   ```
   # Opción 1: Usar variables individuales
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=optilactea
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_de_postgres

   # Opción 2: Usar cadena de conexión completa (para bases de datos en la nube como Neon)
   DB_CONNECTION_STRING=postgresql://usuario:contraseña@host:puerto/database?sslmode=require
   ```

2. **Configura la base de datos** ejecutando:
   ```bash
   npm run setup-db
   ```

   Este comando creará la base de datos `optilactea` y las tablas necesarias.

3. **Inicia el servidor**:
   ```bash
   npm start
   ```

## Verificación

Una vez que el servidor esté ejecutándose, podrás acceder a la aplicación en `http://localhost:3000`.

Los datos de entrada (productores, acopios, plantas, destinos, flujos, legales, parámetros) se guardarán automáticamente en la base de datos PostgreSQL cuando se realicen cambios en la aplicación.