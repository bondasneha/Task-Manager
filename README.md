#  Task Manager

A full-stack **Task Management Application** built using **Next.js**, **TypeScript**, **MongoDB**, and **NextAuth** for authentication.  
This app allows users to sign up, log in, and manage their daily tasks efficiently with a clean and interactive interface.



##  Features

- **User Authentication** – Secure login and signup using NextAuth (Credentials Provider).  
- **Task Management** – Create, update, delete, and reorder tasks.  
- **Drag & Drop Interface** – Reorder tasks easily using `@hello-pangea/dnd`.  
- **Animated Dashboard** – Smooth UI with Framer Motion animations.  
- **Responsive Design** – Works on desktop, tablet, and mobile.  
- **Database Integration** – MongoDB for user and task storage.  



##  Tech Stack

### **Frontend**
- Next.js  
- React  
- TypeScript  
- Tailwind CSS  

### **Backend**
- Next.js API Routes  

### **Database**
- MongoDB  

### **Authentication**
- NextAuth  

### **UI Enhancements**
- Framer Motion  
- Shadcn/UI  

### **State Management**
- React Hooks & Context  

### **Drag & Drop**
- @hello-pangea/dnd  



##  Installation

### 1️ Clone the Repository

git clone https://github.com/bondasneha/Task-Manager.git
cd Task-Manager

### 2️ Install Dependencies


npm install
# or
pnpm install

### 3 Add Environment Variables
Create a .env file in your project root and add the following:

MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

### 4️ Run the Development Server

npm run dev

Then open:
 http://localhost:3000/signup

## Folder Structure

# Task-Manager/
 │
 ├──## app/
 
 │   ├── ### api/
 
 │   │   ├── auth/[...nextauth]/route.ts
 
 │   │   └── tasks/route.ts
 
 │   ├── dashboard/page.tsx
 
 │   ├── login/page.tsx
 
 │   └── signup/page.tsx
 │
 ├──## components/
 
 │   ├── Task.tsx
 
 │   └── Dashboard.tsx
 │
 ├──## lib/
 
 │   ├── mongodb.ts
 
 │   └── auth.ts
 │
 ├──## assets/
 
 │   └── screenshots/
 │
 ├── ## styles/
 
 │   └── globals.css
 │
 ├── .env
 
 ├── .gitignore
 
 ├── next.config.js
 
 ├── package.json
 
 └── README.md


## Screenshots

Place your screenshots inside the assets/screenshots/ folder and reference them here:

### Page	Preview

Dashboard	
Login Page	
Add Task	
Signup Page	

## Deployment (Vercel)

To deploy your project:

Push your project to GitHub

Go to Vercel

Import your repository

Add your .env variables in Vercel settings

Click Deploy

## Future Improvements

Add task categories and filters

Integrate with Google Calendar / Reminders

Add dark mode toggle

Improve analytics and user insights


## License
This project is licensed under the MIT License.


