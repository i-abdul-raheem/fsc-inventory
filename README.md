# IMS — inventory & sales (KSA)

Next.js app for customer orders, stock, procurement, catalogue, trading partners (customers/sellers), RBAC, and SAR-based reports. Data layer is **Prisma ORM** on **MongoDB**.

## Prerequisites

- Node 20+
- A **MongoDB** deployment reachable via `DATABASE_URL`

Prisma uses MongoDB **transactions** for nested writes. That requires a **replica set** (MongoDB Atlas provides this automatically). For local development you can use Docker (see `docker-compose.yml` and the comments inside it).

## Setup

1. Copy environment template and fill secrets:

   ```bash
   cp .env.example .env
   ```

2. Point `DATABASE_URL` at your database, for example:

   - **Atlas:** `mongodb+srv://USER:PASS@cluster.mongodb.net/ims?retryWrites=true&w=majority`
   - **Local (after `docker compose` + `rs.initiate`):**  
     `mongodb://127.0.0.1:27017/ims?replicaSet=rs0&directConnection=true`

3. Install and push the schema, then seed:

   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:push` | Apply `schema.prisma` to MongoDB (typical for dev / MongoDB) |
| `npm run db:seed` | Regenerate client and run `prisma/seed.ts` |
| `npm run db:reset` | `db push --force-reset` then seed (wipes data) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:grant-operators-all` | Grant all permission codes to every operator user |

## Notes

- **SQLite** and the old `prisma/migrations` SQL history were removed in favour of MongoDB + `db push`.
- Do not commit `.env`; use `.env.example` as a template.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma + MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb)
