// TourDetail.tsx
// Pricing model: per-person adult/child rates, a group-rate threshold,
// a solo-private flat rate, and fixed-composition packages (couple/adventure/family).
// The booking UI never asks the customer to pick a "mode" — they just enter how many
// adults and children are coming, and getBestPrice() silently applies whichever
// pricing rule is cheapest (or the private rate, if they opt into it).
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Users, Star, Check, X, Shirt, Activity,
  UserCheck, List, Shield, ChevronDown, Phone, MapPin, Calendar as CalendarIcon,
} from "lucide-react";

import { TOURS } from "../data/tours";

const SERIF = "'Playfair Display', Georgia, serif";

// ============ TYPES ============
interface TourEssentials {
  dressCode: string;
  fitness: string;
  agePolicy: string;
  prep: string[];
}

// A single itinerary / meet-up stop. `stopMap` is the single source of truth
// for the Google Maps link — a full URL is used as-is, a plain address/place
// name is turned into a Maps search link automatically (see getMapLink).
interface ItineraryStop {
  time: string;
  title: string;
  description: string;
  stopMap: string;
}

// A fixed-composition bundle deal (Couple, Adventure, Family, etc).
// Price is a flat total, not per-person. Only becomes eligible when the
// customer's adult/child counts exactly match this composition.
interface PackageDef {
  key: string;
  label: string;
  price: number;
  adults: number;
  childrenMin: number;
  childrenMax: number;
}

interface TourPricing {
  priceAdult: number;        // per-adult rate, used below groupMin
  priceChild: number;        // per-child rate — only applies when adults > 0
  priceSoloPrivate: number;  // flat rate for 1 adult booking the whole vehicle
  priceGroup: number;        // per-adult rate once headcount hits groupMin
  groupMin: number;          // adult threshold where priceGroup kicks in
  packages: PackageDef[];    // fixed bundle deals
}

interface Tour {
  _id?: string;
  id: string;
  category: "morning" | "nightlife" | "cultural" | "local" | "full-day";
  featured?: boolean;
  name: string;
  tagline: string;
  duration: string;
  startTime: string;
  groupSize: string;
  pricing: TourPricing;
  rating: number;
  reviews: number;
  img: string;
  heroImg: string;
  galleryImgs: string[];
  badges: string[];
  description: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: ItineraryStop[];
  essentials: TourEssentials;
  metaDescription: string;
}

// ============ MAP LINK HELPER ============
function getMapLink(stopMap?: string): string | null {
  if (!stopMap) return null;
  if (/^https?:\/\//i.test(stopMap)) return stopMap;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stopMap)}`;
}

// ============ PRICING NORMALIZATION ============
// Accepts either the new explicit `pricing` object (preferred, snake_case or
// camelCase) or legacy flat fields (priceSingle/priceFam/priceGroup/groupMin)
// still present in some records, and always returns a complete TourPricing.
// Legacy records get sane derived defaults for priceChild/priceSoloPrivate —
// replace these with real values in your data as soon as you have them.
function normalizePricing(raw: any): TourPricing {
  if (raw.pricing) {
    const p = raw.pricing;
    return {
      priceAdult: p.priceAdult ?? p.price_adult ?? 0,
      priceChild: p.priceChild ?? p.price_child ?? 0,
      priceSoloPrivate: p.priceSoloPrivate ?? p.price_solo_private ?? 0,
      priceGroup: p.priceGroup ?? p.price_group ?? p.priceAdult ?? 0,
      groupMin: p.groupMin ?? p.group_min ?? 9,
      packages: (p.packages || []).map((pkg: any) => ({
        key: pkg.key,
        label: pkg.label,
        price: pkg.price,
        adults: pkg.adults,
        childrenMin: pkg.childrenMin ?? pkg.children_min ?? 0,
        childrenMax: pkg.childrenMax ?? pkg.children_max ?? 0,
      })),
    };
  }

  // ── Legacy fallback (priceSingle / priceFam / priceGroup / groupMin) ──
  const priceSingle = raw.priceSingle ?? raw.price_single ?? 0;
  const priceGroup = raw.priceGroup ?? raw.price_group ?? priceSingle;
  const groupMin = raw.groupMin ?? raw.group_min ?? 9;
  const priceFam = raw.priceFam ?? raw.price_fam ?? 0;

  return {
    priceAdult: priceSingle,
    priceChild: Math.round(priceSingle * 0.5),       // derived placeholder — replace with real data
    priceSoloPrivate: Math.round(priceSingle * 1.5),  // derived placeholder — replace with real data
    priceGroup,
    groupMin,
    packages: priceFam
      ? [{ key: "family", label: "Family Package", price: priceFam, adults: 2, childrenMin: 1, childrenMax: 2 }]
      : [],
  };
}

// ============ BEST-PRICE ENGINE ============
interface PriceResult {
  total: number;
  perAdult?: number;
  appliedLabel?: string;
  isPrivate?: boolean;
  listPrice: number;      // what this many adults/children would cost at standard rates
  savingsAmount: number;  // listPrice - total, floored at 0
  savingsPercent: number; // savingsAmount / listPrice * 100
}

// Reference "full price" for a given headcount at standard (non-discounted) rates.
// This is the baseline every discount — package or group rate — is measured against.
function listPriceFor(pricing: TourPricing, adults: number, children: number): number {
  return adults * pricing.priceAdult + children * pricing.priceChild;
}

// Discount badge info for a single package card, shown BEFORE the customer
// commits to it. Uses the package's own composition (childrenMax as the
// reference point for ranged packages) so the badge is stable and doesn't
// jump around as the customer types different guest counts elsewhere.
function packageSavings(pkg: PackageDef, pricing: TourPricing) {
  const referenceChildren = Math.max(pkg.childrenMin, pkg.childrenMax);
  const listPrice = pkg.adults * pricing.priceAdult + referenceChildren * pricing.priceChild;
  const amount = Math.max(0, listPrice - pkg.price);
  const percent = listPrice > 0 ? (amount / listPrice) * 100 : 0;
  return { listPrice, amount, percent };
}

function getBestPrice(pricing: TourPricing, adults: number, children: number, wantPrivate: boolean): PriceResult {
  const listPrice = listPriceFor(pricing, adults, children);

  if (wantPrivate && adults === 1 && children === 0) {
    return { total: pricing.priceSoloPrivate, isPrivate: true, listPrice, savingsAmount: 0, savingsPercent: 0 };
  }
  if (adults === 0) return { total: 0, listPrice: 0, savingsAmount: 0, savingsPercent: 0 };

  const perAdultRate = adults >= pricing.groupMin ? pricing.priceGroup : pricing.priceAdult;
  const options: PriceResult[] = [
    { total: adults * perAdultRate + children * pricing.priceChild, perAdult: perAdultRate, listPrice, savingsAmount: 0, savingsPercent: 0 },
  ];

  pricing.packages.forEach((p) => {
    if (adults === p.adults && children >= p.childrenMin && children <= p.childrenMax) {
      options.push({ total: p.price, appliedLabel: p.label, listPrice, savingsAmount: 0, savingsPercent: 0 });
    }
  });

  const best = options.reduce((b, o) => (o.total < b.total ? o : b));
  const savingsAmount = Math.max(0, listPrice - best.total);
  const savingsPercent = listPrice > 0 ? (savingsAmount / listPrice) * 100 : 0;
  return { ...best, savingsAmount, savingsPercent };
}

// ============ DATE STRIP + MONTH CALENDAR ============
function buildUpcomingDates(count: number, basePrice: number) {
  const out: { iso: string; label: string; day: string; price: number }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate().toString(),
      price: basePrice,
    });
  }
  return out;
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function MonthCalendar({
  selectedDate, minIso, onSelect,
}: { selectedDate: string; minIso: string; onSelect: (iso: string) => void }) {
  const initial = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date(minIso + "T00:00:00");
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const minDate = new Date(minIso + "T00:00:00");
  minDate.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  const goPrev = () => {
    if (!canGoPrev) return;
    setViewMonth(viewMonth === 0 ? 11 : viewMonth - 1);
    setViewYear(viewMonth === 0 ? viewYear - 1 : viewYear);
  };
  const goNext = () => {
    setViewMonth(viewMonth === 11 ? 0 : viewMonth + 1);
    setViewYear(viewMonth === 11 ? viewYear + 1 : viewYear);
  };

  const cells: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={goPrev} disabled={!canGoPrev} className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0] disabled:opacity-25 disabled:cursor-not-allowed transition-colors" aria-label="Previous month">
          <ChevronDown size={16} className="rotate-90" />
        </button>
        <p className="text-[14px] text-[#2A2824] font-medium" style={{ fontFamily: SERIF }}>
          {firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button type="button" onClick={goNext} className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0] transition-colors" aria-label="Next month">
          <ChevronDown size={16} className="-rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-[#7A6E60] py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toIso(date);
          const disabled = date < minDate;
          const isSelected = iso === selectedDate;
          const isToday = iso === toIso(new Date());
          return (
            <button
              type="button"
              key={iso}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={`aspect-square text-[13px] flex items-center justify-center transition-colors ${
                disabled ? "text-[#D8CBAE] cursor-not-allowed" : isSelected ? "bg-[#B8952A] text-[#FAF7F2] font-medium" : isToday ? "text-[#B8952A] font-medium hover:bg-[#EDE5D0]" : "text-[#2A2824] hover:bg-[#EDE5D0]"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateStrip({
  pricing, selectedDate, onSelect,
}: { pricing: TourPricing; selectedDate: string; onSelect: (iso: string) => void }) {
  const dates = useMemo(() => buildUpcomingDates(4, pricing.priceAdult), [pricing.priceAdult]);
  const [showCalendar, setShowCalendar] = useState(false);
  const isCustomDate = selectedDate && !dates.some((d) => d.iso === selectedDate);
  const minSelectable = dates[0]?.iso;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.16em] uppercase text-[#7A6E60]">
          <CalendarIcon size={11} className="inline mr-1" />
          Select Date
        </p>
        {isCustomDate && (
          <p className="text-[11px] text-[#B8952A]">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {dates.map((d) => {
          const active = d.iso === selectedDate;
          return (
            <button
              type="button"
              key={d.iso}
              onClick={() => onSelect(d.iso)}
              className={`text-center border px-2 py-2.5 transition-colors ${active ? "border-[#B8952A] bg-[#FCF6E8] text-[#B8952A]" : "border-border text-[#5A5248] hover:border-[#C8BBA6]"}`}
            >
              <p className="text-[11px]">{d.label}</p>
              <p className="text-[16px] font-medium leading-tight">{d.day}</p>
              <p className="text-[10px] mt-0.5">฿{d.price.toLocaleString()}</p>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className={`flex flex-col items-center justify-center gap-1 border px-2 py-2.5 transition-colors ${isCustomDate ? "border-[#B8952A] bg-[#FCF6E8] text-[#B8952A]" : "border-border text-[#5A5248] hover:border-[#C8BBA6]"}`}
        >
          {isCustomDate ? (
            <>
              <p className="text-[11px]">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</p>
              <p className="text-[16px] font-medium leading-tight">{new Date(selectedDate + "T00:00:00").getDate()}</p>
            </>
          ) : (
            <>
              <CalendarIcon size={16} />
              <span className="text-[11px]">All</span>
            </>
          )}
        </button>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCalendar(false)} />
          <div className="relative w-full max-w-[340px] bg-[#FFFDF8] border border-border p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-[#2A2824] font-medium" style={{ fontFamily: SERIF }}>Choose any date</p>
              <button onClick={() => setShowCalendar(false)} aria-label="Close" className="text-[#7A6E60] hover:text-[#2A2824]"><X size={16} /></button>
            </div>
            <MonthCalendar selectedDate={selectedDate} minIso={minSelectable} onSelect={(iso) => { onSelect(iso); setShowCalendar(false); }} />
            <p className="text-[11px] text-[#7A6E60] mt-4">Final price is calculated from who's coming, below.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ WHO'S COMING (adults / children + private toggle) ============
function WhosComing({
  pricing, adults, setAdults, children, setChildren, wantPrivate, setWantPrivate,
}: {
  pricing: TourPricing;
  adults: number; setAdults: (n: number) => void;
  children: number; setChildren: (n: number) => void;
  wantPrivate: boolean; setWantPrivate: (v: boolean) => void;
}) {
  const canGoPrivate = adults === 1 && children === 0;

  useEffect(() => {
    if (!canGoPrivate && wantPrivate) setWantPrivate(false);
  }, [canGoPrivate, wantPrivate, setWantPrivate]);

  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] uppercase text-[#7A6E60] mb-2">
        <Users size={11} className="inline mr-1" />
        Who's Coming
      </p>
      <div className="border border-border divide-y divide-border">
        <div className="flex items-center justify-between px-3 py-3">
          <div>
            <p className="text-[13px] text-[#2A2824] font-medium">Adults</p>
            <p className="text-[11px] text-[#7A6E60]">฿{pricing.priceAdult.toLocaleString()}/person · ฿{pricing.priceGroup.toLocaleString()} at {pricing.groupMin}+</p>
          </div>
          <div className="flex items-center border border-border flex-shrink-0">
            <button type="button" className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0] disabled:opacity-30" disabled={adults === 0} onClick={() => setAdults(Math.max(0, adults - 1))}>–</button>
            <span className="w-8 text-center text-[13px] text-[#2A2824] font-medium">{adults}</span>
            <button type="button" className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0]" onClick={() => setAdults(adults + 1)}>+</button>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-3">
          <div>
            <p className={`text-[13px] font-medium ${adults === 0 ? "text-[#B4B2A9]" : "text-[#2A2824]"}`}>Children</p>
            <p className="text-[11px] text-[#7A6E60]">{adults === 0 ? "Add an adult first" : `฿${pricing.priceChild.toLocaleString()}/child`}</p>
          </div>
          <div className="flex items-center border border-border flex-shrink-0">
            <button type="button" className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0] disabled:opacity-30" disabled={adults === 0 || children === 0} onClick={() => setChildren(Math.max(0, children - 1))}>–</button>
            <span className="w-8 text-center text-[13px] text-[#2A2824] font-medium">{children}</span>
            <button type="button" className="w-8 h-8 flex items-center justify-center text-[#2A2824] hover:bg-[#EDE5D0] disabled:opacity-30" disabled={adults === 0} onClick={() => setChildren(children + 1)}>+</button>
          </div>
        </div>
      </div>

      {canGoPrivate && (
        <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
          <input type="checkbox" checked={wantPrivate} onChange={(e) => setWantPrivate(e.target.checked)} className="w-4 h-4 accent-[#B8952A]" />
          <span className="text-[12px] text-[#5A5248]">
            Just me — reserve the whole vehicle privately (฿{pricing.priceSoloPrivate.toLocaleString()})
          </span>
        </label>
      )}
    </div>
  );
}

// ============ PACKAGE DEALS (visible discount badges, tap to apply) ============
function PackageDeals({
  pricing, adults, children, wantPrivate, onSelect,
}: {
  pricing: TourPricing;
  adults: number; children: number; wantPrivate: boolean;
  onSelect: (adults: number, children: number) => void;
}) {
  if (pricing.packages.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] uppercase text-[#7A6E60] mb-2">Package Deals</p>
      <div className="grid grid-cols-1 gap-2">
        {pricing.packages.map((pkg) => {
          const { percent, amount } = packageSavings(pkg, pricing);
          const composition = pkg.childrenMax > 0
            ? `${pkg.adults} adults + ${pkg.childrenMin === pkg.childrenMax ? pkg.childrenMax : `${pkg.childrenMin}-${pkg.childrenMax}`} children`
            : `${pkg.adults} adults`;
          const isActive = !wantPrivate && adults === pkg.adults && children >= pkg.childrenMin && children <= pkg.childrenMax;

          return (
            <button
              type="button"
              key={pkg.key}
              onClick={() => onSelect(pkg.adults, pkg.childrenMax)}
              className={`text-left border px-3 py-2.5 transition-colors ${isActive ? "border-[#B8952A] bg-[#FCF6E8]" : "border-border hover:border-[#C8BBA6]"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-[#2A2824] font-medium">{pkg.label}</p>
                {percent > 0 && (
                  <span className="text-[10px] tracking-[0.06em] uppercase font-medium px-1.5 py-0.5 bg-[#EAF3DE] text-[#27500A] flex-shrink-0">
                    Save {percent.toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[11px] text-[#7A6E60]">{composition}</p>
                <p className="text-[12px] text-[#2A2824] font-medium">฿{pkg.price.toLocaleString()}</p>
              </div>
              {amount > 0 && <p className="text-[10px] text-[#3B6D11] mt-0.5">You save ฿{amount.toLocaleString()} vs. per-person pricing</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ SHARED BOOKING FORM ============
interface BookingFormProps {
  pricing: TourPricing;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  adults: number; setAdults: (n: number) => void;
  children: number; setChildren: (n: number) => void;
  wantPrivate: boolean; setWantPrivate: (v: boolean) => void;
  priceResult: PriceResult;
  onBookNow: () => void;
  bookButtonLabel?: string;
}

function BookingForm({
  pricing, selectedDate, setSelectedDate,
  adults, setAdults, children, setChildren,
  wantPrivate, setWantPrivate, priceResult,
  onBookNow, bookButtonLabel = "Book Now",
}: BookingFormProps) {
  const totalGuests = adults + children;

  return (
    <>
      <div className="space-y-5 mb-5">
        <DateStrip pricing={pricing} selectedDate={selectedDate} onSelect={setSelectedDate} />
        <WhosComing
          pricing={pricing}
          adults={adults} setAdults={setAdults}
          children={children} setChildren={setChildren}
          wantPrivate={wantPrivate} setWantPrivate={setWantPrivate}
        />
        <PackageDeals
          pricing={pricing}
          adults={adults} children={children} wantPrivate={wantPrivate}
          onSelect={(a, c) => { setWantPrivate(false); setAdults(a); setChildren(c); }}
        />
      </div>

      {priceResult.appliedLabel && (
        <div className="mb-3 px-3 py-2 bg-[#EAF3DE] border border-[#C0DD97]">
          <p className="text-[12px] text-[#27500A] font-medium">{priceResult.appliedLabel} applied</p>
          {priceResult.savingsAmount > 0 && (
            <p className="text-[11px] text-[#3B6D11]">
              You saved ฿{priceResult.savingsAmount.toLocaleString()} ({priceResult.savingsPercent.toFixed(1)}% off list price)
            </p>
          )}
        </div>
      )}
      {!priceResult.appliedLabel && priceResult.savingsAmount > 0 && (
        <div className="mb-3 px-3 py-2 bg-[#EAF3DE] border border-[#C0DD97]">
          <p className="text-[12px] text-[#27500A] font-medium">Group rate applied</p>
          <p className="text-[11px] text-[#3B6D11]">
            You saved ฿{priceResult.savingsAmount.toLocaleString()} ({priceResult.savingsPercent.toFixed(1)}% off list price)
          </p>
        </div>
      )}
      {priceResult.isPrivate && (
        <div className="mb-3 px-3 py-2 bg-[#EDE5D0]">
          <p className="text-[12px] text-[#2D4A3E] font-medium">Private booking — whole vehicle reserved</p>
        </div>
      )}

      <div className="mb-5 p-3 bg-[#EDE5D0] flex justify-between items-baseline">
        <span className="text-[13px] text-[#5A5248]">Total · {totalGuests} {totalGuests === 1 ? "guest" : "guests"}</span>
        <span className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF }}>฿{priceResult.total.toLocaleString()}</span>
      </div>

      <button
        type="button"
        className="w-full py-4 bg-[#B8952A] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors duration-300 font-medium disabled:opacity-40"
        disabled={!selectedDate || totalGuests === 0}
        onClick={onBookNow}
      >
        {bookButtonLabel}
      </button>

      <p className="text-center text-[11px] text-[#7A6E60] mt-3">No payment today · Free cancellation 14 days prior</p>
    </>
  );
}

// ============ ITINERARY STOP (with Google Maps link) ============
function ItineraryStopRow({ stop, isOpen, onToggle }: { stop: ItineraryStop; isOpen: boolean; onToggle: () => void }) {
  const mapLink = getMapLink(stop.stopMap);

  return (
    <div className="py-4">
      <button className="w-full flex items-center justify-between gap-4 text-left group" onClick={onToggle}>
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-[11px] tracking-[0.16em] text-[#B8952A] w-[68px] flex-shrink-0">{stop.time || "—"}</span>
          <span className="text-[15px] text-[#2A2824] group-hover:text-[#2D4A3E] transition-colors truncate" style={{ fontFamily: SERIF }}>{stop.title || "Tour Stop"}</span>
        </div>
        <ChevronDown size={15} className={`flex-shrink-0 text-[#B8952A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-3 ml-[calc(68px+1rem)] pr-6 space-y-2">
          <p className="text-[14px] text-[#5A5248] leading-relaxed">{stop.description || "Details coming soon..."}</p>
          {mapLink && (
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[#2D4A3E] hover:text-[#B8952A] transition-colors underline underline-offset-2">
              <MapPin size={12} />
              Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [openItinerary, setOpenItinerary] = useState<number | null>(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [wantPrivate, setWantPrivate] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  const getFallbackTour = (tourId: string): Tour | null => {
    const foundTour = TOURS.find((t: any) => t.id === tourId || t._id === tourId);
    if (!foundTour) return null;

    return {
      _id: foundTour.id,
      id: foundTour.id,
      category: foundTour.category || "cultural",
      featured: foundTour.featured || false,
      name: foundTour.name || "Unnamed Tour",
      tagline: foundTour.tagline || "",
      duration: foundTour.duration || "3 hours",
      startTime: foundTour.startTime || "09:00",
      groupSize: foundTour.groupSize || "2-12 people",
      pricing: normalizePricing(foundTour),
      rating: foundTour.rating || 4.5,
      reviews: foundTour.reviews || 0,
      img: foundTour.img || foundTour.heroImg || "",
      heroImg: foundTour.heroImg || foundTour.img || "",
      galleryImgs: foundTour.galleryImgs || [],
      badges: foundTour.badges || [],
      description: foundTour.description || foundTour.tagline || "",
      highlights: foundTour.highlights || [],
      included: foundTour.included || [],
      notIncluded: foundTour.notIncluded || [],
      itinerary: (foundTour.itinerary || []).map((s: any) => ({
        time: s.time || "",
        title: s.title || "Tour Stop",
        description: s.description || "",
        stopMap: s.stopMap || s.title || "",
      })),
      essentials: {
        dressCode: foundTour.essentials?.dressCode || "Smart casual. Please cover shoulders and knees for temple visits.",
        fitness: foundTour.essentials?.fitness || "Moderate. Some walking and navigating steps.",
        agePolicy: foundTour.essentials?.agePolicy || "All ages welcome. Children under 12 must be accompanied by an adult.",
        prep: foundTour.essentials?.prep || ["Comfortable shoes", "Sunscreen", "Camera"],
      },
      metaDescription: foundTour.metaDescription || foundTour.tagline || `Experience ${foundTour.name} with Siam Journeys Bangkok.`,
    };
  };

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);

        const API_URL = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:5001");
        const response = await fetch(`${API_URL}/api/tour-templates/${id}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Tour not found - checking local data");
          throw new Error(`Failed to fetch tour: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          const tourData = result.data;
          const mappedTour: Tour = {
            _id: tourData._id,
            id: tourData._id,
            category: tourData.category || "cultural",
            featured: tourData.featured || false,
            name: tourData.name || "Unnamed Tour",
            tagline: tourData.tagline || "",
            duration: tourData.duration || `${tourData.default_duration_minutes || 180} min`,
            startTime: tourData.start_time || "09:00",
            groupSize: tourData.group_size || `${tourData.group_min || 2}+ people`,
            pricing: normalizePricing(tourData),
            rating: tourData.rating || 4.5,
            reviews: tourData.reviews || 0,
            img: tourData.hero_img || "",
            heroImg: tourData.hero_img || "",
            galleryImgs: tourData.gallery_imgs || [],
            badges: tourData.badges || [],
            description: tourData.description || "",
            highlights: tourData.highlights || [],
            included: tourData.included || [],
            notIncluded: tourData.not_included || [],
            itinerary: (tourData.itinerary || []).map((s: any) => ({
              time: s.time || "",
              title: s.title || "Tour Stop",
              description: s.description || "",
              stopMap: s.stop_map || s.stopMap || s.title || "",
            })),
            essentials: {
              dressCode: tourData.dress_code || "Smart casual. Please cover shoulders and knees for temple visits.",
              fitness: tourData.fitness || "Moderate. Some walking and navigating steps.",
              agePolicy: tourData.age_policy || "All ages welcome. Children under 12 must be accompanied by an adult.",
              prep: tourData.prep || ["Comfortable shoes", "Sunscreen", "Camera"],
            },
            metaDescription: tourData.tagline || `Experience ${tourData.name} with Siam Journeys Bangkok.`,
          };
          setTour(mappedTour);
          document.title = `${mappedTour.name} | Siam Journeys Bangkok`;
        } else {
          throw new Error("Tour data not found");
        }
      } catch (err) {
        console.error("Error fetching tour:", err);
        const fallbackTour = getFallbackTour(id);
        if (fallbackTour) {
          setTour(fallbackTour);
          setUsingFallback(true);
          setError(null);
          document.title = `${fallbackTour.name} | Siam Journeys Bangkok`;
        } else {
          setError(err instanceof Error ? err.message : "Tour not found");
          setTour(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (!tour) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8952A] mx-auto"></div>
            <p className="text-[#7A6E60] mt-4">Loading tour...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md px-6">
          <p className="text-[#7A6E60] mb-4">{error || "Tour not found."}</p>
          <button className="text-[#2D4A3E] text-sm underline hover:text-[#B8952A] transition-colors" onClick={() => navigate("/")}>Return home</button>
        </div>
      </div>
    );
  }

  const priceResult = getBestPrice(tour.pricing, adults, childrenCount, wantPrivate);

  const essentialItems = [
    { icon: Shirt, label: "Dress Code", value: tour.essentials.dressCode },
    { icon: Activity, label: "Fitness Level", value: tour.essentials.fitness },
    { icon: UserCheck, label: "Age Policy", value: tour.essentials.agePolicy },
    { icon: List, label: "What to Bring", value: tour.essentials.prep.join(" · ") },
    { icon: Shield, label: "Guide Contact", value: "Activated in your booking confirmation. Your guide's direct number is sent 24 hours before departure." },
  ];

  const handleBookNow = () => {
    if (!selectedDate) { alert("Please select a date."); return; }
    if (adults + childrenCount === 0) { alert("Please add at least one guest."); return; }

    const bookingData = {
      tourId: tour.id,
      tourName: tour.name,
      date: selectedDate,
      adults,
      children: childrenCount,
      guests: adults + childrenCount,
      isPrivate: !!priceResult.isPrivate,
      appliedPackage: priceResult.appliedLabel || null,
      totalPrice: priceResult.total,

      tourDescription: tour.description,
      tourHighlights: tour.highlights,
      tourIncluded: tour.included,
      tourNotIncluded: tour.notIncluded,
      tourItinerary: tour.itinerary,
      tourEssentials: tour.essentials,
      tourDuration: tour.duration,
      tourStartTime: tour.startTime,
    };

    setShowMobileBooking(false);
    navigate("/booking", { state: bookingData });
  };

  const bookingFormProps: BookingFormProps = {
    pricing: tour.pricing, selectedDate, setSelectedDate,
    adults, setAdults, children: childrenCount, setChildren: setChildrenCount,
    wantPrivate, setWantPrivate, priceResult,
    onBookNow: handleBookNow,
  };

  return (
    <>
      <title>{tour.name} | Siam Journeys Bangkok</title>
      <meta name="description" content={tour.metaDescription} />
      <meta property="og:title" content={`${tour.name} | Siam Journeys Bangkok`} />
      <meta property="og:description" content={tour.metaDescription} />
      <meta property="og:image" content={tour.heroImg} />
      <meta property="og:url" content={`https://siamjourneys.com/tour/${tour.id}`} />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-[#2A2824]" style={{ height: "clamp(320px, 45vw, 560px)" }}>
        <img
          src={tour.heroImg}
          alt={`${tour.name} — Bangkok tuk-tuk tour`}
          className="w-full h-full object-cover opacity-65"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?w=1200&h=600&fit=crop&auto=format"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
        <button className="absolute top-24 left-6 xl:left-12 flex items-center gap-2 text-[#FAF7F2]/70 hover:text-[#FAF7F2] transition-colors text-[13px] tracking-wide group" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          All Tours
        </button>
        <div className="absolute bottom-0 inset-x-0 p-6 xl:px-12 pb-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-[clamp(1.8rem,4vw,3rem)] text-[#FAF7F2] mt-3 mb-2 leading-tight" style={{ fontFamily: SERIF, fontWeight: 400 }}>{tour.name}</h1>
            <p className="text-[#FAF7F2]/70 text-[15px] max-w-xl">{tour.tagline}</p>
            {usingFallback && <p className="text-[11px] text-[#B8952A] mt-2 italic">⚡ Using sample tour data (offline mode)</p>}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          <div className="space-y-12">
            <div className="flex flex-wrap gap-6 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(tour.rating) ? "fill-[#B8952A] text-[#B8952A]" : "text-[#C8BBA6]"} />
                  ))}
                </div>
                <span className="text-[13px] text-[#7A6E60]">{tour.rating} · {tour.reviews} reviews</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#5A5248]"><Clock size={14} className="text-[#B8952A]" />{tour.duration} · Starts {tour.startTime}</div>
              <div className="flex items-center gap-2 text-[13px] text-[#5A5248]"><Users size={14} className="text-[#B8952A]" />{tour.groupSize}</div>
            </div>

            <section>
              <h2 className="text-[22px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF, fontWeight: 400 }}>About This Journey</h2>
              <p className="text-[15px] text-[#5A5248] leading-relaxed">{tour.description}</p>
            </section>

            <section>
              <h2 className="text-[22px] text-[#2A2824] mb-5" style={{ fontFamily: SERIF, fontWeight: 400 }}>What You Will Experience</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <span className="mt-[5px] w-3.5 h-3.5 rounded-full border border-[#B8952A] flex items-center justify-center flex-shrink-0"><span className="w-1 h-1 rounded-full bg-[#B8952A]" /></span>
                    <span className="text-[14px] text-[#5A5248]">{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[22px] text-[#2A2824] mb-5" style={{ fontFamily: SERIF, fontWeight: 400 }}>Itinerary</h2>
              <div className="divide-y divide-border">
                {tour.itinerary.map((stop, i) => (
                  <ItineraryStopRow key={i} stop={stop} isOpen={openItinerary === i} onToggle={() => setOpenItinerary(openItinerary === i ? null : i)} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[22px] text-[#2A2824] mb-6" style={{ fontFamily: SERIF, fontWeight: 400 }}>What's Included</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[#2D4A3E] mb-4 font-medium">Included</p>
                  <ul className="space-y-2.5">
                    {tour.included.map((item) => (
                      <li key={item} className="flex items-start gap-2.5"><Check size={14} className="text-[#2D4A3E] mt-0.5 flex-shrink-0" /><span className="text-[14px] text-[#5A5248]">{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A6E60] mb-4 font-medium">Not Included</p>
                  <ul className="space-y-2.5">
                    {tour.notIncluded.map((item) => (
                      <li key={item} className="flex items-start gap-2.5"><X size={14} className="text-[#C4714A] mt-0.5 flex-shrink-0" /><span className="text-[14px] text-[#5A5248]">{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {tour.galleryImgs.length > 0 && (
              <section>
                <h2 className="text-[22px] text-[#2A2824] mb-5" style={{ fontFamily: SERIF, fontWeight: 400 }}>Gallery</h2>
                <div className={`grid gap-3 ${tour.galleryImgs.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
                  {tour.galleryImgs.map((src, i) => (
                    <div key={i} className={`overflow-hidden group bg-[#C8BBA6] ${i === 0 && tour.galleryImgs.length >= 3 ? "sm:col-span-2 sm:row-span-2" : ""}`} style={{ aspectRatio: i === 0 && tour.galleryImgs.length >= 3 ? "1/1" : "4/3" }}>
                      <img src={src} alt={`${tour.name} gallery image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?w=600&h=400&fit=crop&auto=format"; }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="essentials" className="bg-[#EDE5D0] p-8">
              <h2 className="text-[20px] text-[#2A2824] mb-6" style={{ fontFamily: SERIF, fontWeight: 400 }}>Tour Essentials</h2>
              <div className="space-y-5">
                {essentialItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#2D4A3E] flex items-center justify-center flex-shrink-0 mt-0.5"><Icon size={14} className="text-[#FAF7F2]" /></div>
                    <div>
                      <p className="text-[11px] tracking-[0.16em] uppercase text-[#B8952A] mb-1 font-medium">{label}</p>
                      <p className="text-[14px] text-[#5A5248] leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT — sticky sidebar (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="bg-[#FFFDF8] border border-border shadow-sm p-6">
                <div className="mb-5 pb-5 border-b border-border">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A6E60] mb-1">From</p>
                  <p className="text-[32px] text-[#2A2824] leading-none" style={{ fontFamily: SERIF }}>฿{tour.pricing.priceAdult.toLocaleString()}</p>
                  <p className="text-[13px] text-[#7A6E60] mt-1">per person</p>
                </div>
                <BookingForm {...bookingFormProps} />
              </div>

              <div className="border border-border p-5 flex items-start gap-3">
                <Phone size={15} className="text-[#B8952A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-medium text-[#2A2824]">Need help choosing?</p>
                  <p className="text-[12px] text-[#7A6E60] mt-0.5">Our team responds within 2 hours.</p>
                  <a href="tel:+66924759669" className="text-[12px] text-[#2D4A3E] hover:text-[#B8952A] transition-colors mt-1 block">+6692 475 9669</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE sticky Book Now bar ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2] border-t border-border px-6 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(42,40,36,0.1)]">
        <div>
          <p className="text-[11px] text-[#7A6E60] tracking-wide">From</p>
          <p className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF }}>฿{tour.pricing.priceAdult.toLocaleString()}</p>
          <p className="text-[11px] text-[#7A6E60]">per person</p>
        </div>
        <button className="flex-1 max-w-[200px] py-3.5 bg-[#B8952A] text-[#FAF7F2] text-[12px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors" onClick={() => setShowMobileBooking(true)}>Book Now</button>
      </div>
      <div className="lg:hidden h-24" />

      {/* ── MOBILE booking bottom sheet ── */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileBooking(false)} />
          <div className="relative w-full max-h-[88vh] overflow-y-auto bg-[#FFFDF8] rounded-t-2xl px-6 pt-5 pb-8 shadow-[0_-8px_30px_rgba(42,40,36,0.25)]">
            <div className="w-10 h-1 bg-[#C8BBA6] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] text-[#2A2824]" style={{ fontFamily: SERIF }}>Book Your Tour</h3>
              <button className="w-8 h-8 flex items-center justify-center text-[#7A6E60] hover:text-[#2A2824]" onClick={() => setShowMobileBooking(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="mb-5 pb-5 border-b border-border">
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#7A6E60] mb-1">From</p>
              <p className="text-[28px] text-[#2A2824] leading-none" style={{ fontFamily: SERIF }}>฿{tour.pricing.priceAdult.toLocaleString()}</p>
              <p className="text-[13px] text-[#7A6E60] mt-1">per person</p>
            </div>
            <BookingForm {...bookingFormProps} bookButtonLabel="Confirm & Continue" />
          </div>
        </div>
      )}
    </>
  );
}