import React from 'react';
import Header from '../../modules/header/index.component';
import Footer from '../../modules/footer/footer.component';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import TutorLayout from '../tutor-layout/tutor-layout.component';

interface LayoutProps {
  children: React.ReactNode;
}

// Routes where footer should not be displayed
const ROUTES_WITHOUT_FOOTER = ['/login', '/register', '/registered'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const showFooter = !ROUTES_WITHOUT_FOOTER.includes(location.pathname);

  // Tutors navigate with the left sidebar instead of the site header
  if (currentUser?.type === 'Tutor') {
    return <TutorLayout>{children}</TutorLayout>;
  }

  return (
    <>
      <Header />
      {children}
      {showFooter && <Footer />}
    </>
  );
};

export default Layout;
