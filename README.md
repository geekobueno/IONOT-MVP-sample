# Training Management Platform Backend  

This repository contains the  implementation for a **Training Management Platform**. The platform facilitates project assignment, progress tracking, and administrative monitoring to streamline candidate training and performance evaluation.  

## **Features**  
### **1. Project Management**  
- Retrieve a list of available projects.  
- Assign projects to candidates.  
- Track project status and difficulty levels.  

### **2. Progress Tracking**  
- Monitor candidate progress with percentage completion and scores.  
- Update progress records as candidates complete assignments.  

### **3. Admin Dashboard**  
- View overall statistics on platform usage.  
- Access detailed project and candidate performance reports.  
- Create and manage new projects.  

### **4. Additional Capabilities**  
- CRUD operations for managing Candidates, Projects, and Progress data.  
- Aggregated metrics for insights into training outcomes.  

## **Technical Stack**  
- **Backend Framework:** Express.js  
- **Database:** MongoDB, with Mongoose for schema modeling.  
- **Environment Configuration:** `.env` file for sensitive credentials.  
- **Middleware:**  
  - CORS support for secure cross-origin requests.  
  - Centralized error handling for better debugging and reliability.  

## **API Endpoints**  
### **Project Management**  
- `GET /projects` - Fetch all available projects.  
- `POST /projects/accept` - Accept a project assignment.  

### **Progress Tracking**  
- `GET /progress/:candidateId` - Retrieve progress for a specific candidate.  
- `PATCH /progress/:progressId` - Update progress details.  

### **Admin Dashboard**  
- `GET /admin/dashboard` - Get overall platform statistics.  
- `GET /admin/projects` - View detailed project information.  
- `GET /admin/candidates/performance` - View candidate performance metrics.  
- `POST /admin/projects` - Create a new project.  

## **Getting Started**  
### **Prerequisites**  
- Node.js (v16+ recommended)  
- MongoDB (local or cloud-based instance)  

### **Installation**  
1. Clone the repository:  
   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. Install dependencies:  
   ```bash
   npm install

3. Set up environment variables:  
    Create a .env file in the root directory.
    Add the following variables:
   ```bash
   PORT=5000  
   MONGO_URI=<your-mongodb-connection-string>  

### **Running the Backend**  

1. Start the server:  
   ```bash
   npm start

2. Access the API at http://localhost:5000.  


