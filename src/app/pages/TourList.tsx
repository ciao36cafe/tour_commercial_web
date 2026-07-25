// TourList.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

const SERIF = "'Playfair Display', Georgia, serif";

// ============ TYPES ============
interface TourTemplate {
  _id: string;
  id?: string; // Added for compatibility
  name: string;
  description: string;
  tagline: string;
  category: string;
  duration: string;
  start_time: string;
  group_size: string;
  group_min: number;
  price_single: number;
  price_group: number;
  rating: number;
  reviews: number;
  hero_img: string;
  badges: string[];
  is_active: boolean;
  default_duration_minutes?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============ COMPONENTS ============
function CategoryFilter({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: string[]; 
  selected: string | null; 
  onSelect: (category: string | null) => void;
}) {
  const categoryLabels: Record<string, string> = {
    morning: "Morning",
    nightlife: "Nightlife",
    cultural: "Cultural",
    local: "Local Explore",
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 text-[12px] tracking-[0.12em] uppercase transition-colors ${
          selected === null
            ? "bg-[#B8952A] text-[#FAF7F2]"
            : "bg-[#EDE5D0] text-[#5A5248] hover:bg-[#D4C9B5]"
        }`}
      >
        All Tours
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 text-[12px] tracking-[0.12em] uppercase transition-colors ${
            selected === cat
              ? "bg-[#B8952A] text-[#FAF7F2]"
              : "bg-[#EDE5D0] text-[#5A5248] hover:bg-[#D4C9B5]"
          }`}
        >
          {categoryLabels[cat] || cat}
        </button>
      ))}
    </div>
  );
}

function TourCard({ tour }: { tour: TourTemplate }) {
  const navigate = useNavigate();

  // Use _id or id for navigation
  const tourId = tour._id || tour.id;

  return (
    <div 
      className="group bg-[#FFFDF8] border border-border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/tours/${tourId}`)} // Changed from /tour/ to /tours/
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#C8BBA6]" style={{ aspectRatio: "16/10" }}>
        <img
          src={tour.hero_img || "/images/tour-placeholder.jpg"}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/tour-placeholder.jpg";
          }}
        />
        
        {/* Badges overlay */}
        {tour.badges && tour.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {tour.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="bg-[#2A2824]/75 backdrop-blur-sm text-[#FAF7F2] text-[9px] tracking-[0.12em] uppercase px-2.5 py-1"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Category tag */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-[#B8952A] text-[#FAF7F2] text-[9px] tracking-[0.16em] uppercase px-3 py-1">
            {tour.category}
          </span>
        </div>

        {/* Rating overlay */}
        <div className="absolute top-3 right-3 bg-[#2A2824]/75 backdrop-blur-sm px-2 py-1 flex items-center gap-1">
          <Star size={12} className="fill-[#B8952A] text-[#B8952A]" />
          <span className="text-[#FAF7F2] text-[12px] font-medium">{tour.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 
          className="text-[18px] text-[#2A2824] leading-tight line-clamp-2"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {tour.name}
        </h3>

        {/* Tagline */}
        <p className="text-[13px] text-[#7A6E60] line-clamp-2">{tour.tagline || tour.description?.substring(0, 100)}</p>

        {/* Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[12px] text-[#5A5248]">
            <Clock size={13} className="text-[#B8952A]" />
            {tour.duration || `${tour.default_duration_minutes || 180} min`}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#5A5248]">
            <Users size={13} className="text-[#B8952A]" />
            {tour.group_size || `${tour.group_min || 2}+ people`}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between pt-2 border-t border-border">
          <div>
            <span className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF }}>
              ฿{tour.price_single?.toLocaleString() || "0"}
            </span>
            <span className="text-[12px] text-[#7A6E60] ml-1">/ person</span>
            {tour.price_group && tour.price_group < tour.price_single && (
              <p className="text-[11px] text-[#2D4A3E]">
                Groups {tour.group_min}+: ฿{tour.price_group.toLocaleString()}
              </p>
            )}
          </div>
          <button 
            className="flex items-center gap-1 text-[11px] tracking-[0.12em] uppercase text-[#B8952A] hover:text-[#A47F22] transition-colors group-hover:gap-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tours/${tourId}`); // Changed from /tour/ to /tours/
            }}
          >
            View Details
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export function TourList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [tours, setTours] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ""
  );
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );

  // ============ FETCH TOURS ============
  const fetchTours = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (showActiveOnly) {
        params.append('active', 'true');
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      setSearchParams(params);
      
      const response = await fetch(`${API_URL}/api/tour-templates?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tours: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTours(result.data);
        setPagination(result.pagination);
        
        if (result.categories) {
          setCategories(result.categories);
        } else {
          const uniqueCategories = [...new Set(result.data.map((t: TourTemplate) => t.category))].filter(Boolean);
          setCategories(uniqueCategories);
        }
        
        setCurrentPage(page);
      } else {
        throw new Error(result.error || 'Failed to fetch tours');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tours');
      console.error('Error fetching tours:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============ EFFECTS ============
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    fetchTours(page);
  }, [selectedCategory, showActiveOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || searchQuery === '') {
        fetchTours(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============ HANDLERS ============
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchTours(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTours(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // ============ RENDER ============
  return (
    <>
      <title>Explore Our Tours | Siam Journeys Bangkok</title>
      <meta name="description" content="Discover authentic Bangkok experiences with our curated tours. Book your adventure today." />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-[#2A2824]" style={{ height: "clamp(200px, 25vw, 320px)" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A2824] to-[#3D3A35]">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #B8952A 0%, transparent 60%)'
          }} />
        </div>
        
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center max-w-2xl">
            <div className="flex items-center justify-center gap-2 text-[#B8952A] mb-3">
              <Sparkles size={20} />
              <span className="text-[11px] tracking-[0.2em] uppercase">Discover</span>
              <Sparkles size={20} />
            </div>
            <h1 
              className="text-[clamp(2rem,4.5vw,3.5rem)] text-[#FAF7F2] leading-tight"
              style={{ fontFamily: SERIF, fontWeight: 400 }}
            >
              Explore Bangkok Your Way
            </h1>
            <p className="text-[#FAF7F2]/70 text-[15px] mt-2">
              Discover authentic experiences with our curated tours
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-12">
        {/* Search & Filters */}
        <div className="mb-10 space-y-5">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6E60]" />
              <input
                type="text"
                placeholder="Search tours by name, description, or badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border pl-10 pr-4 py-3 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-[#FFFDF8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6E60] hover:text-[#2A2824] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#B8952A] text-[#FAF7F2] text-[12px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] text-[#7A6E60]">
              <Filter size={14} />
              <span className="uppercase tracking-[0.12em]">Category:</span>
            </div>
            <CategoryFilter 
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
            
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 text-[12px] text-[#5A5248] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#B8952A]"
                />
                Active tours only
              </label>
            </div>
          </div>

          {/* Results count & filters indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#7A6E60] pt-2 border-t border-border">
            <span>
              {loading ? "Loading..." : `${tours.length} tour${tours.length !== 1 ? 's' : ''} found`}
              {selectedCategory && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            <div className="flex items-center gap-3">
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-[#B8952A] hover:text-[#A47F22] transition-colors uppercase tracking-[0.12em]"
                >
                  Clear filters
                </button>
              )}
              {pagination.pages > 1 && (
                <span>Page {currentPage} of {pagination.pages}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── TOURS GRID ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8952A] mx-auto"></div>
              <p className="text-[#7A6E60] mt-4">Loading tours...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[#7A6E60] mb-4">{error}</p>
            <button
              className="text-[#B8952A] text-sm underline hover:text-[#A47F22] transition-colors"
              onClick={() => fetchTours(currentPage)}
            >
              Try again
            </button>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#7A6E60] text-[16px]">No tours found matching your criteria.</p>
            <button
              className="mt-4 text-[#B8952A] text-sm underline hover:text-[#A47F22] transition-colors"
              onClick={clearFilters}
            >
              View all tours
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour._id || tour.id} tour={tour} />
              ))}
            </div>

            {/* ── PAGINATION ── */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition-colors ${
                    currentPage <= 1
                      ? "text-[#C8BBA6] cursor-not-allowed"
                      : "text-[#2A2824] hover:bg-[#EDE5D0]"
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 text-[13px] transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#B8952A] text-[#FAF7F2]"
                          : "text-[#2A2824] hover:bg-[#EDE5D0]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className={`px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition-colors ${
                    currentPage >= pagination.pages
                      ? "text-[#C8BBA6] cursor-not-allowed"
                      : "text-[#2A2824] hover:bg-[#EDE5D0]"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}