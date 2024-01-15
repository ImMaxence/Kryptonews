import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";


import App from './App';
import "./styles/index.scss";
import 'bootstrap/dist/css/bootstrap.css';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // <BrowserRouter>
  <App />
  // </BrowserRouter>
);




