# alk-stack — Task Manager Alkalmazás

Egy egyszerű feladatkezelő (To-Do) webalkalmazás, amelyet az alkalmazásfejlesztési technológiák tárgy keretében készítettem.

## Technológiai stack

| Komponens  | Technológia              |
|------------|--------------------------|
| Frontend   | Angular 21 (TypeScript)  |
| Backend    | ASP.NET 10 (C#)          |
| Adatbázis  | MongoDB 8                |
| CI/CD      | GitHub Actions + ghcr.io |

## Architektúra
```
[Angular Frontend :4200]
        │
        ▼ HTTP (proxy → /api)
[ASP.NET Backend :8080]
        │
        ▼ MongoDB driver
[MongoDB :27017]
```

A frontend Angular 21-ben készült, Angular Router alapú navigációval és két fő nézettel. A backend ASP.NET 10 Web API monolit architektúrában, Repository pattern alkalmazásával. Az adatbázis MongoDB 8. Fejlesztési környezetben mindhármat a docker-compose indítja el egyszerre.

## Helyi futtatás (Docker Compose)

### Előfeltételek
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) telepítve és futó állapotban

### Indítás

1. Klónozd a repót:
```bash
   git clone https://github.com/horvathda/alk-stack.git
   cd alk-stack
```

2. Másold az environment fájlt:
```bash
   cp .env.example .env
```

3. Indítsd el a konténereket:
```bash
   docker compose up --build
```

4. Nyisd meg a böngészőben:
   - **Frontend:** http://localhost:4200
   - **Backend API:** http://localhost:8080/api/tasks
   - **OpenAPI docs (dev):** http://localhost:8080/openapi/v1.json

### Leállítás
```bash
docker compose down
```

Az adatok megmaradnak a `mongo_data` named volume-ban. Ha törölni szeretnéd:
```bash
docker compose down -v
```

## User Guide — Az alkalmazás használata

### Task lista nézet (`/tasks`)

Az alkalmazás megnyitásakor a feladatlista nézet jelenik meg. Ez az oldal megjeleníti az összes feladatot, és az alábbi funkciókat kínálja:

**Feladatok listázása**
Az oldal betöltésekor automatikusan betöltődnek a feladatok a backendből. Minden feladatnál látható a neve, leírása és az állapota (kész / folyamatban).

**Keresés / szűrés**
A keresőmezőbe gépelve szűrheted a feladatokat cím alapján. A szűrés valós időben, a backend oldalon történik.

**Szűrés állapot szerint**
A "Completed" / "Active" szűrővel csak a befejezett vagy csak a folyamatban lévő feladatokat jelenítheted meg.

**Lapozás (Pagination)**
A lista oldalanként jeleníti meg a feladatokat. Az oldal alján lévő lapozóval léphetsz az előző/következő oldalra. Alapértelmezetten 10 feladat látható oldalanként.

**Feladat törlése**
Minden feladatsor mellett megjelenik egy törlés gomb. Kattintás után a feladat azonnal törlődik az adatbázisból, és a lista frissül.

**Feladat szerkesztése**
A szerkesztés ikonra kattintva a feladatkezelő nézetre navigálsz az adott feladat adataival előtöltve.

**Új feladat létrehozása**
A navigációs sávban (navbar) lévő „New Task" gombra kattintva juthatsz el az új feladat létrehozásához.

---

### Feladatkezelő nézet (`/tasks/new` és `/tasks/:id/edit`)

Ez a nézet szolgál új feladat létrehozására és meglévő szerkesztésére.

**Új feladat létrehozása**
1. Kattints a „New Task" gombra a navbar-ban
2. Töltsd ki a **Title** mezőt (kötelező)
3. Opcionálisan adj meg **Description**-t
4. Kattints a „Save" gombra
5. Sikeres mentés után visszakerülsz a listanézetre

**Feladat szerkesztése**
1. A listanézeten kattints a szerkesztés ikonra egy feladatnál
2. Az űrlap előtöltődik az aktuális adatokkal
3. Módosítsd a **Title**, **Description** vagy a **Completed** állapotot
4. Kattints a „Save" gombra a mentéshez

**Validáció**
Ha a Title mező üres, a form nem küldhető el — hibaüzenet jelenik meg.

---

## REST API referencia

A backend base URL-je: `http://localhost:8080`

| Módszer  | Végpont              | Leírás                                  |
|----------|----------------------|-----------------------------------------|
| GET      | /api/tasks           | Feladatok lapozott lekérdezése          |
| GET      | /api/tasks/{id}      | Egy feladat lekérdezése ID alapján      |
| POST     | /api/tasks           | Új feladat létrehozása                  |
| PUT      | /api/tasks/{id}      | Meglévő feladat frissítése              |
| DELETE   | /api/tasks/{id}      | Feladat törlése                         |

### Query paraméterek (GET /api/tasks)

| Paraméter  | Típus   | Alapértelmezett | Leírás                              |
|------------|---------|-----------------|-------------------------------------|
| page       | int     | 1               | Oldalszám                           |
| pageSize   | int     | 10              | Elemek száma oldalanként            |
| q          | string  | null            | Szöveges keresés a cím alapján      |
| completed  | bool?   | null            | Szűrés befejezettség szerint        |

### Példa kérések (WebApi.http)

Részletes HTTP request minták a `src/backend/WebApi/WebApi.http` fájlban találhatók, lefedve az összes CRUD műveletet.

### Domain modell
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Feladat megnevezése",
  "description": "Opcionális leírás",
  "completed": false
}
```

## CI/CD Pipeline

A projekt GitHub Actions alapú CI pipeline-t használ (`.github/workflows/ci-cd.yml`).

**Triggerek:** push és pull request a `master` branch-re

**Lépések:**
1. Checkout
2. Docker Buildx setup
3. Bejelentkezés a GitHub Container Registry-be (ghcr.io)
4. Backend Docker image build + push → `ghcr.io/horvathda/alk-backend:latest`
5. Frontend Docker image build + push → `ghcr.io/horvathda/alk-frontend:latest`

Az image-ek elérhetők:
- `ghcr.io/horvathda/alk-backend:latest`
- `ghcr.io/horvathda/alk-frontend:latest`

## Projekt struktúra
```
alk-stack/
├── .github/workflows/
│   └── ci-cd.yml              # GitHub Actions CI pipeline
├── src/
│   ├── backend/
│   │   └── WebApi/
│   │       ├── Controllers/   # TasksController (CRUD)
│   │       ├── Data/          # MongoContext
│   │       ├── Models/        # TaskItem
│   │       ├── Repositories/  # TaskRepository
│   │       ├── Requests/      # DTO-k (Create, Update)
│   │       ├── Dockerfile
│   │       └── WebApi.http    # HTTP request minták
│   └── frontend/
│       └── web/               # Angular 21 alkalmazás
│           ├── src/app/
│           │   ├── pages/     # task-list, task-manage, navbar
│           │   ├── services/  # API kommunikáció
│           │   └── state/     # Állapotkezelés
│           └── Dockerfile
├── docker-compose.yml         # Teljes stack indítása
└── .env.example               # Environment változók mintája
```
