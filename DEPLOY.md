# Deploy to Vercel + Neon

## 1. Create a Postgres database (Neon — free)

1. Go to https://neon.tech and sign up.
2. Create a new project. Pick the region closest to your Vercel region.
3. Copy the **pooled** connection string (looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).

## 2. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial pilates reservation app"
gh repo create lumen-pilates --public --source=. --push
```

## 3. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. Add environment variables:

   | Key               | Value                                                  |
   | ----------------- | ------------------------------------------------------ |
   | `DATABASE_URL`    | (pooled Neon connection string)                        |
   | `NEXTAUTH_SECRET` | run `openssl rand -base64 32` and paste the output     |
   | `NEXTAUTH_URL`    | `https://your-project.vercel.app` (set after deploy)   |

3. Click **Deploy**. The build runs `prisma migrate deploy` automatically — your tables get created on first deploy.

## 4. Seed the production database (one time)

From your local machine, point at the production DB and run the seed:

```bash
DATABASE_URL="<your-neon-url>" npx tsx prisma/seed.ts
```

That creates:
- `admin@studio.com` / `admin123` (ADMIN)
- `client@studio.com` / `client123` (10 credits)
- 5 sample classes

## 5. Update NEXTAUTH_URL

After the first deploy, copy your Vercel URL and update `NEXTAUTH_URL` in the project settings → Redeploy.

---

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URL (can use a free Neon dev branch)
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```
