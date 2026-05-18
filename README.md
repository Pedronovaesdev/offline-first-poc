# Offline-First Property Inspection POC

A monorepo proof-of-concept for **offline-first** property inspections on mobile, with automatic sync to a Node.js API and PostgreSQL when the device is back online.

Built for **Expo Go** on a physical device (no native development build required for the POC).

## Features

### POC 1 — Inspections (JSON sync)

- Create property inspections offline (form: name, address, area, notes)
- Persist locally with **AsyncStorage** and `statusSync`: `pendente` | `sincronizado` | `erro`
- Automatic sync when network is available (**NetInfo** + `POST /inspecoes/sync`)
- List inspections with status badges

### POC 2 — Attachments (multipart upload)

- Attach files to an existing inspection (camera, gallery, or PDF)
- Copy files to app storage with **expo-file-system** (`documentDirectory/anexos/`)
- Queue attachment metadata in AsyncStorage (`anexos_offline`)
- Upload pending files **one at a time** with progress via **XMLHttpRequest**
- Server receives files with **multer**, stores on disk, links rows in PostgreSQL
- Upload only runs after the parent inspection is already synced on the server

## Architecture

```mermaid
flowchart TB
  subgraph mobile [Mobile - Expo Go]
    Form[FormInspecaoScreen]
    List[ListaInspecoesScreen]
    Anexos[AnexosInspecaoScreen]
    AS[(AsyncStorage)]
    FS[(File System)]
    NetInfo[NetInfo]
    SyncHook[useNetworkSync]
    UploadHook[useUploadQueue]
    Form --> AS
    Anexos --> FS
    Anexos --> AS
    NetInfo --> SyncHook
    NetInfo --> UploadHook
    SyncHook --> API
    UploadHook --> API
  end

  subgraph server [Server - Express]
    API[Express API]
    Multer[multer]
    PG[(PostgreSQL)]
    Uploads[uploads/]
    API --> Multer --> Uploads
    API --> PG
  end

  AS -->|JSON sync| API
  FS -->|multipart| API
```

## Monorepo structure

```
.
├── apps/mobile/          # Expo SDK 54 + React Native
├── server/               # Express 5 + pg + multer
├── packages/shared/      # Placeholder for shared types (not wired yet)
├── docker-compose.yml    # PostgreSQL 16
└── turbo.json            # npm workspaces orchestration
```

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Mobile | Expo 54, React Native 0.81, AsyncStorage, NetInfo, expo-crypto, expo-image-picker, expo-document-picker, expo-file-system |
| API | Express 5, TypeScript, `tsx watch`, multer |
| Database | PostgreSQL 16 (Docker) |
| Tooling | npm workspaces, Turborepo |

## Prerequisites

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (for PostgreSQL)
- [Expo Go](https://expo.dev/go) on a physical phone (same Wi‑Fi as your PC)
- No Android Studio / Xcode required for this POC

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

Default connection:

- Host: `localhost:5432`
- User / password: `postgres` / `postgres`
- Database: `inspecao-db`

### 3. Configure the server

Create `server/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inspecao-db
```

Migrations run automatically on server start (`001_create_inspecoes.sql`, `002_create_anexos.sql`).

### 4. Run the API

```bash
cd server
npm run dev
```

Verify: `GET http://localhost:3000/health` → `{ "ok": true, "db": "..." }`

The server listens on `0.0.0.0` so the phone can reach it over LAN.

### 5. Configure the mobile app

Create `apps/mobile/.env` with your machine's **local IP** (not `localhost`):

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

### 6. Run the mobile app

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go.

> **Monorepo note:** `apps/mobile` uses a custom `metro.config.js` and `index.js` entry point so Metro resolves dependencies correctly from the workspace root.

## API reference

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | DB connectivity check |

### Inspections

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/inspecoes/sync` | `InspecaoSyncInput[]` | Upsert inspections by `id` |

**Response:** `{ "sucesso": string[], "erros": string[] }`

### Attachments

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/anexos/upload` | `multipart/form-data` | Upload file linked to inspection |

**Form fields:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | Image or PDF |
| `anexoId` | string | UUID (client-generated) |
| `inspecaoId` | string | Parent inspection UUID (must exist in DB) |

**Response:** `{ "ok": true, "id": "<anexoId>" }`

Uploaded files are stored under `server/uploads/` (gitignored).

## Offline-first behavior

### Inspection queue

1. User saves form → `InspecaoRecord` with `statusSync: 'pendente'` in `inspecoes_offline`
2. When online, `useNetworkSync` calls `processPendingQueue` → `POST /inspecoes/sync`
3. Success → local status `sincronizado`

### Attachment queue

1. User picks camera / gallery / PDF → file copied to `documentDirectory/anexos/{id}.ext`
2. `AnexoRecord` with `statusSync: 'pendente'` appended to `anexos_offline`
3. When online, `useUploadQueue` runs `processPendingUploadQueue`
4. Skips attachments whose parent inspection is not `sincronizado` yet
5. Uploads run **FIFO** by `createdAt`, one file at a time (progress bar)
6. Success → local status `sincronizado`

### Local storage keys

| Key | Content |
|-----|---------|
| `inspecoes_offline` | `InspecaoRecord[]` |
| `anexos_offline` | `AnexoRecord[]` |

## Mobile app structure (main files)

```
apps/mobile/
├── App.tsx                          # Navigation state + hooks
├── src/
│   ├── hooks/
│   │   ├── useNetworkSync.ts        # Inspection sync on reconnect
│   │   └── useUploadQueue.ts        # Attachment upload + progress
│   ├── screens/
│   │   ├── FormInspecaoScreen.tsx
│   │   ├── ListaInspecoesScreen.tsx
│   │   └── AnexosInspecaoScreen.tsx
│   ├── services/
│   │   ├── saveInspecao.ts
│   │   └── saveAnexoFromPicker.ts
│   ├── storage/
│   │   ├── inspecaoStorage.ts
│   │   └── anexoStorage.ts
│   └── sync/
│       ├── processPendingQueue.ts
│       ├── processPendingUploadQueue.ts
│       └── uploadAnexo.ts           # XMLHttpRequest + FormData
```

## Server structure (main files)

```
server/
├── sql/
│   ├── 001_create_inspecoes.sql
│   └── 002_create_anexos.sql
├── src/
│   ├── routes/
│   │   ├── inspecoes.ts
│   │   └── anexos.ts
│   ├── middleware/upload.ts         # multer disk storage
│   └── migrations/migrate.ts
└── uploads/                         # received files (gitignored)
```

## End-to-end test checklist

### Inspections (POC 1)

- [ ] Enable airplane mode
- [ ] Create inspection → badge **Pendente**
- [ ] Disable airplane mode → badge **Sincronizado**
- [ ] Row exists in `inspecoes` table with same `id`

### Attachments (POC 2)

- [ ] Open an inspection that is already **Sincronizado**
- [ ] Add photo/PDF offline → **Pendente**
- [ ] Go online → progress bar → **Sincronizado**
- [ ] Server log: `POST /anexos/upload` + `Anexo ... salvo`
- [ ] Row in `anexos` table + file in `server/uploads/`

## Troubleshooting

| Issue | Likely cause |
|-------|----------------|
| Mobile cannot reach API | Use PC LAN IP in `EXPO_PUBLIC_API_URL`, not `localhost` |
| Upload 404 inspection | Parent inspection not synced yet |
| `Cannot find module 'multer'` | Run `npm install` inside `server/` |
| Duplicate FlatList keys | Fixed in `updateAnexo` — reload app to dedupe storage |
| Expo Go SDK mismatch | Project uses **Expo SDK 54** |

## Roadmap (not in POC)

- [ ] Shared types in `packages/shared` (Zod / single source of truth)
- [ ] Production deploy (HTTPS API, managed Postgres, EAS build)
- [ ] Authentication and admin web panel
- [ ] Manual sync button and global network indicator
- [ ] Optional: WatermelonDB (Trilha A) — not used; AsyncStorage path (Trilha B) is active

## License

MIT — see [LICENSE](./LICENSE).
