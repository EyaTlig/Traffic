import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import toast from 'react-hot-toast';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        email
        username
        role
        isActive
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $username: String!, $password: String!, $role: UserRole) {
    register(email: $email, username: $username, password: $password, role: $role) {
      accessToken
      user {
        id
        email
        username
        role
        isActive
      }
    }
  }
`;

// Créer et exporter le contexte
export const AuthContext = createContext(null);

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      const { accessToken, user: userData } = data.login;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Bienvenue, ${userData.username}!`);
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.message || 'Échec de la connexion');
      return false;
    }
  };

  const register = async (email, username, password, role = 'OPERATOR') => {
    try {
      const { data } = await registerMutation({ 
        variables: { email, username, password, role } 
      });
      const { accessToken, user: userData } = data.register;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Bienvenue, ${username}!`);
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.message || 'Échec de l\'inscription');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export par défaut
export default AuthContext;