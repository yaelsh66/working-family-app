import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BackgroundWrapper = ({ children }) => {
  const { user } = useAuth();

  const getBackgroundColor = () => user?.backgroundColor || localStorage.getItem('backgroundColor') || '#ffffff';
  const getBackgroundImage = () => user?.backgroundImage || localStorage.getItem('backgroundImage') || '';

  const [color, setColor] = useState(getBackgroundColor());
  const [image, setImage] = useState(getBackgroundImage());

  useEffect(() => {
    setColor(getBackgroundColor());
    setImage(getBackgroundImage());
  }, [user]);

  return (
    <div
      style={{
        backgroundColor: color,
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        minHeight: '100vh',
        marginLeft: '250px', // account for sidebar width
        padding: '20px'
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
