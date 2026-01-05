import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css';
import "./assets/styles/Header.css";
import "./assets/styles/Footer.css";
import "./assets/styles/Sidebar.css";
import "./assets/styles/index.css";
import "./assets/styles/App.css";
import "./assets/styles/control-switch.css";

import App from "./App.jsx";

import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./context/UserProvider";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <UserProvider>
      <App />
    </UserProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
