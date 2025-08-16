import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // or index.css if that’s your global style file
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);