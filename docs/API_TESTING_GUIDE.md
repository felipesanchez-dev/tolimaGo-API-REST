# TOLIMAGO API - Guía de Testing en Postman

## 📋 Información General

- **Base URL**: `http://localhost:3000`
- **Versión API**: `v1`
- **Puerto por defecto**: `3000`
- **Formato de respuesta**: JSON
- **Autenticación**: JWT (Bearer Token) - *Próximamente*

## 🚀 Cómo iniciar el servidor

```bash

# 1. Instalar dependencias (solo primera vez)
npm install

# 2. Iniciar servidor en desarrollo
npm run dev

# 3. Verificar que esté corriendo
# Deberías ver: "🚀 TOLIMAGO Backend started on port 3000"
```

---

## 📊 ENDPOINTS ACTUALMENTE FUNCIONALES

### ✅ 1. Health Check
**Estado**: 🟢 FUNCIONANDO

```
GET /health
```

**Descripción**: Verifica el estado del servidor y conexión a base de datos

**Headers**: Ninguno requerido

**Request Body**: Ninguno

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "TOLIMAGO Backend is healthy",
  "timestamp": "2025-09-14T16:30:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

**Test en Postman**:
- Method: `GET`
- URL: `{{base_url}}/health`
- Headers: Ninguno
- Body: Ninguno

---

### ✅ 2. API Information
**Estado**: 🟢 FUNCIONANDO

```
GET /api/v1
```

**Descripción**: Información general de la API y endpoints disponibles

**Headers**: Ninguno requerido

**Request Body**: Ninguno

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Welcome to TOLIMAGO API v1",
  "version": "1.0.0",
  "documentation": "http://localhost:3000/docs",
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "plans": "/api/v1/plans",
    "business": "/api/v1/business",
    "bookings": "/api/v1/bookings",
    "reviews": "/api/v1/reviews",
    "notifications": "/api/v1/notifications",
    "admin": "/api/v1/admin"
  }
}
```

**Test en Postman**:
- Method: `GET`
- URL: `{{base_url}}/api/v1`
- Headers: Ninguno
- Body: Ninguno

---

### ✅ 3. Error 404 Test
**Estado**: 🟢 FUNCIONANDO (Para testing de errores)

```
GET /cualquier-ruta-que-no-existe
```

**Descripción**: Prueba el manejo de rutas no encontradas

**Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "Route /cualquier-ruta-que-no-existe not found",
  "error": {
    "code": "ROUTE_NOT_FOUND"
  }
}
```

**Test en Postman**:
- Method: `GET`
- URL: `{{base_url}}/ruta-inexistente`
- Expected Status: `404`

---

## 🔄 ENDPOINTS FUNCIONALES (Listos para probar)

### ✅ Autenticación Module
**Estado**: � FUNCIONANDO

```
POST /api/v1/auth/register   ✅ FUNCIONAL
POST /api/v1/auth/login      ✅ FUNCIONAL  
POST /api/v1/auth/refresh    ✅ FUNCIONAL
POST /api/v1/auth/logout     ✅ FUNCIONAL
GET  /api/v1/auth/me         ✅ FUNCIONAL
POST /api/v1/auth/verify-token ✅ FUNCIONAL
```

### 📋 **Registro de Usuario**
**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com", 
  "password": "MyPassword123",
  "phone": "+57 300 123 4567",
  "city": "Ibagué",
  "isResident": true,
  "role": "user"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66e5c8d4f1234567890abcde",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2025-09-14T17:30:00.000Z"
    },
    "tokens": {
      "accessToken": "temp_access_66e5c8d4f1234567890abcde_1726328400000",
      "refreshToken": "temp_refresh_66e5c8d4f1234567890abcde_1726328400000", 
      "expiresIn": "15m"
    }
  }
}
```

### 📋 **Login de Usuario**
**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "MyPassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66e5c8d4f1234567890abcde",
      "name": "Juan Pérez", 
      "email": "juan@example.com",
      "role": "user",
      "isEmailVerified": false,
      "lastLoginAt": "2025-09-14T17:35:00.000Z"
    },
    "tokens": {
      "accessToken": "temp_access_66e5c8d4f1234567890abcde_1726328700000",
      "refreshToken": "temp_refresh_66e5c8d4f1234567890abcde_1726328700000",
      "expiresIn": "15m"
    }
  }
}
```

### 📋 **Perfil de Usuario**
**Endpoint**: `GET /api/v1/auth/me`
**Headers**: `Authorization: Bearer {accessToken}`

**Response (200)**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "66e5c8d4f1234567890abcde",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+57 300 123 4567",
      "city": "Ibagué",
      "isResident": true,
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2025-09-14T17:30:00.000Z",
      "lastLoginAt": "2025-09-14T17:35:00.000Z"
    }
  }
}
```

### 🔴 Usuarios Module
**Estado**: ❌ PENDIENTE

```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/users/:id/plans
GET    /api/v1/users/:id/favorites
```

### 🔴 Planes Module
**Estado**: ❌ PENDIENTE

```
GET    /api/v1/plans
POST   /api/v1/plans
GET    /api/v1/plans/:id
PUT    /api/v1/plans/:id
DELETE /api/v1/plans/:id
POST   /api/v1/plans/:id/favorite
```

### 🔴 Business Module
**Estado**: ❌ PENDIENTE

```
GET    /api/v1/business
POST   /api/v1/business
GET    /api/v1/business/:id
PUT    /api/v1/business/:id
DELETE /api/v1/business/:id
GET    /api/v1/business/:id/plans
```

### 🔴 Bookings Module
**Estado**: ❌ PENDIENTE

```
GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id
GET    /api/v1/users/:id/bookings
GET    /api/v1/plans/:id/bookings
```

### 🔴 Reviews Module
**Estado**: ❌ PENDIENTE

```
POST   /api/v1/reviews
GET    /api/v1/reviews/:planId
DELETE /api/v1/reviews/:id
```

---

## 🧪 COLECCIÓN POSTMAN SUGERIDA

### Variables de Entorno
Crear las siguientes variables en tu Environment de Postman:

```
base_url = http://localhost:3000
api_version = v1
token = (se llenará automáticamente después del login)
```

### Carpeta 1: Health & Info
1. **Health Check**
   - GET `{{base_url}}/health`

2. **API Info**
   - GET `{{base_url}}/api/v1`

3. **404 Error Test**
   - GET `{{base_url}}/nonexistent`

### Carpeta 2: Authentication (Próximamente)
1. **Register User**
   - POST `{{base_url}}/api/v1/auth/register`

2. **Login User**
   - POST `{{base_url}}/api/v1/auth/login`

3. **Get Profile**
   - GET `{{base_url}}/api/v1/auth/me`

4. **Refresh Token**
   - POST `{{base_url}}/api/v1/auth/refresh`

5. **Logout**
   - POST `{{base_url}}/api/v1/auth/logout`

---

## 🔍 TESTING CHECKLIST

### ✅ Tests Básicos (Disponibles ahora)
- [ ] Servidor inicia correctamente
- [ ] `/health` responde 200 y muestra database: "connected"
- [ ] `/api/v1` responde con información de endpoints
- [ ] Rutas inexistentes responden 404 con formato correcto
- [ ] Rate limiting funciona (hacer muchas requests seguidas)
- [ ] CORS headers están presentes

### ⏳ Tests de Autenticación (Próximamente)
- [ ] Registro de usuario nuevo
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Acceso a rutas protegidas con token
- [ ] Acceso a rutas protegidas sin token
- [ ] Refresh token functionality
- [ ] Logout functionality

---

## 🚨 TROUBLESHOOTING

### Problema: "Error: connect ECONNREFUSED 127.0.0.1:3000"
**Solución**: El servidor no está ejecutándose. Correr `npm run dev`

### Problema: "database: disconnected" en /health
**Solución**: 
1. Verificar que MongoDB esté corriendo
2. Revisar MONGODB_URI en el archivo `.env`
3. Default: `mongodb://localhost:27017/tolimago_dev`

### Problema: CORS errors en el navegador
**Solución**: Ya está configurado, pero verificar que el request tenga headers correctos

### Problema: 429 Too Many Requests
**Solución**: Rate limiting activado. Esperar o usar diferentes IPs para testing

---

## 📝 NOTAS PARA DESARROLLO

1. **Logs del servidor**: Revisar la consola para ver requests entrantes
2. **Base de datos**: Los modelos están creados pero necesitan endpoints
3. **Autenticación**: Sistema JWT listo para implementar
4. **Documentación**: Swagger se configurará en tareas posteriores

---

## 🎯 PRÓXIMOS PASOS

1. **Completar autenticación** (Tarea 5 actual)
2. **Implementar CRUD de usuarios** (Tarea 6)
3. **Implementar CRUD de planes** (Tarea 7)
4. **Configurar Swagger** (Tarea 13)

---

**Última actualización**: 14 de septiembre de 2025
**Estado del proyecto**: 4/15 tareas completadas
**Endpoints funcionales**: 2/50+ (estimado)