import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import GlobalStyles from './styles/GlobalStyles';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import 'react-tooltip/dist/react-tooltip.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--bg-100);
  color: var(--text-100);
`;

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContainer>
            <GlobalStyles />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </AppContainer>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
