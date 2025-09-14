# 🔐 GUÍA COMPLETA DE ENDPOINTS DE AUTENTICACIÓN - TOLIMAGO API

## 📋 **RESUMEN DE ENDPOINTS**

| Método | Endpoint                      | Descripción                          | Acceso  |
| ------ | ----------------------------- | ------------------------------------ | ------- |
| `POST` | `/api/v1/auth/register`       | ✅ Registrar nuevo usuario           | Público |
| `POST` | `/api/v1/auth/login`          | ✅ Iniciar sesión                    | Público |
| `POST` | `/api/v1/auth/refresh`        | ✅ Refrescar token de acceso         | Público |
| `POST` | `/api/v1/auth/logout`         | ✅ Cerrar sesión                     | Privado |
| `GET`  | `/api/v1/auth/me`             | ✅ Obtener perfil del usuario actual | Privado |
| `POST` | `/api/v1/auth/verify-token`   | ✅ Verificar si un token es válido   | Público |
| `POST` | `/api/v1/auth/reset-password` | ✅ Resetear contraseña               | Público |

---

## 🚀 **ENDPOINTS DETALLADOS**

### **1. 📝 REGISTRAR USUARIO**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/register`
**Acceso:** Público
**Descripción:** Registra un nuevo usuario en el sistema

#### **Request Body:**

```json
{
  "name": "Felipe Sanchez",
  "email": "felipe@gmail.com",
  "password": "123",
  "phone": "+57 310 2452542",
  "city": "Ibagué",
  "isResident": true,
  "role": "user"
}
```

#### **Campos:**

- `name` (requerido): Nombre completo del usuario
- `email` (requerido): Email único del usuario
- `password` (requerido): Contraseña (mínimo 3 caracteres)
- `phone` (opcional): Número de teléfono
- `city` (opcional): Ciudad de residencia
- `isResident` (opcional): Si es residente del Tolima
- `role` (opcional): Rol del usuario (user, admin, business)

#### **Respuesta Exitosa (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "68c70a0547c6adc228a8703a",
      "name": "Felipe Sanchez",
      "email": "felipe@gmail.com",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2025-09-14T18:31:33.223Z"
    },
    "tokens": {
      "accessToken": "temp_access_68c70a0547c6adc228a8703a_1757874693583",
      "refreshToken": "temp_refresh_68c70a0547c6adc228a8703a_1757874693583",
      "expiresIn": "15m"
    }
  }
}
```

---

### **2. 🔑 INICIAR SESIÓN**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/login`
**Acceso:** Público
**Descripción:** Autentica un usuario y devuelve tokens de acceso

#### **Request Body:**

```json
{
  "email": "felipe@gmail.com",
  "password": "123"
}
```

#### **Campos:**

- `email` (requerido): Email del usuario registrado
- `password` (requerido): Contraseña del usuario

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "68c70a0547c6adc228a8703a",
      "name": "Felipe Sanchez",
      "email": "felipe@gmail.com",
      "role": "user",
      "isEmailVerified": false,
      "lastLoginAt": "2025-09-14T18:35:45.123Z"
    },
    "tokens": {
      "accessToken": "temp_access_68c70a0547c6adc228a8703a_1757874945123",
      "refreshToken": "temp_refresh_68c70a0547c6adc228a8703a_1757874945123",
      "expiresIn": "15m"
    }
  }
}
```

---

### **3. 🔄 REFRESCAR TOKEN**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/refresh`
**Acceso:** Público
**Descripción:** Genera nuevos tokens usando un refresh token válido

#### **Request Body:**

```json
{
  "refreshToken": "temp_refresh_68c70a0547c6adc228a8703a_1757874945123"
}
```

#### **Campos:**

- `refreshToken` (requerido): Token de refresco obtenido del login

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "temp_access_68c70a0547c6adc228a8703a_1757875000456",
      "refreshToken": "temp_refresh_68c70a0547c6adc228a8703a_1757875000456",
      "expiresIn": "15m"
    }
  }
}
```

---

### **4. 👤 OBTENER PERFIL ACTUAL**

**Endpoint:** `GET http://localhost:3000/api/v1/auth/me`
**Acceso:** Privado (requiere autenticación)
**Descripción:** Obtiene el perfil completo del usuario autenticado

#### **Headers:**

```
Authorization: Bearer temp_access_68c70a0547c6adc228a8703a_1757875000456
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "68c70a0547c6adc228a8703a",
      "name": "Felipe Sanchez",
      "email": "felipe@gmail.com",
      "role": "user",
      "isResident": true,
      "city": "Ibagué",
      "phone": "+57 310 2452542",
      "isEmailVerified": false,
      "isActive": true,
      "lastLogin": "2025-09-14T18:35:45.123Z",
      "createdAt": "2025-09-14T18:31:33.223Z",
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

### **5. 🚪 CERRAR SESIÓN**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/logout`
**Acceso:** Privado (requiere autenticación)
**Descripción:** Cierra la sesión del usuario actual

#### **Headers:**

```
Authorization: Bearer temp_access_68c70a0547c6adc228a8703a_1757875000456
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **6. ✅ VERIFICAR TOKEN**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/verify-token`
**Acceso:** Público
**Descripción:** Verifica si un token de acceso es válido (uso interno)

#### **Request Body:**

```json
{
  "token": "temp_access_68c70a0547c6adc228a8703a_1757875000456"
}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "userId": "68c70a0547c6adc228a8703a",
    "email": "felipe@gmail.com",
    "role": "user",
    "sessionId": "temp-session"
  }
}
```

---

### **6. 🔧 RESETEAR CONTRASEÑA (TEMPORAL)**

**Endpoint:** `POST http://localhost:3000/api/v1/auth/reset-password`
**Acceso:** Público
**Descripción:** Resetea la contraseña de un usuario (solo para debugging)

#### **Request Body:**

```json
{
  "email": "felipe@gmail.com",
  "newPassword": "123456789"
}
```

#### **Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 🧪 **FLUJO COMPLETO**

### **Paso 1: Registrar Usuario**

```bash
POST http://localhost:3000/api/v1/auth/register
{
  "name": "Usuario Test",
  "email": "test@tolimago.com",
  "password": "123",
  "city": "Ibagué"
}
```

**Guarda el `accessToken` y `refreshToken`**

### **Paso 2: Obtener Perfil**

```bash
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer {accessToken}
```

### **Paso 3: Cerrar Sesión**

```bash
POST http://localhost:3000/api/v1/auth/logout
Authorization: Bearer {accessToken}
```

### **Paso 4: Iniciar Sesión**

```bash
POST http://localhost:3000/api/v1/auth/login
{
  "email": "test@tolimago.com",
  "password": "123"
}
```

### **Paso 5: Refrescar Token**

```bash
POST http://localhost:3000/api/v1/auth/refresh
{
  "refreshToken": "{refreshToken_del_login}"
}
```

### **Paso 6: Verificar Token**

```bash
POST http://localhost:3000/api/v1/auth/verify-token
{
  "token": "{accessToken}"
}
```

---

## ❌ **CÓDIGOS DE ERROR COMUNES**

### **400 - Bad Request**

```json
{
  "success": false,
  "message": "Validation failed: Email is required",
  "error": {}
}
```

### **401 - Unauthorized**

```json
{
  "success": false,
  "message": "Invalid email or password",
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

### **500 - Server Error**

```json
{
  "success": false,
  "message": "Internal server error",
  "error": {}
}
```

---

## 🔧 **CONFIGURACIÓN POSTMAN**

### **Variables de Entorno:**

- `base_url`: `http://localhost:3000`
- `access_token`: Se actualiza automáticamente
- `refresh_token`: Se actualiza automáticamente

### **Headers Globales:**

- `Content-Type`: `application/json`
- `Authorization`: `Bearer {{access_token}}` (para endpoints privados)

---

**✅ Estado:** Todos los endpoints funcionando correctamente
