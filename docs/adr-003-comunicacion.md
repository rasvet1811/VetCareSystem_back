# ADR-003: Estrategia de Comunicación

| Campo | Valor |
|---|---|
| ID | ADR-003 |
| Título | Estrategia de Comunicación entre Microservicios |
| Estado | Aprobado |

## Decisión

Se adopta **REST sobre HTTP** con contratos **OpenAPI 3.0** para toda comunicación entre servicios y clientes.

## Endpoints por Microservicio

| Servicio | Rutas principales |
|---|---|
| user-management | POST /api/v1/auth/register, POST /api/v1/auth/login, GET /api/v1/users/{id} |
| clinical-history | GET/POST /api/v1/patients, GET/POST /api/v1/patients/{id}/records, /vaccinations |
| tracking-reminders | GET/POST /api/v1/reminders, PUT/DELETE /api/v1/reminders/{id} |
| storage-service | GET /api/v1/storage/health, /stats, /backup |
| query-visualization | GET /api/v1/dashboard/{petId}, /summary, /pets |
| notification-service | POST /api/v1/notifications/send, GET /api/v1/notifications |

## Prácticas

- **Contract-First**: `openapi.yaml` se escribe antes de implementar.
- **JWT**: Autenticación en todos los endpoints protegidos.
- **RBAC**: Control de acceso por rol en cada servicio.
- **Timeouts**: Máximo 5 s en llamadas entre servicios.
- **CORS**: Configurado para el frontend.
