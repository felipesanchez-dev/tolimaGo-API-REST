# Guía completa de Backend – TOLIMAGO

Tecnologías base: Node.js, TypeScript, Express, MongoDB (Mongoose), arquitectura modular orientada a dominio (DDD light), con CI/CD y documentación clara.


Tareas:

1. Estructura de carpetas (arquitectura modular)
### Justificación:

Modules aislados = escalable, fácil de testear, reemplazable (inyección de dependencias).

Repositories = capa de acceso a datos (abstrae Mongo, permite migrar a otro DB).

Services = lógica de negocio (aplica reglas, validaciones).

Controllers = exponen endpoints, traducen request → service.

DTOs = definen estructura de entrada/salida clara.

Core = capa base que no depende de ningún módulo.

2. Modelos de datos (colecciones MongoDB)

Ya definimos: User, Plan, Business, Booking, Review.
Extras para crecer:

Notification (push/email).

AuditLog (acciones de usuario).

Session (tokens activos).

3. Endpoints (catálogo completo y documentado)

Cada endpoint tendrá:

Método (GET/POST/PUT/DELETE)

Ruta

Descripción

Auth (público / user / admin / business)

Body/params esperados

Respuesta estándar


🔐 Auth

POST /auth/register → crear cuenta.

Body: { name, email, password, role, isResident, city }

Respuesta: { token, user }

POST /auth/login → iniciar sesión.

Body: { email, password }

Respuesta: { token, user }

GET /auth/me → datos usuario actual.

Header: Authorization: Bearer <token>

POST /auth/logout → invalida token/refresh.

POST /auth/refresh → renueva token JWT.

👤 Users

GET /users/:id → ver perfil público.

PUT /users/:id → actualizar perfil (solo dueño/admin).

DELETE /users/:id → borrar cuenta (solo admin o dueño).

GET /users/:id/plans → planes creados por usuario.

🎯 Plans

GET /plans → lista de planes (filtros: tag, city, lat/lng, radius).

GET /plans/:id → detalle de plan.

POST /plans → crear plan (solo business/guide/admin).

PUT /plans/:id → actualizar plan.

DELETE /plans/:id → eliminar plan.

POST /plans/:id/favorite → marcar plan como favorito.

GET /users/:id/favorites → ver favoritos de usuario.

🏨 Business

POST /business → registrar empresa turística.

GET /business/:id → ver empresa.

PUT /business/:id → actualizar empresa.

DELETE /business/:id → eliminar empresa.

GET /business/:id/plans → listar planes de empresa.

📅 Bookings

POST /bookings → crear reserva { planId, guests, dateRequested }.

GET /bookings/:id → detalle de reserva.

PUT /bookings/:id → actualizar estado (confirmed/cancelled).

GET /users/:id/bookings → reservas del usuario.

GET /plans/:id/bookings → reservas de un plan.

⭐ Reviews

POST /reviews → añadir review { planId, rating, comment }.

GET /reviews/:planId → listar reseñas de plan.

DELETE /reviews/:id → borrar reseña (admin o autor).

🔔 Notifications

POST /notifications → crear notificación (admin).

GET /users/:id/notifications → lista notificaciones usuario.

📊 Admin

GET /admin/stats → métricas globales (usuarios, planes, reservas).

PUT /admin/users/:id/role → cambiar rol de usuario.

PUT /admin/business/:id/verify → verificar empresa.

4. Buenas prácticas aplicadas

DTOs claros por endpoint (contratos de entrada/salida).

Validaciones con express-validator.

Respuestas estándar:
{ "success": true, "data": {...}, "message": "Plan created" }

Errores centralizados (AppError con statusCode, message).

Logging con winston.

Documentación viva con Swagger/OpenAPI (/docs).

Tests unitarios e2e (Jest + Supertest).

Rutas versionadas (/api/v1/...).

CI/CD:

Linter (ESLint + Prettier).

Tests corren en GitHub Actions antes de merge.

Deploy automático (Render/Railway/Heroku).

Security:

Helmet + rate-limiter.

Sanitización de input.

Hash de passwords con bcrypt.

Refresh tokens rotativos.

🔹 5. Flujo de trabajo (pipeline)

Feature branch → crear rama feature/plans-crud.

Escribir DTOs → definir request/response en /dtos.

Implementar repository → service → controller → route.

Escribir tests unitarios (mínimo controller).

PR → CI ejecuta tests + linter.

Code review.

Merge → deploy automático a staging.

QA prueba en staging → luego merge a main para producción.

🔹 6. CI/CD sugerido

GitHub Actions:

Workflow test.yml: correr npm run lint && npm run test.

Workflow deploy.yml: deploy a Railway/Render tras merge a main.

Dockerfile preparado para contenerizar el backend.

.env.example documentado.

🔹 7. Documentación interna

Swagger UI (/docs) con ejemplos de requests/responses.

README modular por carpeta (/modules/plans/README.md → explica qué hace el módulo, endpoints, casos de uso).

Diagrama de secuencia para flujos críticos (ej. reserva).

Esquema de DB en Notion/Mermaid.

🔹 8. Roadmap backend por fases

Fase 1 (Core MVP):

Config inicial, conexión DB, User/Auth completo, CRUD Plan básico.

Fase 2:

Business CRUD + Bookings CRUD.

Reviews con rating.

Middleware roles.

Tests unitarios básicos.

Fase 3:

Favoritos, notificaciones, auditoría.

Stats para admin.

Documentación Swagger completa.

Deploy productivo.

Fase 4 (Escalado):

Refactor repositorio → interfaces para DI.

Integración con Redis (cache).

Soporte multi-idioma.

WebSockets para reservas en tiempo real.(Aun no se hara inora esto)