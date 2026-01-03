# Easy Planner

A simple and intuitive application designed to help you organize your daily tasks and schedule effectively.

## Authors

- [Julian Dworzycki](https://github.com/MrJujek)
- [Radosław Klamka](https://github.com/Radzi0slaw-102)

## Run the application

> [!NOTE]
> You need to have [bun](https://bun.sh/) and [postgres](https://www.postgresql.org/) installed on your machine.

### Installation & configuration

1. Install dependencies for the entire project (frontend and backend) from the root directory:
    ```bash
    bun install
    ```

2. Create a database named `easyplanner` in PostgreSQL.

3. Create a `.env` file in the `backend` directory and add the following configuration:
    ```
    PORT=5000
    JWT_SECRET=secretKey

    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASS=postgres
    DB_NAME=easyplanner
    ```

### Running the application

Start both frontend and backend servers simultaneously with one command in `root` directory:
```bash
bun dev
```
If you need to run services separately, you can use the following commands:
```bash
cd backend
bun dev

cd frontend
bun dev
```