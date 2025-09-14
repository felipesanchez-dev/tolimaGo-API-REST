# 👥 GUÍA COMPLETA DE ENDPOINTS DE USUARIOS - TOLIMAGO API

## 📋 **RESUMEN GENERAL DE ENDPOINTS**

| Categoría                  | Total Endpoints  |
| -------------------------- | ---------------- |
| **CRUD Básico**            | 4 endpoints      |
| **Gestión de Contraseñas** | 1 endpoint       |
| **Preferencias**           | 1 endpoint       |
| **Avatar**                 | 1 endpoint       |
| **Favoritos**              | 3 endpoints      |
| **Estadísticas**           | 2 endpoints      |
| **TOTAL**                  | **12 endpoints** |

---

## 🔧 **CRUD BÁSICO DE USUARIOS**

### **1. 📋 LISTAR USUARIOS**

**Endpoint:** `GET http://localhost:3000/api/v1/users`
**Acceso:** Privado (requiere autenticación)
**Descripción:** Obtiene lista de usuarios con paginación y filtros

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Query Parameters (todos opcionales):**

- `page=1` - Página actual
- `limit=10` - Usuarios por página
- `search=felipe` - Buscar por nombre, email o ciudad
- `role=user` - Filtrar por rol (user, admin, business)
- `city=ibague` - Filtrar por ciudad
- `isResident=true` - Filtrar por residentes
- `isActive=true` - Filtrar por usuarios activos
- `sortBy=createdAt` - Campo para ordenar
- `sortOrder=desc` - Orden (asc/desc)

#### **Ejemplo de Uso:**

```
GET /api/v1/users?page=1&limit=5&role=user&city=ibague
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Retrieved 5 users successfully",
  "data": {
    "users": [
      {
        "id": "68c70a0547c6adc228a8703a",
        "name": "Felipe Sanchez",
        "email": "felipe@gmail.com",
        "role": "user",
        "isResident": true,
        "city": "Ibagué",
        "phone": "+57 310 2452542",
        "avatar": "https://example.com/avatar.jpg",
        "isEmailVerified": false,
        "isActive": true,
        "lastLogin": "2025-09-14T18:35:45.123Z",
        "createdAt": "2025-09-14T18:31:33.223Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 15,
      "limit": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### **2. 👤 OBTENER USUARIO ESPECÍFICO**

**Endpoint:** `GET http://localhost:3000/api/v1/users/:id`
**Acceso:** Privado (requiere autenticación)
**Descripción:** Obtiene información completa de un usuario específico

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Parámetros de Ruta:**

- `id` (requerido) - ID del usuario

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "68c70a0547c6adc228a8703a",
      "name": "Felipe Sanchez",
      "email": "felipe@gmail.com",
      "role": "user",
      "isResident": true,
      "city": "Ibagué",
      "phone": "+57 310 2452542",
      "bio": "Amante de los viajes y la naturaleza del Tolima",
      "avatar": "https://example.com/avatar.jpg",
      "dateOfBirth": "1990-04-30T00:00:00.000Z",
      "isEmailVerified": false,
      "isActive": true,
      "lastLogin": "2025-09-14T18:35:45.123Z",
      "createdAt": "2025-09-14T18:31:33.223Z",
      "updatedAt": "2025-09-14T19:15:22.456Z",
      "socialLinks": {
        "facebook": "https://facebook.com/felipe",
        "instagram": "https://instagram.com/felipe",
        "website": "https://felipedev.com"
      },
      "preferences": {
        "language": "es",
        "currency": "COP",
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        }
      }
    }
  }
}
```

---

### **3. ✏️ ACTUALIZAR USUARIO**

**Endpoint:** `PUT http://localhost:3000/api/v1/users/:id`
**Acceso:** Privado (requiere autenticación)
**Descripción:** Actualiza información de un usuario

#### **Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Request Body (todos los campos opcionales):**

```json
{
  "name": "Felipe Sanchez Actualizado",
  "email": "felipe.nuevo@gmail.com",
  "phone": "+57 310 9999999",
  "city": "Bogotá",
  "isResident": false,
  "role": "business",
  "bio": "Nueva biografía actualizada",
  "dateOfBirth": "1990-04-30",
  "avatar": "https://example.com/new-avatar.jpg",
  "facebook": "https://facebook.com/felipe.nuevo",
  "instagram": "https://instagram.com/felipe.nuevo",
  "twitter": "https://twitter.com/felipe.nuevo",
  "website": "https://nuevositio.com"
}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "68c70a0547c6adc228a8703a",
      "name": "Felipe Sanchez Actualizado",
      "email": "felipe.nuevo@gmail.com"
      // ... resto de campos actualizados
    }
  }
}
```

---

### **4. 🗑️ ELIMINAR USUARIO**

**Endpoint:** `DELETE http://localhost:3000/api/v1/users/:id`
**Acceso:** Privado (solo administradores)
**Descripción:** Elimina un usuario (soft delete)

#### **Headers:**

```
Authorization: Bearer {admin_access_token}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "68c70a0547c6adc228a8703a"
  }
}
```

---

## 🔐 **GESTIÓN DE CONTRASEÑAS**

### **5. 🔑 CAMBIAR CONTRASEÑA**

**Endpoint:** `PUT http://localhost:3000/api/v1/users/me/change-password`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Permite al usuario cambiar su contraseña

#### **Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Request Body:**

```json
{
  "currentPassword": "123",
  "newPassword": "nueva456",
  "confirmPassword": "nueva456"
}
```

#### **Campos:**

- `currentPassword` (requerido) - Contraseña actual
- `newPassword` (requerido) - Nueva contraseña (min 3 caracteres)
- `confirmPassword` (requerido) - Confirmación de nueva contraseña

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## ⚙️ **GESTIÓN DE PREFERENCIAS**

### **6. 🎛️ ACTUALIZAR PREFERENCIAS**

**Endpoint:** `PUT http://localhost:3000/api/v1/users/me/preferences`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Actualiza las preferencias del usuario

#### **Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Request Body (todos opcionales):**

```json
{
  "language": "en",
  "currency": "USD",
  "emailNotifications": false,
  "pushNotifications": true,
  "smsNotifications": false
}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "language": "en",
      "currency": "USD",
      "notifications": {
        "email": false,
        "push": true,
        "sms": false
      }
    }
  }
}
```

---

## 🖼️ **GESTIÓN DE AVATAR**

### **7. 📸 ACTUALIZAR AVATAR**

**Endpoint:** `PUT http://localhost:3000/api/v1/users/me/avatar`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Actualiza la foto de perfil del usuario

#### **Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Request Body:**

```json
{
  "avatar": "https://example.com/mi-nueva-foto.jpg"
}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "avatar": "https://example.com/mi-nueva-foto.jpg"
  }
}
```

---

## ⭐ **GESTIÓN DE FAVORITOS**

### **8. 📋 OBTENER FAVORITOS**

**Endpoint:** `GET http://localhost:3000/api/v1/users/me/favorites`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Obtiene la lista de destinos favoritos del usuario

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "id": "fav_001",
        "destinationId": "dest_123",
        "destinationType": "tourist_site",
        "notes": "Hermoso lugar para visitar en familia",
        "addedAt": "2025-09-14T18:45:30.123Z"
      },
      {
        "id": "fav_002",
        "destinationId": "dest_456",
        "destinationType": "restaurant",
        "notes": "La mejor comida típica tolimense",
        "addedAt": "2025-09-14T19:10:15.456Z"
      }
    ]
  }
}
```

---

### **9. ➕ AGREGAR A FAVORITOS**

**Endpoint:** `POST http://localhost:3000/api/v1/users/me/favorites`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Agrega un destino a la lista de favoritos

#### **Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Request Body:**

```json
{
  "destinationId": "dest_789",
  "destinationType": "hotel",
  "notes": "Excelente ubicación y servicio"
}
```

#### **Campos:**

- `destinationId` (requerido) - ID del destino a agregar
- `destinationType` (opcional) - Tipo de destino
- `notes` (opcional) - Notas personales sobre el destino

#### **Respuesta Exitosa (201):**

```json
{
  "success": true,
  "message": "Destination added to favorites",
  "data": {
    "favorite": {
      "destinationId": "dest_789",
      "destinationType": "hotel",
      "notes": "Excelente ubicación y servicio",
      "addedAt": "2025-09-14T20:15:45.789Z"
    }
  }
}
```

---

### **10. ➖ ELIMINAR DE FAVORITOS**

**Endpoint:** `DELETE http://localhost:3000/api/v1/users/me/favorites/:destinationId`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Elimina un destino de la lista de favoritos

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Parámetros de Ruta:**

- `destinationId` (requerido) - ID del destino a eliminar

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Destination removed from favorites"
}
```

---

## 📊 **ESTADÍSTICAS DE USUARIO**

### **11. 📈 OBTENER ESTADÍSTICAS PROPIAS**

**Endpoint:** `GET http://localhost:3000/api/v1/users/me/stats`
**Acceso:** Privado (usuario autenticado)
**Descripción:** Obtiene las estadísticas del usuario autenticado

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "stats": {
      "totalBookings": 15,
      "totalReviews": 8,
      "favoritesCount": 12,
      "memberSince": "2025-01-15T10:30:00.000Z",
      "lastActivity": "2025-09-14T18:35:45.123Z",
      "planningHistory": 25
    }
  }
}
```

---

### **12. 📊 OBTENER ESTADÍSTICAS DE USUARIO**

**Endpoint:** `GET http://localhost:3000/api/v1/users/:id/stats`
**Acceso:** Privado (admin o mismo usuario)
**Descripción:** Obtiene las estadísticas de un usuario específico

#### **Headers:**

```
Authorization: Bearer {access_token}
```

#### **Parámetros de Ruta:**

- `id` (requerido) - ID del usuario

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "stats": {
      "totalBookings": 25,
      "totalReviews": 12,
      "favoritesCount": 8,
      "memberSince": "2024-08-10T14:20:00.000Z",
      "lastActivity": "2025-09-14T17:45:30.456Z",
      "planningHistory": 40
    }
  }
}
```

---

## 🧪 **FLUJO DE TESTING COMPLETO**

### **Prerrequisitos:**

1. Usuario registrado y autenticado
2. Token de acceso válido
3. Servidor corriendo en `http://localhost:3000`

### **Secuencia de Testing:**

#### **Paso 1: Obtener Token**

```bash
POST /api/v1/auth/login
{
  "email": "felipe@gmail.com",
  "password": "123"
}
```

**Guardar el `accessToken`**

#### **Paso 2: Listar Usuarios**

```bash
GET /api/v1/users?page=1&limit=5
Authorization: Bearer {accessToken}
```

#### **Paso 3: Obtener Perfil Específico**

```bash
GET /api/v1/users/68c70a0547c6adc228a8703a
Authorization: Bearer {accessToken}
```

#### **Paso 4: Actualizar Perfil**

```bash
PUT /api/v1/users/68c70a0547c6adc228a8703a
Authorization: Bearer {accessToken}
{
  "name": "Felipe Actualizado",
  "bio": "Nueva biografía"
}
```

#### **Paso 5: Cambiar Contraseña**

```bash
PUT /api/v1/users/me/change-password
Authorization: Bearer {accessToken}
{
  "currentPassword": "123",
  "newPassword": "nueva456",
  "confirmPassword": "nueva456"
}
```

#### **Paso 6: Actualizar Preferencias**

```bash
PUT /api/v1/users/me/preferences
Authorization: Bearer {accessToken}
{
  "language": "en",
  "emailNotifications": false
}
```

#### **Paso 7: Actualizar Avatar**

```bash
PUT /api/v1/users/me/avatar
Authorization: Bearer {accessToken}
{
  "avatar": "https://example.com/nuevo-avatar.jpg"
}
```

#### **Paso 8: Agregar Favorito**

```bash
POST /api/v1/users/me/favorites
Authorization: Bearer {accessToken}
{
  "destinationId": "dest_123",
  "destinationType": "restaurant",
  "notes": "Excelente comida"
}
```

#### **Paso 9: Ver Favoritos**

```bash
GET /api/v1/users/me/favorites
Authorization: Bearer {accessToken}
```

#### **Paso 10: Ver Estadísticas**

```bash
GET /api/v1/users/me/stats
Authorization: Bearer {accessToken}
```

#### **Paso 11: Eliminar Favorito**

```bash
DELETE /api/v1/users/me/favorites/dest_123
Authorization: Bearer {accessToken}
```

---

## ❌ **CÓDIGOS DE ERROR COMUNES**

### **400 - Bad Request**

```json
{
  "success": false,
  "message": "Validation failed: Name must be at least 2 characters long",
  "error": {}
}
```

### **401 - Unauthorized**

```json
{
  "success": false,
  "message": "Access token is required",
  "error": {}
}
```

### **403 - Forbidden**

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": {}
}
```

### **404 - Not Found**

```json
{
  "success": false,
  "message": "User not found",
  "error": {}
}
```

### **409 - Conflict**

```json
{
  "success": false,
  "message": "Email already exists",
  "error": {}
}
```

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **Headers Requeridos:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### **Permisos por Endpoint:**

- **Públicos:** Ninguno
- **Usuario Autenticado:** Endpoints `/me/*`
- **Mismo Usuario o Admin:** Endpoints `/:id` (lectura)
- **Solo Admin:** DELETE endpoints

---

## 📝 **NOTAS TÉCNICAS**

1. **Soft Delete:** Los usuarios eliminados mantienen `isActive: false`
2. **Paginación:** Máximo 50 usuarios por página
3. **Filtros:** Búsqueda insensible a mayúsculas
4. **Favoritos:** Sin límite de destinos favoritos
5. **Estadísticas:** Datos en tiempo real (mock por ahora)

---

## 🛠️ **CONFIGURACIÓN POSTMAN**

### **Variables de Entorno:**

```
base_url = http://localhost:3000
access_token = {token_del_login}
user_id = {id_del_usuario}
```

### **Headers Globales:**

```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

---

**✅ Estado:** Módulo de usuarios 100% funcional
**📅 Fecha:** 14 de septiembre de 2025  
**🔧 Versión:** 1.0.0
**📊 Total Endpoints:** 12 endpoints implementados
