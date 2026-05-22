# ADR-002: Estructura Interna del Repositorio

| Campo | Valor |
|---|---|
| ID | ADR-002 |
| Título | Estructura Interna del Repositorio |
| Estado | Aprobado |

## Decisión

Se adopta un **Monorepo** con separación explícita por microservicio bajo `/services/`.

## Estructura

```
vetcare-system/
├── services/
│   ├── user-management/
│   ├── clinical-history/
│   ├── tracking-reminders/
│   ├── storage-service/
│   ├── query-visualization/
│   └── notification-service/
├── shared/
│   └── contracts/          # Contratos OpenAPI 3.0
├── infrastructure/
│   ├── init.sql
│   └── docker-compose.yml
├── docs/                   # ADRs
└── README.md
```

## Relaciones

- **ADR-001**: Cada directorio en `/services/` corresponde a un microservicio de ADR-001.
- **ADR-003**: Los contratos OpenAPI se almacenan en `/shared/contracts/`.
