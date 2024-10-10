import React from 'react';
import Header from '../../modules/header/index.component';
import Footer from '../../modules/footer/footer.component';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  return (
    <>
      <Header />
      {children}
      {location.pathname !== '/login' &&
        location.pathname !== '/register' &&
        location.pathname !== '/registered' && <Footer />}
    </>
  );
};

export default Layout;
