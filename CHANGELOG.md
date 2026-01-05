# Changelog - Web Arcade Pedidos

## [v1.0.12-fixed-db] - 2026-01-05 (ESTABLE)

Esta es la versión "Golden" recomendada. El sistema es totalmente funcional y estable.

### Añadido

- **Entregas Parciales:** Ahora se puede registrar entregas granulares por producto (X de Y).
- **Visibilidad de Producción:** Indicadores de progreso (Pendiente / Total) en el panel de administración.
- **Blindaje de Datos:** Conversión forzada de decimales de Prisma a números seguros para JavaScript.
- **Diagnóstico en Pantalla:** Los errores de servidor ahora muestran detalles técnicos en lugar de mensajes genéricos.

### Corregido

- **Manejo de Eventos en Servidor:** Eliminados manejadores `onClick` ilegales en Server Components.
- **Sincronización de Base de Datos:** Parche manual aplicado para la columna `deliveredQuantity` faltante.
- **Desbloqueo de Build:** Reversión de comandos automáticos de migración que causaban fallos en el despliegue de Vercel.

---

## [v1.0.0] - Versión Inicial

- Gestión básica de pedidos, clientes y balance.
