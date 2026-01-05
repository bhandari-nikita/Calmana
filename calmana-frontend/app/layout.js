//calmana-frontend/app/layout.js
// import Footer from '@/components/Footer'
import './globals.css'
// import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Calmana', // fixed name spelling
  description: 'Your personal mental wellness companion',
  icons: {
    icon: {
      url: '/Calmana_green_initial.png',
      type: 'image/png',
      sizes: '45x45',
    },
  },
}; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add inline favicon styling to make it circular and cleaner */}
        <style>{`
          link[rel="icon"] {
            border-radius: 50%;
            object-fit: contain;
          }
        `}</style>
      </head>
      {/* <body className="bg-[var(--soft-green)] text-gray-800"> */}
      <body className="bg-white text-gray-800">

        {/* <Navbar /> */}
        <main className="p-1">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
