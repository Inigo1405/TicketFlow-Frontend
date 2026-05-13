## Auth

### `POST /auth/login`
**Envía:**
```json
{ "email": "string", "password": "string" }
```
**Espera:**
```json
{ "token": "string", "user": { "id", "name", "email", "role", "area" } }
```
> El token se guarda en `localStorage` y se inyecta como `Authorization: Bearer <token>` en todas las requests siguientes.

---

### `GET /auth/me`
**Envía:** solo el header `Authorization: Bearer <token>`  
**Espera:**
```json
{ "user": { "id", "name", "email", "role", "area" } }
```
> Se llama al cargar la app para restaurar la sesión desde localStorage.

---

## Tickets

### `GET /tickets`
**Envía:** nada  
**Espera:** array de tickets (ver estructura abajo)

### `GET /tickets/mine`
**Envía:** nada  
**Espera:** array de tickets del usuario autenticado

### `POST /tickets`
**Envía:**
```json
{ "title": "string", "description": "string", "category": "general|technical|billing|access|other", "status": "open|pending" }
```
**Espera:** el ticket creado (HTTP 201), misma estructura que un ticket del array

### `PATCH /tickets/:id`
**Envía:** campos a actualizar (parcial):
```json
{ "priority": "low|medium|high|critical", "notes": "string" }
```
**Espera:** el ticket actualizado completo

### `PATCH /tickets/:id/close`
**Envía:** nada (solo el ID en la URL)  
**Espera:** `{}` (vacío, HTTP 200)

### `PATCH /tickets/:id/resolve`
**Envía:** nada  
**Espera:** `{}` (vacío, HTTP 200)

---

## Replies (hilo de comentarios)

### `POST /tickets/:id/replies`
**Envía:**
```json
{ "text": "string" }
```
**Espera:** el reply creado (HTTP 201):
```json
{ "id": number, "author_id": number, "author_name": "string", "text": "string", "created_at": "ISO8601" }
```

---

## Notificaciones

### `GET /notifications`
**Envía:** nada  
**Espera:** array de notificaciones

### `PATCH /notifications/:id/read`
**Envía:** nada  
**Espera:** `{}`

### `PATCH /notifications/mark-all-read`
**Envía:** nada  
**Espera:** `{}`

### `DELETE /notifications/:id`
**Envía:** nada  
**Espera:** `{}`

---

## Estructura de un Ticket
```json
{
  "id": number,
  "title": "string",
  "description": "string",
  "category": "general|technical|billing|access|other",
  "priority": "low|medium|high|critical",
  "status": "open|pending|resolved|closed",
  "created_at": "ISO8601",
  "created_by": number,
  "sla_breached": boolean,
  "notes": "string (opcional)",
  "replies": [ ...array de replies ]
}
```

## Estructura de una Notificación
```json
{
  "id": number,
  "type": "string (se usa como tipo de badge)",
  "title": "string",
  "message": "string",
  "read": boolean,
  "created_at": "ISO8601"
}
```

## Estructura del User
```json
{
  "id": number,
  "name": "string",
  "email": "string",
  "role": "Admin|Agente|Cliente",
  "area": "string (opcional, para Agentes — filtra tickets por categoría)"
}
```

---

**Headers comunes en todas las requests:**
- `Authorization: Bearer <token>` (si hay sesión)
- `Content-Type: application/json`
- `X-Request-ID: req-N` (trazabilidad, puede ignorarse en backend)

**Base URL:** `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)