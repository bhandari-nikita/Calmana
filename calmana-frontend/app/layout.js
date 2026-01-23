//calmana-frontend/app/layout.js
// import Footer from '@/components/Footer'
import './globals.css'
// import Navbar from '@/components/Navbar'
import ClientWrapper from './ClientWrapper'

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
        <style>{`
            link[rel="icon"] {
            border-radius: 50%;
            object-fit: contain;
          }
        `}</style>
      </head>
      
      <body className="min-h-screen flex flex-col bg-white text-gray-800">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
