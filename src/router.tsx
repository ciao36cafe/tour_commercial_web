// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Root } from "./app/components/Root";    // ← app/ is inside src/
import { Home } from "./app/pages/Home";          // ← app/ is inside src/
import { TourDetail } from "./app/pages/TourDetail";
import { BookingPage } from "./app/pages/BookingPage";
import { BookingConfirmation } from "./app/pages/BookingConfirmation";
import { TourList } from "./app/pages/TourList";

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
        <a
          href="/"
          className="inline-block px-8 py-3 bg-[#2D4A3E] text-[#FAF7F2] text-[12px] tracking-[0.1em] uppercase hover:bg-[#243E33] transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

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