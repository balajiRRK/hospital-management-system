# HealthApp

A simple **health management application** designed for **doctors, nurses, patients, and administrators**.  
The system includes **multi-role access**, **role-based views and permissions**, and **secure authentication**, creating an eficient, secure and HIPAA-aligned workflow environment for all users of the health application.  

---

## Features

### Secure Login & Session Management  
- Encrypted authentication with role-based access control
- JWT-based session management for added security
- Designed with HIPAA compliance principles as top priority

### Role-Specific Dashboards

#### Doctors
- View and manage patient records

#### Nurses
- Support patient care workflows
- Update patient notes with observations such as vitals

#### Patients
- Book and track appointments
- View personal medical info and update personal information (address, weight, email, etc.)

#### Admins
- Access audit logs
- Review reported information (view patient appointment notes) and application-level insights (view amount of patients and doctors)

### **Technology Stack**  
  - **Backend**: Spring Boot (Java)
  - **Frontend**: Next.js (React, TypeScript, Tailwind CSS)
  - **Database**: PostgreSQL
  - **Deployment**: AWS 
  - **Containerization**: Docker
  - **Version Control**: Git

## Repo Overview

- HealthApp-Backend - All source files for the app's backend API
- Healthapp-frontend - All source files for the app's user-facing browser frontend
- .env - App launch configuration file

## Usage

1. Clone this repository:
    ```
    git clone https://github.com/Royalross/HealthApp.git
    cd HealthApp
    ```

2. Run the app with one of the following methods:
  - Normal Usage (Full Application in Docker):
    ```
    docker compose up
    ```

  - Alternate Hybrid Usage For Development (Frontend local, backend in Docker):

    Run this in a bash terminal:
    ```
    cd healthapp-frontend
    npm install
    NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
    ```

    Run this in another terminal:
    ```
    docker compose up backend
    ```

3. Navigate to the website on your browser through this link [localhost:3000 ](http://localhost:3000/).
