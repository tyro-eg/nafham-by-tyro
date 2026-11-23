import React from 'react';
import Header from '../../modules/header/index.component';
import Footer from '../../modules/footer/footer.component';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import SidebarLayout from '../sidebar-layout/sidebar-layout.component';

interface LayoutProps {
  children: React.ReactNode;
}

// Routes where footer should not be displayed
const ROUTES_WITHOUT_FOOTER = ['/login', '/register', '/registered'];
// Sign in carries its own small top row (logo, language): no site header
const ROUTES_WITHOUT_HEADER = ['/login'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  // The activation page (/activate/<token>) looks like sign in
  const activating = location.pathname.startsWith('/activate/');
  const showFooter =
    !activating && !ROUTES_WITHOUT_FOOTER.includes(location.pathname);
  const showHeader =
    !activating && !ROUTES_WITHOUT_HEADER.includes(location.pathname);

  // Signed-in users navigate with the left sidebar instead of the header
  if (currentUser) {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return (
    <>
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </>
  );
};

export default Layout;
