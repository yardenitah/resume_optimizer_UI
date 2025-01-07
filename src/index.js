import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap's main CSS
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css'; // Custom global styles
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
