# ADR-001: Selección de Estilo Arquitectónico

| Campo | Valor |
|---|---|
| ID | ADR-001 |
| Título | Selección de Estilo Arquitectónico |
| Estado | Aprobado |
| Fecha | 2026 |
| Autoras | Manuela Escobar Hernández · Sara Corrales Jaramillo |

## Decisión

Se adopta el estilo arquitectónico de **Microservicios** para VetCare System.

## Microservicios

| Servicio | Responsabilidad |
|---|---|
| user-management | Autenticación JWT, autorización RBAC, gestión de usuarios |
| clinical-history | Historial clínico: consultas, diagnósticos, tratamientos, vacunas |
| tracking-reminders | Alertas preventivas: vacunas pendientes, controles periódicos |
| storage-service | Base de datos centralizada con respaldo y recuperación |
| query-visualization | Consultas agregadas y dashboard de visualización |
| notification-service | Alertas multicanal: email, push |

## Alternativas Descartadas

| Alternativa | Razón |
|---|---|
| Monolítica | Sin escalabilidad independiente; fallo en cascada |
| N-Tier | Escalado granular no resuelto |
| SOA | ESB centralizado → punto único de fallo |
| Serverless | Cold start viola SLA < 2 s |
