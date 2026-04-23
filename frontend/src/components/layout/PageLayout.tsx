import Navbar from '../Navbar';
import './PageLayout.css';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="page-container">
        {children}
      </main>
    </>
  );
}