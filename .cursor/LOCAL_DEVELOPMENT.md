# Lokális futtatás – Mini Food Ordering System

Ez a leírás a backend (NestJS + Prisma + PostgreSQL) és a frontend (Next.js) lokális, fejlesztői futtatását írja le.

| Szolgáltatás | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |

**Demo felhasználó** (a seed hozza létre): `demo@example.com` / `Demo1234!`

---

## 1. Előfeltételek

- **Node.js 22.12+** (vagy 20.19+ / 24+, a Prisma 7 miatt) és **npm**
- **PostgreSQL** adatbázis – a 2. pontban leírt három lehetőség közül bármelyik

A parancsok Git Bash-ben / bash-ben értendők. PowerShell-ben a `cp` helyett `Copy-Item` használható.

---

## 2. Adatbázis indítása (válassz egyet)

### A) Docker (ajánlott, ha van Docker)

A repó gyökeréből csak az adatbázist indítsd el:

```bash
docker compose up -d db
```

Ekkor a `backend/.env.example`-ben lévő alapértelmezett `DATABASE_URL` változtatás nélkül működik:

```
postgresql://postgres:postgres@localhost:5432/mini_food?schema=public
```

### B) Docker nélkül: Prisma helyi Postgres (`prisma dev`)

A `backend` mappában (az `npm install` után, lásd 3. pont):

```bash
npx prisma dev --name mini-food --detach
```

A parancs kiír egy **TCP** kapcsolati stringet, például:

```
postgres://postgres:postgres@localhost:51214/template1?sslmode=disable
```

Ezt írd be a `backend/.env` `DATABASE_URL` értékének. Az aktuális portokat később így kérdezheted le: `npx prisma dev ls`. Leállítás: `npx prisma dev stop mini-food`.

### C) Saját, telepített PostgreSQL

Hozz létre egy adatbázist (pl. `mini_food`), és állítsd be hozzá a `DATABASE_URL`-t a `backend/.env`-ben.

---

## 3. Backend

```bash
cd backend
npm install                 # a postinstall automatikusan lefuttatja a `prisma generate`-et
cp .env.example .env        # majd szükség esetén írd át a DATABASE_URL-t és a JWT_SECRET-et
```

A `.env` legfontosabb értékei:

| Változó | Leírás |
|---|---|
| `DATABASE_URL` | A 2. pontban kapott kapcsolati string |
| `JWT_SECRET` | **Legalább 32 karakter**, különben az app nem indul el |
| `JWT_EXPIRES_IN` | Token élettartam, pl. `1h` |
| `CORS_ORIGINS` | A frontend címe: `http://localhost:3000` |

Véletlen titkos kulcsot így generálhatsz:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Migrációk futtatása és demo adatok betöltése:

```bash
npm run db:deploy           # SQL migrációk alkalmazása (prisma migrate deploy)
npm run db:seed             # 4 étterem, menük, demo felhasználó – többször is futtatható
```

Indítás fejlesztői módban (újraindul fájlmódosításkor):

```bash
npm run start:dev
```

Ellenőrzés: nyisd meg a http://localhost:3001/api/docs oldalt.

### Hasznos backend parancsok

| Parancs | Mit csinál |
|---|---|
| `npm test` | Jest unit tesztek |
| `npm run lint` | ESLint |
| `npm run build` + `npm run start:prod` | Production build és futtatás |
| `npm run db:migrate` | Új migráció készítése a séma módosítása után (fejlesztéshez) |
| `npm run db:reset` | Adatbázis törlése, migrációk és seed újrafuttatása (**minden adat elvész**) |
| `npx prisma studio` | Adatbázis böngészése grafikus felületen |

---

## 4. Frontend

Új terminálban, a repó gyökeréből:

```bash
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Nyisd meg: http://localhost:3000 → átirányít a `/login` oldalra → lépj be a demo felhasználóval.

> A `NEXT_PUBLIC_API_URL` build időben kerül a kliens kódba. Ha megváltoztatod, indítsd újra a `npm run dev`-et (production esetén buildeld újra).

### Hasznos frontend parancsok

| Parancs | Mit csinál |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Route típusok generálása + TypeScript ellenőrzés |
| `npm run build` + `npm run start` | Production build és futtatás |

---

## 5. Gyors ellenőrzés (end-to-end)

1. http://localhost:3000 → bejelentkezés: `demo@example.com` / `Demo1234!`
2. `/restaurants` → válassz egy éttermet
3. Tegyél tételeket a kosárba → **Place Order**
4. Átirányít a `/orders/[id]` oldalra, ahol látszik a rendelés és a `PENDING` státusz

---

## 6. Backend futtatása teljesen Dockerben

A repó gyökeréből (adatbázis + migráció/seed + API egyben):

```bash
docker compose up --build
```

Ilyenkor a frontendet továbbra is a 4. pont szerint, lokálisan indítsd. A compose a `JWT_SECRET`-hez egy csak fejlesztésre szánt alapértéket használ; felülírható a gyökérben egy `.env` fájllal vagy környezeti változóval.

---

## 7. Hibaelhárítás

| Tünet | Megoldás |
|---|---|
| `Config validation error: "JWT_SECRET" length must be at least 32...` | Hosszabb `JWT_SECRET` a `backend/.env`-ben |
| `Can't reach database server` | Fut az adatbázis? Egyezik a `DATABASE_URL` host/port? (`prisma dev` esetén `npx prisma dev ls`) |
| CORS hiba a böngésző konzolján | A `CORS_ORIGINS` tartalmazza a frontend pontos címét (`http://localhost:3000`) |
| A frontend „Cannot reach the server” hibát ír | Fut a backend a 3001-es porton? Helyes a `NEXT_PUBLIC_API_URL`? |
| Foglalt port (3000 / 3001 / 5432) | Állítsd le a másik folyamatot, vagy módosítsd a `PORT`-ot (backend) / `npm run dev -- -p 3002` (frontend – ekkor a `CORS_ORIGINS`-t is frissítsd) |
| Folyamatosan a login oldalra dob | Lejárt a token (`JWT_EXPIRES_IN`) – lépj be újra |
| `Cannot find module '../generated/prisma/client'` | Futtasd a backendben: `npm run prisma:generate` |
