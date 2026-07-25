// src/routes.tsx
import { createBrowserRouter, Outlet, Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Home } from "./pages/Home";
import { TourDetail } from "./pages/TourDetail";
import { BookingPage } from "./pages/BookingPage";
import { BookingConfirmation } from "./pages/BookingConfirmation";
import { TourList } from "./pages/TourList";

const SERIF = "'Playfair Display', Georgia, serif";

export function Root() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/tours', label: 'Tours' },
    { path: '/#about', label: 'About' },
    { path: '/#contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#2A2824] border-b border-[#FAF7F2]/5">
        <div className="max-w-7xl mx-auto px-6 xl:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[#FAF7F2] text-[20px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                Siam Journeys
              </span>
              <span className="text-[#B8952A] text-[10px] tracking-[0.2em] uppercase border-l border-[#FAF7F2]/20 pl-3 ml-1 hidden sm:inline">
                Bangkok
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[12px] tracking-[0.1em] uppercase transition-colors duration-200 ${
                    isActive(link.path === '/' ? '/' : link.path.split('#')[0])
                      ? 'text-[#B8952A]'
                      : 'text-[#FAF7F2]/60 hover:text-[#FAF7F2]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/#contact"
                className="px-5 py-2 bg-[#B8952A] text-[#FAF7F2] text-[11px] tracking-[0.1em] uppercase hover:bg-[#A47F22] transition-colors duration-300"
              >
                Book Now
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-[#FAF7F2]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-[#FAF7F2]/5">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-[13px] tracking-[0.1em] uppercase transition-colors duration-200 ${
                      isActive(link.path === '/' ? '/' : link.path.split('#')[0])
                        ? 'text-[#B8952A]'
                        : 'text-[#FAF7F2]/60 hover:text-[#FAF7F2]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-2.5 bg-[#B8952A] text-[#FAF7F2] text-[11px] tracking-[0.1em] uppercase hover:bg-[#A47F22] transition-colors duration-300 text-center"
                >
                  Book Now
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#2A2824] text-[#FAF7F2] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[18px] mb-4" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                Siam Journeys
              </h3>
              <p className="text-[#FAF7F2]/50 text-[13px] leading-relaxed">
                Curated cultural journeys through the soul of Bangkok. Family-owned since 2008.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.2em] uppercase text-[#B8952A] mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/tours" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">All Tours</Link></li>
                <li><Link to="/#about" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">About Us</Link></li>
                <li><Link to="/#safety" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Safety</Link></li>
                <li><Link to="/#contact" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.2em] uppercase text-[#B8952A] mb-4">Journeys</h4>
              <ul className="space-y-2">
                <li><Link to="/tours?category=morning" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Morning Tours</Link></li>
                <li><Link to="/tours?category=nightlife" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Nightlife Tours</Link></li>
                <li><Link to="/tours?category=cultural" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Cultural Tours</Link></li>
                <li><Link to="/tours?category=local_explore" className="text-[#FAF7F2]/50 hover:text-[#FAF7F2] text-[13px] transition-colors">Local Explore</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.2em] uppercase text-[#B8952A] mb-4">Contact</h4>
              <ul className="space-y-2 text-[13px] text-[#FAF7F2]/50">
                <li>hello@siamjourneys.com</li>
                <li>+66 2 123 4567</li>
                <li>Phra Nakhon, Bangkok</li>
                <li>Thailand 10200</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-[#FAF7F2]/10 text-center text-[12px] text-[#FAF7F2]/30">
            © {new Date().getFullYear()} Siam Journeys. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── NOT FOUND COMPONENT ─────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <p
          className="text-[clamp(4rem,10vw,7rem)] text-[#EDE5D0] leading-none select-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          404
        </p>
        <p className="text-[#7A6E60] mb-6 text-[15px]">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#2D4A3E] text-[#FAF7F2] text-[12px] tracking-[0.1em] uppercase hover:bg-[#243E33] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

// ─── ROUTER CONFIGURATION ────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "tours/:id", Component: TourDetail },
      { path: "tours", Component: TourList },
      { path: "booking", Component: BookingPage },
      { path: "booking-confirmation", Component: BookingConfirmation },
      { path: "*", Component: NotFound },
    ],
  },
]);