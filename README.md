# DocBot Widget Integration Guide

## 1. Installation

Copy the `src/features/docbot` folder into your React project's `src/features` directory (or equivalent).

Install the required dependencies:

```bash
npm install framer-motion lucide-react react-markdown recharts zustand clsx tailwind-merge
```

## 2. Usage

Import the widget in your main App component or Layout file.

```tsx
import { DocBotWidget } from './features/docbot';

function App() {
  return (
    <div>
      {/* Your existing app content */}
      
      {/* Add the widget at the bottom */}
      <DocBotWidget />
    </div>
  );
}
```

## 3. Database Setup

Run the `schema.sql` script in your PostgreSQL database to create the necessary tables.

## 4. Customization

- **Styling**: The widget uses Tailwind CSS. You can customize colors in `ChatWidget.tsx` and `ChatWindow.tsx`.
- **API Integration**: Currently, the API call is simulated in `InputArea.tsx`. You need to replace the `setTimeout` with a real API call to your backend.
