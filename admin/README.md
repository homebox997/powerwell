# PowerWell Admin

This is an independent admin system for database operations. It does not modify the AU frontend display logic.

## Layers

- Data access layer: `admin.js` includes adapters for Supabase RPC, REST API, PostgREST and local mock mode.
- Interaction layer: `index.html` + `styles.css` provide a visual record browser and JSON editor.
- Permission layer: UI roles are mirrored in the browser, while real enforcement is handled by `supabase_admin_extension.sql`.
- Log layer: every UI operation is recorded locally; database writes through Supabase RPC are recorded in `admin_operation_logs`.

## Setup

1. Run `supabase_au_minimal_schema.sql`.
2. Run `supabase_admin_extension.sql`.
3. Add at least one row to `admin_users` with the operator email and role.
4. Expose the `app_api` schema in Supabase API settings.
5. Fill `admin/config.js` with the Supabase URL and anon key.
6. Open `admin/index.html`.

## Roles

- `viewer`: read records only.
- `editor`: read and create/update records.
- `admin`: read, create/update, delete and inspect audit data.

