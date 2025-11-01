import React from 'react';
import Header from '../../modules/header/index.component';
import Footer from '../../modules/footer/footer.component';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

// Routes where footer should not be displayed
const ROUTES_WITHOUT_FOOTER = ['/login', '/register', '/registered'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const showFooter = !ROUTES_WITHOUT_FOOTER.includes(location.pathname);

  return (
    <>
      <Header />
      {children}
      {showFooter && <Footer />}
    </>
  );
};

export default Layout;
