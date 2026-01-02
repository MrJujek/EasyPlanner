# Easy Planner

A simple and intuitive application designed to help you organize your daily tasks and schedule effectively.

## Authors

- [Julian Dworzycki](https://github.com/MrJujek)
- [Radosław Klamka](https://github.com/Radzi0slaw-102)

## Run the application

### Frontend

```bash
cd frontend
bun i
bun run build
bun run preview
```

## Backend

```bash
cd backend
touch .env
bun i
bun dev
```

In `.env` file you have to put:
```
PORT=5000
JWT_SECRET=secretKey

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=easyplanner
```

> [!NOTE]
> You need to have [bun](https://bun.sh/) installed on your machine.