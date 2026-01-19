# Smart Resto 🍽️

Smart Resto is a comprehensive, modern web application designed to streamline restaurant management. It provides a robust platform for managing finances, products, and daily operations, built with the latest web technologies for a premium user experience.

## 🚀 Technologys Stack

This project is built using a modern, performance-oriented stack:

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives + Lucide Icons)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query](https://tanstack.com/query/latest)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Backend Integration**: Axios (Proxying to a REST API, likely Node.js/Prisma based)

## ✨ Features

### 📊 Dashboard & Analytics

- Real-time overview of business performance.
- Key metrics visualization.

### 💰 Finance Module

- **Expense Tracking**: Log and categorize operational expenses.
- **Forecasting**: View projected costs and revenue.
- **Transactions Management**: Detailed list of all financial movements.
- **Smart Forms**: automated handling of installments and intervals.
- **Visual Reports**: Charts for monthly expenses vs. revenue.

### 📦 Product Management

- **Inventory Control**: Create, update, and delete products.
- **Search & Filter**: Quickly find items by name, category, or status.
- **Rich Data**: Manage pricing, descriptions, and availability.

### 🔐 Authentication & Security

- Secure Login and Registration pages.
- Protected routes ensuring only authorized access.

### ⚙️ Company Settings

- customizable store profile and configurations.

## 📝 Implementation Checklist

### ✅ Completed

- [x] **Project Initialization**: Setup Vite + React + TypeScript + Tailwind.
- [x] **Authentication**:
  - [x] Login Page
  - [x] Register Page
  - [x] Route Guards / Protected Layouts
- [x] **Layout Architecture**:
  - [x] Main Dashboard Shell
  - [x] Sidebar Navigation
- [x] **Product Module**:
  - [x] Products Listing Table
  - [x] Add/Edit Product Dialogs
  - [x] Delete Confirmation
- [x] **Finance Module**:
  - [x] Finance Dashboard
  - [x] Expense Form with Validation
  - [x] Financial Forecasting View
  - [x] Transaction History

### 🚧 In Progress / To Do

- [ ] **Orders Management**:
  - [ ] POS (Point of Sale) Interface
  - [ ] Order Status Tracking (Pending, Preparing, Ready)
- [ ] **Kitchen Display System (KDS)**:
  - [ ] Real-time Kitchen View
- [ ] **Customer Loyalty**:
  - [ ] Customer Database
  - [ ] Loyalty Points System
- [ ] **Reporting**:
  - [ ] Advanced Sales Reports
  - [ ] Export to CSV/PDF

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/smart-resto.git
    cd smart-resto
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory if needed (refer to `.env.example`).

### Running Locally

Start the development server:

```bash
npm run dev
```

Access the app at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

## 📂 Project Structure

```bash
src/
├── components/     # Reusable UI components (Buttons, Inputs, Dialogs)
├── hooks/          # Custom React hooks
├── lib/            # Utilities (API clients, helpers)
├── pages/          # Page components (routed views)
│   ├── auth/       # Login/Register
│   ├── finance/    # Finance dashboard & features
│   └── products/   # Product management
├── store/          # Global state (Zustand)
└── types/          # TypeScript type definitions
```

---

Built with ❤️ by the Smart Resto Team.
