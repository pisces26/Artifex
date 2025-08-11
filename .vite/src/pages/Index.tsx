import { Navigate } from 'react-router-dom';

// This component is no longer used as the main page - redirect to Home
const Index = () => {
  return <Navigate to="/home" replace />;
};

export default Index;
