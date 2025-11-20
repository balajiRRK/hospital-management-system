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

## Usage

1. Clone this repository:
    ```
    git clone https://github.com/Royalross/HealthApp.git
    cd HealthApp
    ```

2. Either you can run both the frontend + the backend in Docker:
   ```
   docker compose up
   ```
   
   Or you can just run the backend in Docker:

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
