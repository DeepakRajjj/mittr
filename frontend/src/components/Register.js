import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const RegisterCard = styled.div`
  background-color: var(--bg-200);
  padding: 40px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  color: var(--primary-200);
  margin-bottom: 30px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
`;

const Button = styled.button`
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  margin-top: 10px;
  text-align: center;
`;

const LinkText = styled(Link)`
  color: var(--primary-200);
  text-decoration: none;
  text-align: center;
  margin-top: 20px;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Create Account</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="primary-button">
            Register
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
        <LinkText to="/login">
          Already have an account? Login here
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
