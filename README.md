# Hospital Management System

A **health management application** designed for **doctors, nurses, patients, and administrators**.  
The system includes **multi-role access**, **role-based views and permissions**, and **secure authentication**, creating an eficient, secure and HIPAA-aligned workflow environment for all users of the health application.  

---

## Features

Home page

<img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/35cd236d-c4c3-49b0-b4a1-8ca0219843f6" />

Sign in page

<img width="1920" height="965" alt="image" src="https://github.com/user-attachments/assets/e79fee75-9543-49bc-962d-a2aae84c2285" />

Patient Dashboard

<img width="1920" height="965" alt="image" src="https://github.com/user-attachments/assets/8bda0076-b8fb-4d7f-b6e3-572f92dc8e6d" />

<img width="1920" height="966" alt="image" src="https://github.com/user-attachments/assets/39e848ce-a7b4-4c51-8921-02689999cb1e" />

Admin Dashboard

<img width="1920" height="964" alt="image" src="https://github.com/user-attachments/assets/87225c75-58ac-4dff-a0f3-e51408d04eb0" />

<img width="1920" height="966" alt="image" src="https://github.com/user-attachments/assets/e2265982-ea3f-4463-945b-de2230e8ef11" />

Nurse dashboard

<img width="1920" height="965" alt="image" src="https://github.com/user-attachments/assets/267a868f-6352-4d4c-8169-1900d20364d1" />

<img width="1920" height="967" alt="image" src="https://github.com/user-attachments/assets/6841f3db-30c3-4989-bda0-f2f3ac65d105" />

<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/1f83e5ec-f68b-4cd7-92a4-4caccc38402f" />

<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/c429ba22-d440-4762-9426-1ab528b72aac" />

Doctor Dashboard

<img width="1920" height="965" alt="image" src="https://github.com/user-attachments/assets/1ff0d3d7-487a-49be-a85d-a42294e757e5" />

<img width="1918" height="964" alt="image" src="https://github.com/user-attachments/assets/433580f6-1027-4ca0-bcee-5d95092a7ee4" />

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


### How to add in an Admin user

1. Use PSQL to enter the database:
   ```
   docker exec -it healthapp_db psql -U healthapp_user -d healthappdb
   ```

2. Find the user id for the patient role account that you want to convert to admin role by SQL querying with the email address of that user:
   ```
   SELECT id, email FROM users WHERE email = 'admin@example.com';
   ```

3. Add the admin role for that specific user id:
   ```
   INSERT INTO user_roles (user_id, role)
   VALUES (<user_id>, 'ADMIN');
   ```

4. Verify that specific user id's role has been changed:
   ```
   SELECT * FROM user_roles WHERE user_id = <user_id>;
   ```
