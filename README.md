# 🚀 React + Vite + Tailwind Starter

A modern and fast **React + Vite** project setup powered by **Tailwind CSS**, featuring a clean architecture with reusable components, state management, and routing ready out of the box.

# CUBII

## Description
This is a React application built with Vite. The project includes various pages, components, and APIs for managing invoices, mechanisms, suppliers, warehouses, and more.

---

## 📁 Project Structure

```
src/
 ┣ api/
 │   ┣ httpClient.js          # Axios / fetch setup
 │   ┗ modules/
 │      ┣ usersApi.js
 │      ┣ suppliersApi.js
 │      ┣ machinesApi.js
 │      ┣ mechanismsApi.js
 │      ┣ warehousesApi.js
 │      ┣ invoicesApi.js
 │      ┗ reportsApi.js
 │
 ┣ layout/
 │   ┣ Header.jsx       
 │   ┗ MainLayout.jsx  
 ┣ router/
 │  ┣ AppRouter.jsx
 │  ┣ guards/
 │  │   ┣ ProtectedRoute.jsx
 │  │   ┗ PermissionGate.jsx
 ┣ features/
 │  ┣ auth/
 │  │   ┗ pages/
 │  │       ┗ LoginPage.jsx
 │  │   ┗ hooks/
 │  │       ┗ useCurrentUser.js
 │
 ┣ components/
 ┣ store/
 │   ┗ useAuthStore.js
 ┣ hooks/
 ┣ utils/
 ┣ assets/
 ┣ App.jsx
 ┗ main.jsx

```

---

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/EsraaSoliman2003/FrontEndStructure.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd project-name
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

6. **Preview production build**

   ```bash
   npm run preview
   ```

---

## 🎨 Tech Stack

- ⚛️ **React 19** — Frontend library
- ⚡ **Vite** — Fast build tool
- 💅 **Tailwind CSS** — Utility-first CSS framework
- 🧩 **React Router DOM** — Routing and navigation
- 🧠 **zustand** — Global state management (optional)

---

## 🧱 Features

- 🔹 Clean and scalable folder structure
- 🔹 Ready-to-use Navbar and Sidebar components
- 🔹 Fast HMR (Hot Module Replacement)
- 🔹 Fully responsive design with Tailwind
- 🔹 Easy customization

---

## 🧭 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Run development server   |
| `npm run build`   | Build production files   |
| `npm run preview` | Preview production build |

---

## 📦 Environment Variables

Create a `.env` file in the root folder:

```
VITE_API_URL=https://api.example.com
```

Access inside the app:

```js
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📘 Recommended Extensions (VS Code)

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prettier** — Code formatter

---

## 👨‍💻 Author

**Esraa Soliman**
Full Stack Developer — Passionate about building modern web applications.
[LinkedIn](https://www.linkedin.com/in/esraa-soliman-7b132a249) | [GitHub](https://github.com/EsraaSoliman2003)

---

## 📜 License

This project is licensed under the **MIT License** — free to use and modify.
