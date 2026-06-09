# Nexus – Investor & Entrepreneur Collaboration Platform

Nexus is a full-stack web application designed to connect investors and entrepreneurs through a secure and professional digital platform. The system allows users to register as either an Investor or Entrepreneur, manage their profiles, explore users by role, schedule meetings, exchange messages, manage documents, receive notifications, handle mock payments/deals, and view real-time dashboard statistics.

This project was developed as part of the DeveloperHub Corporation Full Stack Development Internship task.

---

## Project Overview

The main goal of Nexus is to provide a centralized platform where investors and entrepreneurs can collaborate effectively. Entrepreneurs can present their startup profiles, connect with investors, schedule meetings, share important documents, and communicate through messages. Investors can explore entrepreneurs, review profiles, schedule meetings, manage deal payments, and track all platform activities through a dashboard.

The project includes both frontend and backend implementation with database integration.

---

## Developed By

**Name:** Bushra Afridi
**Internship Program:** DeveloperHub Corporation – Full Stack Development Internship
**Project Name:** Nexus – Investor & Entrepreneur Collaboration Platform
**Technology:** React, ASP.NET Core Web API, SQL Server

---

## Main Features

### 1. Authentication and Authorization

The system includes secure user registration and login functionality using JWT authentication.

Features included:

* User registration
* User login
* JWT token-based authentication
* Protected backend APIs
* Role-based access for Investor and Entrepreneur
* Authenticated user profile access

---

### 2. User Profile Management

Users can view and update their profile information from the settings page.

Features included:

* Get logged-in user profile
* Update user profile
* Store updated profile information in database
* Frontend profile form connected with backend API

---

### 3. Investor and Entrepreneur Listing

The platform provides separate pages for investors and entrepreneurs.

Features included:

* View all investors
* View all entrepreneurs/startups
* View user details by ID
* Open investor profile page
* Open entrepreneur profile page
* Backend connected with frontend listing pages

---

### 4. Meeting Scheduling

Users can schedule meetings with opposite-role users.

Features included:

* Investor can schedule meeting with Entrepreneur
* Entrepreneur can schedule meeting with Investor
* Meeting title, agenda, date, time, and meeting link
* Conflict checking
* My Meetings page
* Accept meeting
* Reject meeting
* Cancel meeting
* Meeting status management

---

### 5. Document Chamber

The document chamber allows users to upload, share, download, sign, reject, and delete documents.

Features included:

* Upload documents
* View my documents
* Share document with another user
* Download document
* Sign document
* Reject document
* Delete document
* Document status tracking

---

### 6. Chat and Messages

The project includes a working chat and messaging system.

Features included:

* Send message to another user
* View my chats
* View conversation with specific user
* Mark messages as read
* Real backend database storage
* Frontend Messages page connected with backend
* Frontend Chat page connected with backend

---

### 7. Notifications

The notification module allows users to receive and manage platform notifications.

Features included:

* Create notification
* View my notifications
* Mark single notification as read
* Mark all notifications as read
* Delete notification
* Unread notification count
* Frontend notification page connected with backend

---

### 8. Mock Payments and Deals

A mock payment/deal flow is implemented to simulate investment transactions.

Features included:

* Create mock payment
* View my payments
* Complete pending payment
* Fail pending payment
* Refund completed payment
* Payment status tracking
* Transaction reference generation
* Support for mock payment methods such as Mock Stripe, Mock PayPal, and Mock Bank Transfer

---

### 9. Dashboard Real Statistics

The dashboard shows real statistics from the backend database.

Stats included:

* Total meetings
* Pending meetings
* Accepted meetings
* Total documents
* Signed documents
* Total payments
* Completed payments
* Pending payments
* Total chats
* Unread messages
* Unread notifications
* Total investors
* Total entrepreneurs

Both Investor Dashboard and Entrepreneur Dashboard are connected with real backend data.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Lucide React Icons
* React Hot Toast

### Backend

* ASP.NET Core Web API
* .NET 8
* Entity Framework Core
* JWT Authentication
* SQL Server
* Swagger / OpenAPI

### Database

* SQL Server
* Entity Framework Core Migrations

---

## Project Structure

```text
Nexus-FullStack
│
├── Nexus.Client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   │   ├── auth
│   │   │   ├── dashboard
│   │   │   ├── profile
│   │   │   ├── investors
│   │   │   ├── entrepreneurs
│   │   │   ├── meetings
│   │   │   ├── messages
│   │   │   ├── chat
│   │   │   ├── documents
│   │   │   ├── notifications
│   │   │   ├── deals
│   │   │   └── settings
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── Nexus.API
    ├── Controllers
    ├── Data
    ├── DTOs
    ├── Models
    ├── Migrations
    ├── Program.cs
    └── appsettings.json
```

---

## Backend API Endpoints

### Authentication APIs

```text
POST /api/Auth/register
POST /api/Auth/login
GET  /api/Auth/me
```

### Profile APIs

```text
GET /api/Profile
PUT /api/Profile
```

### Users APIs

```text
GET /api/Users/investors
GET /api/Users/entrepreneurs
GET /api/Users/{id}
```

### Meetings APIs

```text
POST /api/Meetings/schedule
GET  /api/Meetings/my-meetings
PUT  /api/Meetings/{id}/accept
PUT  /api/Meetings/{id}/reject
PUT  /api/Meetings/{id}/cancel
```

### Documents APIs

```text
POST   /api/Documents/upload
GET    /api/Documents/my-documents
GET    /api/Documents/{id}/download
PUT    /api/Documents/{id}/sign
PUT    /api/Documents/{id}/reject
DELETE /api/Documents/{id}
```

### Messages APIs

```text
POST /api/Messages/send
GET  /api/Messages/conversation/{userId}
GET  /api/Messages/my-chats
PUT  /api/Messages/{id}/read
```

### Notifications APIs

```text
POST   /api/Notifications/create
GET    /api/Notifications/my-notifications
PUT    /api/Notifications/{id}/read
PUT    /api/Notifications/read-all
DELETE /api/Notifications/{id}
```

### Payments APIs

```text
POST /api/Payments/create
GET  /api/Payments/my-payments
PUT  /api/Payments/{id}/complete
PUT  /api/Payments/{id}/fail
PUT  /api/Payments/{id}/refund
```

### Dashboard APIs

```text
GET /api/Dashboard/stats
```

---

## How to Run the Project

### Prerequisites

Before running the project, install the following:

* Node.js
* .NET 8 SDK
* SQL Server
* Visual Studio Code or Visual Studio
* Entity Framework Core CLI

---

## Backend Setup

Open terminal in the backend folder:

```bash
cd Nexus.API
```

Restore backend packages:

```bash
dotnet restore
```

Update database using Entity Framework Core:

```bash
dotnet ef database update
```

Run backend:

```bash
dotnet run
```

Backend will run on:

```text
http://localhost:5000
```

Swagger API documentation will be available at:

```text
http://localhost:5000/swagger
```

---

## Frontend Setup

Open terminal in the frontend folder:

```bash
cd Nexus.Client
```

Install frontend packages:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## API Base URL

Frontend API connection is handled through Axios.

API base URL:

```text
http://localhost:5000/api
```

---

## Authentication Flow

After login, the backend returns a JWT token. The frontend stores the token in local storage and sends it with protected API requests.

Local storage keys used:

```text
nexus_token
business_nexus_user
```

Protected APIs require authorization using JWT token.

---

## Database Tables

The project uses SQL Server database with Entity Framework Core. Main database tables include:

```text
Users
Meetings
Documents
Messages
Notifications
Payments
```

---

## Main Pages

### Public Pages

```text
/login
/register
```

### Dashboard Pages

```text
/dashboard/investor
/dashboard/entrepreneur
```

### Platform Pages

```text
/investors
/entrepreneurs
/profile/investor/:id
/profile/entrepreneur/:id
/meetings
/messages
/chat/:userId
/documents
/notifications
/deals
/settings
/help
```

---

## Testing

The project was tested using:

* Swagger for backend API testing
* Browser testing for frontend pages
* SQL Server database checking
* JWT token authorization testing
* Role-based user testing

Tested modules include:

* Register and login
* Protected user profile
* Investor and entrepreneur listing
* Profile update
* Meeting scheduling
* Meeting accept/reject/cancel
* Document upload/download/sign/reject/delete
* Chat message send and conversation view
* Notifications read/delete
* Mock payment create/complete/fail/refund
* Dashboard real statistics

---

## Project Completion Summary

The following modules have been completed successfully:

```text
Authentication and JWT Authorization
Profile Management
Investor and Entrepreneur Listings
User Profile Pages
Meeting Scheduling
Document Chamber
Chat and Messages
Notifications
Mock Payments and Deals
Dashboard Real Statistics
Frontend and Backend Integration
SQL Server Database Integration
Swagger API Testing
```

---

## Future Improvements

Although the current version is functional and complete according to the internship requirements, the project can be improved further with the following features:

* Real Stripe or PayPal payment integration
* Real-time chat using SignalR
* Real video calling integration
* Email notifications
* Advanced search and filters
* Admin dashboard
* File preview before download
* Deployment on cloud hosting
* Improved role-based permissions
* Better analytics and charts

---

## Conclusion

Nexus is a complete full-stack investor and entrepreneur collaboration platform. It includes authentication, role-based user management, profile management, meeting scheduling, document sharing, chat, notifications, mock payments, and real dashboard statistics. The project demonstrates strong full-stack development skills using React, ASP.NET Core Web API, SQL Server, Entity Framework Core, JWT authentication, and frontend-backend integration.

This project is ready for final testing, screenshots, report writing, and internship submission.
