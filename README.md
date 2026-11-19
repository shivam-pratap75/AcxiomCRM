# AcxiomCRM – Customer Relationship Management System

AcxiomCRM is a role-based Customer Relationship Management (CRM) application designed to help sales teams manage customers, leads, opportunities, follow-ups, and sales activities efficiently.

The application provides a centralized platform for organizing customer information, tracking sales progress, and managing daily sales operations.

## Features

- **Authentication & Authorization:** Secure registration and login using JWT authentication and password hashing.
- **Role-Based Access Control:** Different access permissions for Admin, Manager, and Sales Executive.
- **Dashboard:** Overview of customers, leads, opportunities, follow-ups, and activities.
- **Customer Management:** Create, view, update, delete, and search customer records.
- **Lead Management:** Track leads, manage their statuses, and assign them to sales executives.
- **Opportunity Management:** Track sales opportunities, deal amounts, probabilities, and stages.
- **Follow-Up Management:** Schedule and manage customer and lead follow-ups.
- **Activity Management:** Track calls, meetings, emails, and tasks.

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
AcxiomCRM/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shivam-pratap75/AcxiomCRM.git
cd AcxiomCRM
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

`http://localhost:5173`

## Database

AcxiomCRM uses MongoDB as its database and Mongoose for database modeling and operations.

The application stores information about users, customers, leads, opportunities, follow-ups, and activities.

To insert sample data, run the seed script from the backend directory:

```bash
npm run seed
```

## User Roles

| Role | Responsibility |
|---|---|
| Admin | Manages users and has broad access to CRM records |
| Manager | Oversees sales operations and team activities |
| Sales Executive | Manages assigned customers, leads, and sales activities |

## API Base URL

```text
http://localhost:5000/api
```

## Future Enhancements

- Advanced sales analytics and reporting.
- Comprehensive audit logging.
- Team-based access management.
- Improved notification and reminder system.

## Author

**Shivam Pratap**

GitHub: [shivam-pratap75](https://github.com/shivam-pratap75)

---

*AcxiomCRM – Simplifying Customer and Sales Management.*
