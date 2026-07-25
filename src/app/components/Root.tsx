// src/components/Root.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu, X, Instagram, Facebook, Youtube } from "lucide-react";

const SERIF = "'Playfair Display', Georgia, serif";

// ─── NAVIGATION LINKS ──────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Tours", href: "/tours" }, // 👈 ADDED Tours link
  { label: "Experiences", href: "/#experiences" },
  { label: "Available Tours", href: "/#tours" },
  { label: "Moving Classroom", href: "/#classroom" },
  { label: "Safety", href: "/#safety" },
  { label: "About Us", href: "/#about" },
];

function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Root() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const transparent = isHome && !scrolled;

  function handleNavClick(href: string) {
    setOpen(false);
    if (href.startsWith("/#")) {
      const hash = href.slice(1);
      if (isHome) {
        scrollToHash(hash);
      } else {
        navigate("/");
        setTimeout(() => scrollToHash(hash), 300);
      }
    } else {
      navigate(href);
    }
  }

  return (
    <div className="bg-background text-foreground overflow-x-hidden min-h-screen flex flex-col">
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          transparent
            ? "bg-transparent"
            : "bg-[#FAF7F2]/96 backdrop-blur-sm shadow-[0_1px_12px_rgba(42,40,36,0.08)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 xl:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <button
            className="flex flex-col leading-none select-none text-left"
            onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <span className="text-[20px] leading-snug" style={{ fontFamily: SERIF, color: transparent ? "#FAF7F2" : "#2D4A3E" }}>
              Siam Journeys
            </span>
            <span className="text-[9px] tracking-[0.28em] uppercase" style={{ color: transparent ? "rgba(250,247,242,0.5)" : "#B8952A" }}>
              Bangkok · Est. 2008
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={href}
                className={`text-[13px] tracking-wide transition-colors duration-200 hover:text-[#B8952A] ${
                  transparent ? "text-[#FAF7F2]/85" : "text-[#2A2824]"
                }`}
                onClick={() => handleNavClick(href)}
              >
                {label}
              </button>
            ))}
            <button
              className={`ml-2 px-5 py-2.5 text-[12px] tracking-[0.1em] uppercase border transition-all duration-250 ${
                transparent
                  ? "border-[#FAF7F2]/50 text-[#FAF7F2] hover:bg-[#FAF7F2] hover:text-[#2D4A3E]"
                  : "border-[#2D4A3E] text-[#2D4A3E] hover:bg-[#2D4A3E] hover:text-[#FAF7F2]"
              }`}
              onClick={() => handleNavClick("/#contact")}
            >
              Book a Journey
            </button>
          </nav>

          {/* Hamburger Menu */}
          <button className="lg:hidden p-1.5" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open
              ? <X size={22} color={transparent ? "#FAF7F2" : "#2A2824"} />
              : <Menu size={22} color={transparent ? "#FAF7F2" : "#2A2824"} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden bg-[#FAF7F2] border-t border-border px-6 pb-8">
            <nav className="flex flex-col pt-4 gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={href}
                  className="text-left py-3.5 text-sm text-[#2A2824] border-b border-border last:border-0 hover:text-[#2D4A3E] transition-colors"
                  onClick={() => handleNavClick(href)}
                >
                  {label}
                </button>
              ))}
              <button
                className="mt-4 py-3.5 bg-[#2D4A3E] text-[#FAF7F2] text-[12px] tracking-[0.1em] uppercase"
                onClick={() => handleNavClick("/#contact")}
              >
                Book a Journey
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#2A2824] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6 xl:px-12">
          <div className="grid md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="text-[22px] text-[#FAF7F2] mb-1" style={{ fontFamily: SERIF }}>
                Siam Journeys
              </p>
              <p className="text-[9px] tracking-[0.28em] uppercase text-[#B8952A] mb-5">
                Bangkok · Est. 2008
              </p>
              <p className="text-[#FAF7F2]/45 text-[13px] leading-relaxed max-w-[280px]">
                Curated cultural journeys through Bangkok for discerning travellers
                and world-class educational institutions.
              </p>
              <div className="flex gap-3 mt-7">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social"
                    className="w-8 h-8 border border-[#FAF7F2]/18 flex items-center justify-center text-[#FAF7F2]/45 hover:text-[#B8952A] hover:border-[#B8952A] transition-colors duration-200"
                  >
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links - Updated with Tours */}
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#B8952A] mb-5">Quick Links</p>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleNavClick("/tours")}
                    className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                  >
                    All Tours
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/#about")}
                    className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/#safety")}
                    className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                  >
                    Safety
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/#contact")}
                    className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Our Journeys */}
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#B8952A] mb-5">Our Journeys</p>
              <ul className="space-y-2.5">
                {[
                  "The Heritage Trail",
                  "The Moving Classroom",
                  "The Private Grand Tour",
                  "Group Experiences",
                  "School Programmes",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => handleNavClick("/#experiences")}
                      className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#B8952A] mb-5">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Our Story", href: "/#about" },
                  { label: "Safety Protocol", href: "/#safety" },
                  { label: "Gallery", href: "/#gallery" },
                  { label: "Contact Us", href: "/#contact" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => handleNavClick(href)}
                      className="text-[#FAF7F2]/42 text-[13px] hover:text-[#FAF7F2] transition-colors duration-200 text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-[#FAF7F2]/8 pt-8 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[#FAF7F2]/28 text-[11px]">
              © 2024 Siam Journeys Co., Ltd. · Tourism Authority of Thailand · TAT Licence No. 11/07418
            </p>
            <div className="flex flex-wrap gap-6">
              {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[#FAF7F2]/28 text-[11px] hover:text-[#FAF7F2]/55 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}