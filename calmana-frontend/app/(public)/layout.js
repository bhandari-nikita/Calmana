import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="p-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
