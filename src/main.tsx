import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { OmniBar } from './components/omni-bar/OmniBar'
import { Widget } from './components/widget/Widget'
import './index.css'

const getPath = () => window.location.pathname;

const renderApp = () => {
  const path = getPath();
  const root = document.getElementById('root')!;

  if (path === '/omni-bar') {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <OmniBar />
      </React.StrictMode>
    );
  } else if (path === '/widget') {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Widget />
      </React.StrictMode>
    );
  } else {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

renderApp();
