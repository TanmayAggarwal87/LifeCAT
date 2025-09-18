# LifeCAT


LifeCAT (Life Cycle Assessment Tool) is a comprehensive web-based platform engineered to streamline and facilitate Life Cycle Assessment (LCA) studies. It empowers users to efficiently upload data, input crucial information, conduct robust LCA calculations, visualize environmental impacts, and generate actionable recommendations aimed at enhancing product and system sustainability. With its intuitive interface, LifeCAT strives to demystify complex LCA processes, making them more accessible and efficient for professionals and researchers alike.

## ✨ Features

*   **Intuitive Data Upload:** Supports the upload of various data formats, including the capability to parse information from PDF documents, to populate LCA models seamlessly.
*   **Structured Data Input:** Provides user-friendly forms for entering detailed life cycle inventory data with precision.
*   **Life Cycle Assessment Engine:** Incorporates a core functionality to process uploaded and manually input data, performing LCA calculations based on established methodologies.
*   **Interactive Results Visualization:** Features dynamic dashboards and charts that visually represent environmental impacts, identify hotspots, and display key performance indicators (KPIs).
*   **Actionable Recommendations:** Generates insightful suggestions and recommendations for optimizing product design, material selection, and operational processes to minimize environmental footprints.
*   **Modular Component Architecture:** Developed with reusable React components, ensuring high scalability, maintainability, and a consistent user experience.
*   **Responsive User Interface:** A modern, clean, and responsive design provides a seamless experience across a variety of devices.

## 🚀 Tech Stack

LifeCAT is built using a modern and robust stack, ensuring performance, scalability, and an excellent developer experience.

*   **Frontend:**
    *   **React.js:** A declarative, component-based JavaScript library for building user interfaces.
    *   **Vite:** A fast and opinionated build tool that provides an extremely quick development experience.
    *   **JavaScript (ES6+):** The primary programming language for interactive web experiences.
    *   **CSS/Tailwind CSS (Implied):** For styling, potentially utilizing a utility-first CSS framework for rapid UI development.
    *   **Shadcn UI (Implied):** A collection of reusable components for building beautiful UIs.
*   **Backend:**
    *   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine for server-side logic.
    *   **Express.js (Likely):** A fast, unopinionated, minimalist web framework for Node.js.
    *   **PDF Processing:** Libraries for handling and extracting data from PDF documents (e.g., `pdf.js` for server-side usage).

## ⚙️ Installation Guide

Follow these steps to set up and run LifeCAT locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) (npm comes with Node.js)

### Clone the Repository

```bash
git clone https://github.com/your-username/LifeCAT.git
cd LifeCAT
```

### Backend Setup

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install # or yarn install
```

Start the backend server:

```bash
node pdf.js # or equivalent command to start your backend server (e.g., npm start)
```

*(Note: `node pdf.js` is an assumption based on `pdf.js` being a root file. Adjust as per actual backend start script, e.g., `npm start` if defined in `package.json`)*

### Frontend Setup

Open a new terminal, navigate to the `frontend` directory, and install dependencies:

```bash
cd ../frontend
npm install # or yarn install
```

Start the frontend development server:

```bash
npm run dev # or yarn dev
```

The frontend application should now be running, typically accessible at `http://localhost:5173` (or another port specified by Vite).

## 📁 Project Structure

```
LifeCAT/
├── .DS_Store
├── .gitignore
├── .vite/
│   └── deps/
│       ├── _metadata.json
│       └── package.json
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   ├── pdf.js
│   └── test.json
├── frontend/
│   ├── README.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Attributions.md
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataUpload.jsx
│   │   │   ├── InputForm.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── ResultsVisualization.jsx
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppContent.jsx
│   │   │   │   ├── AppFooter.jsx
│   │   │   │   ├── AppHeader.jsx
│   │   │   │   ├── AppNavigation.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── ui/
│   │   │       ├── alert.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       ├── progress.jsx
│   │   │       ├── select.jsx
│   │   │       ├── table.jsx
│   │   │       ├── tabs.jsx
│   │   │       ├── textarea.jsx
│   │   │       └── utils.js
│   │   ├── guidelines/
│   │   │   └── Guidelines.md
│   │   ├── hooks/
│   │   │   └── useAppState.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── utils/
│   │       └── lca.js
│   └── vite.config.js
├── package-lock.json
└── package.json
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

-- made by docify --
