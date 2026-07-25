// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "../router";

export default function App() {  // ← Make sure this is "export default"
  return <RouterProvider router={router} />;
}