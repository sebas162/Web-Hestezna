# Web-Hestezna — README

Este repositorio contiene la web estática del proyecto Hestezna. Este README documenta el estado actual, dónde están los archivos activos, cuál CSS es el oficial y cómo realizar copias de seguridad y restauraciones seguras.

## Resumen rápido
- Sitio principal: `index.html` (raíz)
- Hoja de estilos oficial (actual): `styles.css` (raíz)
- JS principal: `script.js` (raíz)
- Tokens: `tokens_V1.js` (raíz)
- Backup consolidado: `backup_consolidado_2025-10-07/` (contiene copias de seguridad)

## Envío del formulario de contacto (Microsoft 365 + Graph)
El sitio envía el formulario vía un endpoint serverless (`/api/contact`) que usa Microsoft Graph para enviar correo como tu buzón corporativo.

### Dónde está el endpoint
- Archivo: `api/contact.js` (compatible con Vercel Serverless Functions).

### Variables de entorno requeridas
Configúralas en tu plataforma (Vercel: Project → Settings → Environment Variables):

- `MS_TENANT_ID` — ID de tu tenant (Azure AD)
- `MS_CLIENT_ID` — App Registration (Client ID)
- `MS_CLIENT_SECRET` — Secret de la App Registration
- `MS_FROM_EMAIL` — Buzón que envía (ej. `info@hestezna.com` o `no-reply@hestezna.com`)
- `CONTACT_TO_EMAIL` — (opcional) Destino; default `info@hestezna.com`
- `CONTACT_PUBLIC_KEY` — (opcional) Valor para header `x-api-key` como protección simple

### Permisos en Azure
1. Azure Portal → Entra ID (Azure AD) → App registrations → New registration.
2. Crea un secreto en Certificates & secrets.
3. API permissions → Microsoft Graph → Application permissions → agrega `Mail.Send` → Grant admin consent.
4. Asegura que el buzón `MS_FROM_EMAIL` exista y tenga licencia.

### Frontend (ya listo)
`tokens_V1.js` define:

# Web-Hestezna

Sitio estático bilingüe (ES/EN) con formulario de contacto usando Web3Forms. Este README refleja el estado final de producción tras la limpieza.

## Estructura activa
- Páginas ES: `index.html`, `casos.html`, `privacy.html`, `terms.html`
- Páginas EN: `en/index.html`, `en/cases.html`, `en/privacy.html`, `en/terms.html`
- Estilos: `styles.css`
- JS: `script.js`
- Config pública: `tokens_V1.js`
- Assets: `assets/`

## Formulario de contacto (Web3Forms)
Frontend puro, sin backend propio. `tokens_V1.js` expone las claves públicas y `script.js` realiza el `POST` a Web3Forms.

Campos ocultos en los formularios:
- `access_key`: llave pública de Web3Forms
- `subject`: asunto por defecto

Seguridad básica:
- Honeypot (`.hp-field`)
- Validación y tiempo mínimo de interacción

## Desarrollo local
Abre `index.html` en el navegador o sirve la carpeta con un server estático a elección.

## SEO/Idiomas
El switch ES/EN en el navbar usa rutas relativas y muestra banderas (`assets/icons/mx.svg` y `assets/icons/us.svg`).

## Limpieza aplicada
Se eliminaron recursos no usados (endpoint de API, vistas de preview y backups antiguos). El proyecto es 100% estático.

Fecha: 2025-11-03
# con Python 3
