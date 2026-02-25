# Detailed Instructions: 00001_initial.sql and 00002_add_meeting_link_to_ieps.sql

## Overview

- **00001_initial.sql** — Creates the full baseline schema (all tables your app needs). Run once on an empty database.
- **00002_add_meeting_link_to_ieps.sql** — Adds the `meeting_link` column to the existing `ieps` table. Run once per database that already has `ieps` but not this column.

Order matters: the migration runner runs files by name, so `00001` runs before `00002`.

---

## 1. 00001_initial.sql

### Purpose

This file defines the **initial schema** so that running migrations on an **empty** database creates all tables in the correct order (respecting foreign keys).

### When to use this content

- **New database:** Run migrations; `00001_initial.sql` creates everything.
- **Existing database that was created with initDB.js:** You have two choices:
  - **Option A (recommended):** Leave `00001_initial.sql` as-is. Make sure your migration runner **skips** it for DBs that already have the tables (e.g. by not having run this migration yet). For existing DBs you only run **new** migrations (e.g. 00002).
  - **Option B:** Empty `00001_initial.sql` (or put only a comment like `-- baseline applied via initDB`). Then use migrations only for **changes** after that (e.g. 00002). Baseline is applied by running `initDB.js` once.

### What to put in the file

Put the following SQL in **00001_initial.sql**. Tables are in dependency order so foreign keys work.

**Rules:**
- Use `CREATE TABLE IF NOT EXISTS` so re-running by mistake doesn’t fail.
- One statement per table (and indexes right after that table) is fine; some runners allow multiple statements in one file.

Copy the block below into `00001_initial.sql`:

```sql

```

### Notes on 00001

- **schools.name:** Uses `VARCHAR(255)` so longer names are allowed (initDB used 20).
- **ieps:** Does **not** include `meeting_link` here; that is added in 00002 so “add column” is a separate, trackable step.
- **CHECK (end_date >= start_date):** Relaxed to allow NULLs so existing rows don’t break.
- If your runner runs the whole file in one go, this is fine. If it runs statement-by-statement, split into one statement per `CREATE TABLE` / `CREATE INDEX` block.

---

## 2. 00002_add_meeting_link_to_ieps.sql

### Purpose

Adds the `meeting_link` column to the `ieps` table so the app can store a URL (e.g. Zoom link) for each IEP meeting.

### When it runs

- After 00001 has created `ieps` (or after an existing DB already has `ieps` from initDB).
- The migration runner runs 00002 only once per database (it records the migration name in `schema_migrations`).

### What to put in the file

Put this single statement in **00002_add_meeting_link_to_ieps.sql**:

```sql
-- Add optional meeting link (e.g. Zoom URL) to IEPs
ALTER TABLE ieps ADD COLUMN IF NOT EXISTS meeting_link TEXT;
```

### Why this is safe

- **IF NOT EXISTS** — If the column already exists (e.g. you ran it by hand or ran migrations twice), PostgreSQL does nothing and does not error.
- **TEXT** — No length limit; suitable for long URLs.
- **Nullable** — No `NOT NULL` and no `DEFAULT`, so existing rows get `NULL` and new rows can omit the field until the app sets it.

### Optional: add a comment on the column

If your team documents schema in the DB, you can add:

```sql
COMMENT ON COLUMN ieps.meeting_link IS 'Optional URL for the IEP meeting (e.g. Zoom, Meet).';
```

So the full file can be:

```sql
-- Add optional meeting link (e.g. Zoom URL) to IEPs
ALTER TABLE ieps ADD COLUMN IF NOT EXISTS meeting_link TEXT;
COMMENT ON COLUMN ieps.meeting_link IS 'Optional URL for the IEP meeting (e.g. Zoom, Meet).';
```

---

## Summary

| File | Purpose | Run when |
|------|--------|----------|
| **00001_initial.sql** | Create all baseline tables and indexes. | Once per database (empty DB or you want migrations to own baseline). |
| **00002_add_meeting_link_to_ieps.sql** | Add `meeting_link` to `ieps`. | Once per database that has `ieps` but not `meeting_link`. |

After editing the two `.sql` files, run your migration runner (e.g. `npm run migrate`) so it executes pending migrations and records their names in `schema_migrations`.
