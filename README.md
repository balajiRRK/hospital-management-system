#  HealthApp

A simple **health management application** targeted for **doctors, nurses, patients, and admins**.  
The system supports **multi-role access** with **role-based views and permissions**, ensuring secure and efficient management of healthcare workflows.  

---

##  Features

-  **Secure Login & Session Management**  
  Encrypted authentication with role-based access control to conform to HIPAA requirements.

###  **Role-Specific Dashboards**  
  - **Doctors**: Manage patient data & records.  
  - **Patients**: Book and track appointments.  
  - **Nurses**: Support patient care workflows.  
  - **Admins**: Access audit logs and reporting views.

### **Technology Stack**  
  - **Backend**: Spring Boot (Java)
  - **Frontend**: Next.js
  - **Deployment**: AWS 
  - **Containerization**: Docker
  - **Version Control**: Git

## Usage

1. Clone this repository:
    ```
    git clone https://github.com/Royalross/HealthApp.git
    cd repo-exporter
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
