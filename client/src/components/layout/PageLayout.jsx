// src/components/layout/PageLayout.jsx
import Navbar from './Navbar';
import Footer from './Footer';

const PageLayout = ({ children, fullWidth = false }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className={`flex-1 pt-16 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
      {children}
    </main>
    <Footer />
  </div>
);

export default PageLayout;
