import Navbar from './Navbar';

export default function PageLayout({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-canvas-bg">
      <Navbar />
      <main className={`max-w-screen-xl mx-auto px-4 py-6 ${className}`}>
        {children}
      </main>
    </div>
  );
}
