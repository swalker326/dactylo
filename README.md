# templates/unstable-vite

⚠️ Remix support for Vite is unstable and not recommended for production.

📖 See the [Remix Vite docs][remix-vite-docs] for details on supported features.

## Setup

```shellscript
npx create-remix@latest --template remix-run/remix/templates/unstable-vite
```

## Run

Spin up the Vite dev server:

```shellscript
npm run dev
```

Or build your app for production and run it:

```shellscript
npm run build
npm run start
```

[remix-vite-docs]: https://remix.run/docs/en/main/future/vite

## Local DB

to start a local postgres db instance run: 

```bash 
docker run --name local-postgres -e POSTGRES_USER=local -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=dactylo-db -p 5432:5432 -d postgres
```

If the DB is fresh, you need to run the migration:

```shell
npx prisma db migrate dev
```

You can check if you instance is running with:
```shell
docker ps
```
