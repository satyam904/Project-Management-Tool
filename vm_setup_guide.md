# VM Setup Guide - Native App with Docker Postgres

This guide will walk you through setting up the Project Management Tool on your new VM. We will run the Frontend and Backend natively (for easy access/development) while using Docker strictly for PostgreSQL, just as you requested!

> [!TIP]
> **Before starting**, I've pushed a small update to the repository that allows Django to connect to Postgres. Make sure you fetch it on your VM with `git pull`.

---

## Step 1: Initialize PostgreSQL Database (Docker)
Ensure Docker and Docker Compose are installed on your VM. Then start your database:

```bash
cd project-management-tool
docker-compose up -d
```
*This will spin up a Postgres container running on local port `5432`.*

---

## Step 2: Setup the Backend (Django)
You'll need `python3`, `pip`, and `python3-venv` installed on your VM.

### 2a. Create Environment Variables
Navigate to the `backend` folder and create an environment file to point Django to your new Docker Postgres instance:
```bash
cd backend
echo "POSTGRES_DB=project_management" >> .env
echo "POSTGRES_USER=postgres" >> .env
echo "POSTGRES_PASSWORD=postgres" >> .env
echo "POSTGRES_HOST=localhost" >> .env
```

### 2b. Install Dependencies & Run
Setup a virtual environment, install requirements, run migrations over to the Postgres DB, and start the server.
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements/base.txt

# Create the tables in Postgres
python manage.py migrate

# Seed it with initial data (Optional but recommended)
python manage.py seed

# Start the server (Accessible publicly if you bind to 0.0.0.0)
python manage.py runserver 0.0.0.0:8000
```
> [!NOTE]  
> If you are trying to access the backend from your local browser (outside the VM), make sure port `8000` is open on your VM's firewall!

---

## Step 3: Setup the Frontend (React / Vite)
Open a *new terminal window* on your VM. You will need Node.js and `npm` installed.

### 3a. Configure API URL
You need to tell the frontend where the backend lives. Assuming your VM has a public IP (e.g., `123.45.67.89`), set the API URL:
```bash
cd frontend
echo "VITE_API_URL=http://<YOUR_VM_PUBLIC_IP>:8000" > .env.local
```
*(Replace `<YOUR_VM_PUBLIC_IP>` with your actual IP address. If it's running behind a domain, use the domain).*

### 3b. Install & Run
```bash
npm install
npm run dev -- --host 0.0.0.0
```
> [!IMPORTANT]  
> The `--host 0.0.0.0` flag tells Vite to expose the frontend to external networks, not just localhost. Make sure port `5173` (or whichever port Vite picks) is open on your VM's firewall. 

You can now visit `http://<YOUR_VM_PUBLIC_IP>:5173` in your browser!
