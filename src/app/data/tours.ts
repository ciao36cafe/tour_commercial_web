export type Category = "morning" | "nightlife" | "cultural" | "local" | "full-day";

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
}

export interface TourEssentials {
  dressCode: string;
  fitness: string;
  agePolicy: string;
  prep: string[];
}

export interface Tour {
  id: string;
  category: Category;
  featured?: boolean;
  name: string;
  tagline: string;
  duration: string;
  startTime: string;
  groupSize: string;
  // Removed: priceSingle, priceFam, priceGroup, groupMin
  pricing: {
    priceAdult: number;
    priceChild: number;
    priceSoloPrivate: number;
    priceGroup: number;
    groupMin: number;
    packages: {
      key: string;
      label: string;
      price: number;
      adults: number;
      childrenMin: number;
      childrenMax: number;
    }[];
  };
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
  itinerary: ItineraryItem[];
  essentials: TourEssentials;
  metaDescription: string;
}

export const TOURS: Tour[] = [
  {
    id: "into-the-thai-culture",
    category: "cultural",
    featured: true,
    name: "Into the Thai Culture",
    tagline: "An immersive full-day journey through Bangkok's spiritual and culinary heart",
    duration: "8 Hours",
    startTime: "7:30 AM",
    groupSize: "Max 12 guests",
    pricing: {
        priceAdult: 1599,
        priceChild: 799,
        priceSoloPrivate: 3200,
        priceGroup: 1399,
        groupMin: 10,
        packages: [
            {
                key: "family",
                label: "Family Package",
                price: 3250,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Comfort Package",
                price: 2900,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Adventure Package",
                price: 3799,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    },
    rating: 4.9,
    reviews: 284,
    img: "https://images.unsplash.com/photo-1776941452020-822b4901446b?w=800&h=520&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?w=1600&h=700&fit=crop&auto=format",
    galleryImgs: [
        "https://images.unsplash.com/photo-1776941452020-822b4901446b?w=600&h=420&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1678263001211-b1c2f231b5e7?w=600&h=420&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1769848754718-be02141c6cc3?w=600&h=420&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=420&fit=crop&auto=format"
    ],
    badges: ["Expert Guide", "Public Transport Logistics", "Small Group Policy"],
    metaDescription: "Experience Bangkok's living culture on our flagship 8-hour tuk-tuk journey — temples, markets, and authentic cuisine. From 1,599 THB per person. Groups of 10+ from 1,399 THB.",
    description: "Bangkok holds eight centuries of layered history, and most of it is invisible from a tour bus window. Into the Thai Culture takes you off the arterial roads and into the quiet lanes that connect the city's most significant spiritual sites — by tuk-tuk, by foot, and by public boat on the Chao Phraya. Your licensed guide navigates not just the geography, but the meaning: the ritual significance of each temple, the social history of the market quarter, the unwritten rules of Thai hospitality that make this city unlike anywhere else in Asia.",
    highlights: [
        "Rattanakosin Island and the Grand Palace district",
        "Wat Pho — the Temple of the Reclining Buddha",
        "Pak Khlong Talat flower market at dawn",
        "Authentic Thai breakfast with a local vendor family",
        "Cross the Chao Phraya by public express boat",
        "Wat Arun — the Temple of Dawn, from the riverside",
        "Traditional Thai lunch at a family-run shophouse restaurant",
        "Chinatown (Yaowarat) and the gold traders' quarter"
    ],
    included: [
        "Licensed TAT cultural guide (English-speaking)",
        "All tuk-tuk transportation within the convoy",
        "Public river-boat tickets",
        "Traditional Thai breakfast",
        "Set Thai lunch at a vetted local restaurant",
        "Temple entry fees",
        "Bottled water throughout",
        "Fully comprehensive personal accident insurance"
    ],
    notIncluded: [
        "Personal purchases and souvenirs",
        "Gratuities (at your discretion)",
        "Airport or hotel transfers"
    ],
    itinerary: [
        {
            time: "7:30 AM",
            title: "Convoy Briefing & Departure",
            description: "Meet your guide at the designated meeting point in Phra Nakhon district. 10-minute safety briefing, introduction to the convoy system, and route overview before departure."
        },
        {
            time: "8:00 AM",
            title: "Pak Khlong Talat — The Flower Market",
            description: "Arrive at Bangkok's wholesale flower market at its most atmospheric hour. Your guide explains the significance of jasmine garlands in Buddhist merit-making, and you share a traditional Thai breakfast with one of the vendor families."
        },
        {
            time: "9:30 AM",
            title: "Wat Pho & the Reclining Buddha",
            description: "Enter one of Thailand's oldest and most architecturally complex temple compounds. Your guide decodes the murals, the medicinal inscriptions, and the tradition of the reclining Buddha — a 46-metre gilded figure that has watched over this site for two hundred years."
        },
        {
            time: "11:00 AM",
            title: "The Chao Phraya by Public Boat",
            description: "Board the express river boat — the city's oldest transit system — and cross to Thonburi. Your guide provides commentary on the riverside communities, the historic royal barges, and the ecological role of the river in Bangkok's urban fabric."
        },
        {
            time: "11:45 AM",
            title: "Wat Arun — Temple of Dawn",
            description: "Climb the steep prangs of one of Bangkok's most iconic riverside landmarks. The porcelain-encrusted spires, best photographed from the river, tell the story of King Taksin's short-lived capital across the water."
        },
        {
            time: "1:00 PM",
            title: "Traditional Thai Lunch",
            description: "A set Thai lunch at a three-generation shophouse restaurant in Thonburi — a neighbourhood untouched by tourism. Your guide introduces the dishes and the family."
        },
        {
            time: "2:30 PM",
            title: "Chinatown & the Gold Quarter (Yaowarat)",
            description: "Tuk-tuk convoy through Chinatown — one of the world's largest — pausing at the gold traders' street, the Chinese-Thai temples, and the herbalist quarter. Free time to explore the alleyways independently."
        },
        {
            time: "3:30 PM",
            title: "Return & Farewell",
            description: "Convoy returns to the original meeting point. Guide debrief, reflection journal handover (for educational groups), and guide contact badge activation for booking confirmation recipients."
        }
    ],
    essentials: {
        dressCode: "Shoulders and knees must be covered at all temple sites. We recommend carrying a sarong or light scarf. Clothing that does not meet the dress code will result in denied temple entry.",
        fitness: "Moderate. The tour includes approximately 3–4 km of walking across uneven temple grounds and some steep stairways at Wat Arun. Comfortable, closed-toe shoes are strongly recommended.",
        agePolicy: "Guests aged 18 and above may participate unaccompanied. Guests aged 12–17 are welcome when accompanied by a guardian aged 21 or above. Children under 12 are not admitted on this tour.",
        prep: [
            "Personal pen (required for temple entry forms at Grand Palace)",
            "Reusable water bottle (water stations provided throughout)",
            "Small flashlight or phone torch (some interior temple spaces are dimly lit)",
            "Cash in Thai Baht for personal purchases"
        ]
    }
},

{
    id: "bang-krachao-family-adventure-halfday",
    category: "local",
    name: "Bang Krachao – Floating Market (Half day)",
    tagline: "Family field trip to learn about nature and riverside way of life",
    duration: "6 hours (07:00 - 13:55 hrs.)",
    startTime: "07:00 hrs.",
    groupSize: "Family / Children and Parents",
    rating: 4.9,
    reviews: 256,
    img: "https://plus.unsplash.com/premium_photo-1682098240884-9dfc7bf048f0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heroImg: "https://plus.unsplash.com/premium_photo-1682098240884-9dfc7bf048f0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    galleryImgs: [
      "https://scontent.fbkk29-9.fna.fbcdn.net/v/t39.30808-6/760523220_1512275324269939_717984993744590829_n.jpg?stp=dst-jpg_tt6&cstp=mx810x1080&ctp=s810x1080&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=-RrnhmQIB_EQ7kNvwF1IITQ&_nc_oc=Adr14Nd7OxQIQw6nfkVrOmV9WBr-5gLYicaOlPtzGZ487Oul7JBI2flCZsuEx5oyMqo&_nc_zt=23&_nc_ht=scontent.fbkk29-9.fna&_nc_gid=Oj0BNnWb6LlpblzEq1GsGA&_nc_ss=7b289&oh=00_AQG5tVAcTUxxrkI7wX3FQ4awpZYVkBurBOFfmioj_DGmHw&oe=6A7C9272",
      "https://plus.unsplash.com/premium_photo-1682098240884-9dfc7bf048f0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://trueid-slsapp-storage-prod.s3.ap-southeast-1.amazonaws.com/partner_files/trueidintrend/321947/%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9A%E0%B8%B2%E0%B8%87%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%9C%E0%B8%B6%E0%B9%89%E0%B8%87%E0%B8%99%E0%B8%AD%E0%B8%813.jpg",
      "https://scontent.fbkk29-6.fna.fbcdn.net/v/t39.30808-6/763684752_1513166944180777_6555594705079644824_n.jpg?stp=dst-jpg_tt6&cstp=mx828x1080&ctp=s828x1080&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PXMDW0dkUn8Q7kNvwGfe6lM&_nc_oc=AdoLqK7ZAkk3GRnb9-NGj8nzEi4pm8ysaMTadInEWOhyVNbvlNIkFw5Fuu2SDlTU_TA&_nc_zt=23&_nc_ht=scontent.fbkk29-6.fna&_nc_gid=PRKv1xFZOQs7gtVI_bnJ6w&_nc_ss=7b289&oh=00_AQFgmeoKFPGhtVNAZWseEll6jCe_5xAuENDG8WxGklS3Bg&oe=6A7CA183",
      "https://trueid-slsapp-storage-prod.s3.ap-southeast-1.amazonaws.com/partner_files/trueidintrend/321947/%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9A%E0%B8%B2%E0%B8%87%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%9C%E0%B8%B6%E0%B9%89%E0%B8%87%E0%B8%99%E0%B8%AD%E0%B8%815.jpg"
    ],
    badges: ["Expert guides", "100% safety", "Travel insurance", "Kid-friendly activities"],
    metaDescription: "Bang Krachao family field trip – Bangkok's Green Lung. Adventure, boat ride, floating market, nature learning, and fun missions for kids.",
    description: "Bang Krachao - Bang Nam Phueng Floating Market is right in the heart of Bangkok, brimming with nature, riverside way of life, and authentic Thai culture. This trip will take your family on an experience that is both fun and educational — from a boat ride to observe life along the canals, a visit to Wat Bang Nam Phueng Nok, shopping and dining at Bang Nam Phueng Floating Market, to relaxing amidst nature at Café. Along the way, special kids' missions will make this journey even more meaningful.",
    highlights: [
      "Learn temple etiquette and Thai art at Wat Bang Nam Phueng Nok",
      "Bang Nam Phueng Floating Market – eat, shop, and enjoy local community goods",
      "Boat ride to observe riverside life and nature (1 hour)",
      "Relax in nature at Deep In Bangkrachao",
      "Kids'playbook – explore Bangkrachao: find 3 types of leaves, try a new fruit, learn a temple rule, talk to a vendor, and photograph your favorite thing in Bang Krachao",
      "Bonding activities for the whole family – learn together"
    ],
    included: [
      "Experienced tour guide",
      "Personal accident insurance",
      "Kids' mission kit and activity set",
      "Free drinking water throughout the trip",
      "Motion sickness medicine / mosquito repellent (prepared)"
    ],
    notIncluded: [
      "Personal meals and beverages",
      "Boat ride activity fee",
      "Souvenir purchases",
      "Personal transportation (private car / rental car)"
    ],
    itinerary: [
      { time: "07:00 - 07:45 hrs.", title: "Baanrak Kindergarten", description: "Meet at Ban Rak Kindergarten, Bangkok. Depart by car to Bang Krachao (approx. 45 minutes)." },
      { time: "07:45 - 08:15 hrs.", title: "Wat Bang Nam Phueng Nok", description: "Learn temple etiquette, observe Thai artistic heritage, practice respect for sacred places and the community (30 minutes)." },
      { time: "08:30 - 09:30 hrs.", title: "Boat Ride Activity", description: "Enjoy a boat ride to observe riverside life and nature — spot birds, trees, and houses along the canals (~1 hour) - Additional fee required." },
      { time: "09:45 - 11:30 hrs.", title: "Bang Nam Phueng Floating Market", description: "Free time for families to enjoy a meal and stroll through the floating market, experience community culture, shop for souvenirs, and complete the kids' missions." },
      { time: "11:45 - 12:55 hrs.", title: "Deep In Bangkrachao", description: "Lunch, drinks and snacks are available here! Relax in nature before heading back." },
      { time: "12:55 - 13:55 hrs.", title: "Return: Baanrak Kindergarten", description: "Travel back to Ban Rak Kindergarten safely (approx. 60 minutes)." }
    ],
    essentials: {
      dressCode: "Wear comfortable, breathable clothing and shoes suitable for walking and the boat ride.",
      fitness: "Easy level – flat terrain with frequent rest stops, suitable for children and seniors.",
      agePolicy: "Children of all ages are welcome. Children under 12 must be under parental supervision at all times.",
      prep: [
        "Personal water bottle",
        "Hat and sunscreen",
        "Personal medication / mosquito repellent",
        "Camera or phone for completing missions",
        "An open mind to learn and respect nature and the community"
      ]
    },
    pricing: {
        priceAdult: 990,
        priceChild: 750,
        priceSoloPrivate: 2400,
        priceGroup: 869,
        groupMin: 9,
        packages: [
            {
                key: "family",
                label: "Family Package (2 adults + 1-2 children)",
                price: 2890,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Couple Package / 2 persons (Comfort seat)",
                price: 2480,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Friends Package (3 persons)",
                price: 2670,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    },
    map: {
      start: "Ban Rak Kindergarten, Bangkok",
      stops: [
        "Wat Bang Nam Phueng Nok",
        "Boat Pier (Bang Nam Phueng Canal)",
        "Bang Nam Phueng Floating Market",
        "Hiddenwoods Café"
      ],
      end: "Ban Rak Kindergarten, Bangkok"
    }
},

{
    id: "bang-krachao-family-adventure-fullday",
    category: "local",
    name: "Bang Krachao – Adventure in the Green Lung",
    tagline: "Family field trip to learn about nature and riverside way of life",
    duration: "~10 hours (07:00 - 16:30 hrs.)",
    startTime: "07:00 hrs.",
    groupSize: "Family / Children and Parents",
    rating: 4.9,
    reviews: 256,
    img: "https://asset.readme.me/files/10347/cover.jpg?v=40ff5f52",
    heroImg: "https://asset.readme.me/files/10347/cover.jpg?v=40ff5f52",
    galleryImgs: [
      "https://scontent.fbkk29-9.fna.fbcdn.net/v/t39.30808-6/760523220_1512275324269939_717984993744590829_n.jpg?stp=dst-jpg_tt6&cstp=mx810x1080&ctp=s810x1080&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=-RrnhmQIB_EQ7kNvwF1IITQ&_nc_oc=Adr14Nd7OxQIQw6nfkVrOmV9WBr-5gLYicaOlPtzGZ487Oul7JBI2flCZsuEx5oyMqo&_nc_zt=23&_nc_ht=scontent.fbkk29-9.fna&_nc_gid=Oj0BNnWb6LlpblzEq1GsGA&_nc_ss=7b289&oh=00_AQG5tVAcTUxxrkI7wX3FQ4awpZYVkBurBOFfmioj_DGmHw&oe=6A7C9272",
      "https://plus.unsplash.com/premium_photo-1682098240884-9dfc7bf048f0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1628221556371-ef4c328d9019?q=80&w=1775&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://scontent.fbkk29-6.fna.fbcdn.net/v/t39.30808-6/763684752_1513166944180777_6555594705079644824_n.jpg?stp=dst-jpg_tt6&cstp=mx828x1080&ctp=s828x1080&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PXMDW0dkUn8Q7kNvwGfe6lM&_nc_oc=AdoLqK7ZAkk3GRnb9-NGj8nzEi4pm8ysaMTadInEWOhyVNbvlNIkFw5Fuu2SDlTU_TA&_nc_zt=23&_nc_ht=scontent.fbkk29-6.fna&_nc_gid=PRKv1xFZOQs7gtVI_bnJ6w&_nc_ss=7b289&oh=00_AQFgmeoKFPGhtVNAZWseEll6jCe_5xAuENDG8WxGklS3Bg&oe=6A7CA183",
      "https://images.unsplash.com/photo-1533130061792-64a345e0a6d1?w=600&h=420&fit=crop&auto=format"
    ],
    badges: ["Expert guides", "100% safety", "Travel insurance", "Kid-friendly activities"],
    metaDescription: "Bang Krachao family field trip – Bangkok's Green Lung. Adventure, boat ride, floating market, nature learning, and fun missions for kids.",
    description: "Bang Krachao is a magical green oasis right in the heart of Bangkok, brimming with nature, riverside way of life, and authentic Thai culture. This trip will take your family on an experience that is both fun and educational — from a boat ride to observe life along the canals, a visit to Wat Bang Nam Phueng Nok, shopping and dining at Bang Nam Phueng Floating Market, to relaxing amidst nature at Hiddenwoods Café. Along the way, special kids' missions will make this journey even more meaningful.",
    highlights: [
      "Learn temple etiquette and Thai art at Wat Bang Nam Phueng Nok",
      "Bang Nam Phueng Floating Market – eat, shop, and enjoy local community goods",
      "Boat ride to observe riverside life and nature (1 hour)",
      "Relax in nature at Deep In Bangkrachao",
      "Kids'playbook – explore Bangkrachao: find 3 types of leaves, try a new fruit, learn a temple rule, talk to a vendor, and photograph your favorite thing in Bang Krachao",
      "Bonding activities for the whole family – learn together"
    ],
    included: [
      "Experienced tour guide",
      "Personal accident insurance",
      "Kids' mission kit and activity set",
      "Free drinking water throughout the trip",
      "Motion sickness medicine / mosquito repellent (prepared)"
    ],
    notIncluded: [
      "Personal meals and beverages",
      "Boat ride activity fee",
      "Souvenir purchases",
      "Personal transportation (private car / rental car)"
    ],
    itinerary: [
      { time: "07:00 - 07:45 hrs.", title: "Baanrak Kindergarten", description: "Meet at Ban Rak Kindergarten, Bangkok. Depart by car to Bang Krachao (approx. 45 minutes)." },
      { time: "07:45 - 08:15 hrs.", title: "Wat Bang Nam Phueng Nok", description: "Learn temple etiquette, observe Thai artistic heritage, practice respect for sacred places and the community (30 minutes)." },
      { time: "08:30 - 09:30 hrs.", title: "Boat Ride Activity", description: "Enjoy a boat ride to observe riverside life and nature — spot birds, trees, and houses along the canals (~1 hour) - Additional fee required." },
      { time: "09:45 - 11:30 hrs.", title: "Bang Nam Phueng Floating Market", description: "Free time for families to enjoy a meal and stroll through the floating market, experience community culture, shop for souvenirs, and complete the kids' missions." },
      { time: "11:45 - 12:55 hrs.", title: "Deep In Bangkrachao", description: "Lunch, drinks and snacks are available here! Relax in nature before heading back." },
      { time: "13:00 - 15:30 hrs.", title: "Sri Nakhon Khuean Khan Park", description: "Explore Bangkok's 'green lung' on foot or by bike! Wander along elevated nature trails through lush mangrove forest, spot monitor lizards, birds, and butterflies, enjoy the peaceful lake views, and relax in the shade of giant trees. A perfect outdoor adventure for kids and families to connect with nature before heading back."},
      { time: "15:45 - 16:30 hrs.", title: "Return: Baanrak Kindergarten", description: "Travel back to Ban Rak Kindergarten safely (approx. 60 minutes)." }
    ],
    essentials: {
      dressCode: "Wear comfortable, breathable clothing and shoes suitable for walking and the boat ride.",
      fitness: "Easy level – flat terrain with frequent rest stops, suitable for children and seniors.",
      agePolicy: "Children of all ages are welcome. Children under 12 must be under parental supervision at all times.",
      prep: [
        "Personal water bottle",
        "Hat and sunscreen",
        "Personal medication / mosquito repellent",
        "Camera or phone for completing missions",
        "An open mind to learn and respect nature and the community"
      ]
    },
    pricing: {
        priceAdult: 1490,
        priceChild: 850,
        priceSoloPrivate: 2690,
        priceGroup: 1290,
        groupMin: 9,
        packages: [
            {
                key: "family",
                label: "Family Package (2 adults + 1-2 children)",
                price: 3690,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Couple Package / 2 persons (Comfort seat)",
                price: 2890,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Friends Package (3 persons)",
                price: 3576,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    },
    map: {
      start: "Ban Rak Kindergarten, Bangkok",
      stops: [
        "Wat Bang Nam Phueng Nok",
        "Boat Pier (Bang Nam Phueng Canal)",
        "Bang Nam Phueng Floating Market",
        "Hiddenwoods Café"
      ],
      end: "Ban Rak Kindergarten, Bangkok"
    }
},

{
    id: "dawn-at-the-flower-market",
    category: "morning",
    name: "Dawn at the Flower Market",
    tagline: "The world's most atmospheric wholesale market, before the city wakes",
    duration: "3 Hours",
    startTime: "5:30 AM",
    groupSize: "Max 8 guests",
    rating: 4.8,
    reviews: 156,
    img: "https://img.wongnai.com/p/400x0/2025/04/13/0a4602c9e0ad4b96a3f7a169aa6706d8.jpg",
    heroImg: "https://img.wongnai.com/p/400x0/2025/04/13/0a4602c9e0ad4b96a3f7a169aa6706d8.jpg",
    galleryImgs: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZQEnXeWUXbmBOX_Q27WMU3tRUhZoTJmUEGC5nvZHzlKMB7m3MT3m4i2G5&s=10",
      "https://today-obs.line-scdn.net/0hXNkYj_UnB2FWIBTK-7p4Nm52CxBlRh1odBQfU3YkCVZ5DEcwbBFUAiYiUE0oE0kwdhFBUyEpDFN_FBViPw/w1200",
    ],
    badges: ["Expert Guide", "Small Group Policy", "Fully Insured"],
    metaDescription: "Join Siam Journeys at Bangkok's Pak Khlong Talat flower market before sunrise — the city's most sensory experience. 3-hour morning tour from 799 THB.",
    description: "Pak Khlong Talat is Bangkok's wholesale flower market — and at 5:30 in the morning, it is one of the most sensory-rich environments on earth. The scent of a thousand jasmine garlands. Traders wrapping lotus blooms by torch-light. Monks collecting alms at the canal edge. This three-hour experience takes you into the heart of the market with a guide who knows every vendor personally — and ends with a traditional Thai breakfast as the sun rises over the Chao Phraya.",
    highlights: [
      "Wholesale flower market before the city wakes",
      "Traditional merit-making — offering flowers at a canalside shrine",
      "Meet the jasmine garland weavers",
      "Pre-dawn walk along the Chao Phraya riverbank",
      "Traditional Thai breakfast with the market vendors",
    ],
    included: [
      "Tuk-tuk transportation",
      "Bottled water",
      "Personal accident insurance"
    ],
    notIncluded: ["Flower or souvenir purchases", "Traditional Thai breakfast", "Gratuities"],
    itinerary: [
      { time: "5:30 AM", title: "Pre-Dawn Departure", description: "Convoy departs in the dark. Your guide orients you to the pre-dawn rhythms of the canal district." },
      { time: "5:45 AM", title: "Pak Khlong Talat — Deep Access", description: "Enter the inner aisles of the wholesale market — areas not accessible to standard tours — and meet the jasmine weavers your guide has known for years." },
      { time: "7:00 AM", title: "Riverbank Walk & Canalside Shrine", description: "Walk the Chao Phraya embankment as the city's first light hits the water. Observe morning alms-giving at a canalside temple." },
      { time: "7:30 AM", title: "Traditional Breakfast", description: "Sit with the market vendors for a Thai breakfast of rice congee, fried dough, and Thai coffee as the sun clears the opposite bank." },
      { time: "8:30 AM", title: "Return", description: "Convoy returns to the meeting point. Tour concludes." },
    ],
    essentials: {
      dressCode: "Comfortable clothing suitable for a working market environment. Closed-toe shoes are essential — the market floor is wet and uneven.",
      fitness: "Easy. Approximately 1.5 km of flat walking on market grounds and riverside paths.",
      agePolicy: "All ages welcome. Children under 12 must be accompanied by a parent or guardian.",
      prep: [
        "Insect repellent (canal district at dawn)",
        "Camera or phone — the light is extraordinary",
        "Light jacket (mornings near the river can be cool)",
      ],
    },
    pricing: {
        priceAdult: 799,
        priceChild: 399,
        priceSoloPrivate: 1600,
        priceGroup: 699,
        groupMin: 6,
        packages: [
            {
                key: "family",
                label: "Family Package",
                price: 1625,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Comfort Package",
                price: 1450,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Adventure Package",
                price: 1900,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    }
},
{
    id: "bangkok-after-dark",
    category: "nightlife",
    name: "Bangkok After Dark",
    tagline: "The city's electric evening — seen from the inside, not the tourist strip",
    duration: "4 Hours",
    startTime: "6:30 PM",
    groupSize: "Max 10 guests",
    rating: 4.7,
    reviews: 198,
    img: "https://images.unsplash.com/photo-1656299435456-41f88298b11c?w=800&h=520&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1656299435456-41f88298b11c?w=1600&h=700&fit=crop&auto=format",
    galleryImgs: [
      "https://images.unsplash.com/photo-1656299435456-41f88298b11c?w=600&h=420&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1694501898583-7caca30dde01?w=600&h=420&fit=crop&auto=format",
    ],
    badges: ["Expert Guide", "Convoy Safety System", "Fully Insured"],
    metaDescription: "Bangkok's authentic night scene — markets, rooftop shrines, and hidden bars — on a 4-hour evening tuk-tuk convoy. From 1,099 THB. Book with Siam Journeys.",
    description: "Bangkok after dark is a different city. The heat softens, the neon sharpens, and the neighbourhoods that are quiet by day become the social centre of Thai urban life. Bangkok After Dark bypasses the tourist nightlife corridor entirely — instead taking you to a rooftop spirit shrine, a third-generation Thai craft cocktail bar in the old quarter, an evening floating market, and a street food circuit that your guide has curated over fifteen years of living in this city at night.",
    highlights: [
      "Rooftop spirit shrine — a Bangkok ritual invisible to most visitors",
      "Evening floating market, Thonburi side",
      "Third-generation Thai craft cocktail bar in the old quarter",
      "Chinatown's Yaowarat Road after dark",
      "Late-night street food circuit with your guide",
    ],
    included: [
      "Licensed TAT evening guide",
      "Full tuk-tuk convoy with convoy safety protocol",
      "One welcome drink at the partner bar",
      "Street food tasting plate (3 items)",
      "Personal accident insurance",
    ],
    notIncluded: ["Additional drinks", "Personal food purchases", "Gratuities"],
    itinerary: [
      { time: "6:30 PM", title: "Briefing & Departure", description: "Meet at the evening convoy point. Safety briefing and night-time route overview." },
      { time: "7:00 PM", title: "Rooftop Spirit Shrine", description: "A little-known rooftop shrine above a 19th-century shophouse where Bangkok residents gather at dusk to make offerings. Your guide explains the animist traditions that predate Thai Buddhism." },
      { time: "8:00 PM", title: "Evening Floating Market", description: "Thonburi's canal market at its evening peak — vendors selling from wooden boats by lamplight." },
      { time: "9:00 PM", title: "Old Quarter Bar & Chinatown", description: "One drink at the craft cocktail bar, then a walking circuit through Yaowarat Road as it hits full evening momentum." },
      { time: "10:00 PM", title: "Street Food Circuit & Return", description: "Your guide's curated late-night street food stops before convoy returns to the meeting point." },
      { time: "10:30 PM", title: "Return", description: "Tour concludes at the original departure point." },
    ],
    essentials: {
      dressCode: "Smart casual. Some venues on the route observe a no-shorts policy. We recommend trousers or a midi skirt for women.",
      fitness: "Easy. Approximately 2 km of evening walking on flat urban terrain.",
      agePolicy: "18+ only. Valid ID may be required at some venues.",
      prep: [
        "Personal ID for venue entry",
        "Comfortable walking shoes",
        "Light jacket (air-conditioned venues)",
        "Cash for personal food and drink purchases",
      ],
    },
    pricing: {
        priceAdult: 1099,
        priceChild: 549,
        priceSoloPrivate: 2200,
        priceGroup: 949,
        groupMin: 8,
        packages: [
            {
                key: "family",
                label: "Family Package",
                price: 2200,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Comfort Package",
                price: 1990,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Adventure Package",
                price: 2600,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    }
},
{
    id: "chinatown-night-walk",
    category: "nightlife",
    name: "Chinatown Night Walk",
    tagline: "Yaowarat by night — the most delicious three hours in Bangkok",
    duration: "3 Hours",
    startTime: "7:00 PM",
    groupSize: "Max 10 guests",
    rating: 4.8,
    reviews: 143,
    img: "https://images.unsplash.com/photo-1694501898583-7caca30dde01?w=800&h=520&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1694501898583-7caca30dde01?w=1600&h=700&fit=crop&auto=format",
    galleryImgs: [
      "https://images.unsplash.com/photo-1694501898583-7caca30dde01?w=600&h=420&fit=crop&auto=format",
    ],
    badges: ["Expert Guide", "Small Group Policy", "Fully Insured"],
    metaDescription: "Bangkok's Chinatown (Yaowarat) after dark — a focused 3-hour street food and culture walk with a licensed guide. From 899 THB per person.",
    description: "Yaowarat Road is the gastronomic spine of one of the world's great Chinatowns — and at 7pm, it is at full sensory capacity. This focused three-hour walk takes you from the gold traders' lane to the seafood stalls, through the Talat Noi artist quarter, and into the unmarked alleys where the best food in the district has been served for three generations. Your guide is a Bangkokian of Chinese-Thai heritage who navigates this neighbourhood as a local, not a tour guide.",
    highlights: [
      "Yaowarat Road at full evening intensity",
      "The gold traders' lane and Chinese-Thai temples",
      "Talat Noi artist quarter and street art",
      "Five curated street food stops with your guide",
      "A 100-year-old Chinese-Thai coffee house",
    ],
    included: [
      "Five street food tastings",
      "Traditional Thai-Chinese iced coffee",
      "Personal accident insurance",
    ],
    notIncluded: ["Additional food purchases", "Gratuities"],
    itinerary: [
      { time: "7:00 PM", title: "Arrival at Yaowarat", description: "Meet at the Odeon Circle arch, the symbolic gateway to Bangkok's Chinatown." },
      { time: "7:15 PM", title: "Gold Lane & Temple Circuit", description: "Walk the gold traders' street with your guide, who explains the Chinese-Thai heritage of the Yaowarat quarter and visits two working Chinese-Thai shrines." },
      { time: "8:00 PM", title: "Street Food Circuit", description: "Five curated stops: grilled seafood, pad see ew, mango sticky rice, dim sum, and century egg congee. Your guide introduces each vendor." },
      { time: "9:15 PM", title: "Talat Noi & Coffee House", description: "Into the artists' quarter behind Yaowarat, ending at a 100-year-old coffee house for iced Thai-Chinese coffee." },
      { time: "10:00 PM", title: "Conclusion", description: "Tour ends at the Odeon Circle. Your guide can assist with onward transport directions." },
    ],
    essentials: {
      dressCode: "Comfortable clothing. No strict dress code — the neighbourhood is relaxed.",
      fitness: "Easy. Flat walking, approximately 2 km over 3 hours with frequent stops.",
      agePolicy: "All ages welcome. Children under 12 must be accompanied by a parent or guardian.",
      prep: [
        "Appetite — this is a food-focused experience",
        "Cash in Thai Baht for any personal purchases",
        "Comfortable shoes",
      ],
    },
    pricing: {
        priceAdult: 899,
        priceChild: 450,
        priceSoloPrivate: 1800,
        priceGroup: 799,
        groupMin: 8,
        packages: [
            {
                key: "family",
                label: "Family Package",
                price: 1800,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Comfort Package",
                price: 1625,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Adventure Package",
                price: 2150,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    }
},
{
    id: "ancient-temple-circuit",
    category: "cultural",
    name: "The Ancient Temple Circuit",
    tagline: "Three of Bangkok's most significant temples in a single, carefully paced morning",
    duration: "5 Hours",
    startTime: "8:00 AM",
    groupSize: "Max 12 guests",
    rating: 4.8,
    reviews: 211,
    img: "https://images.unsplash.com/photo-1678263001211-b1c2f231b5e7?w=800&h=520&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1678263001211-b1c2f231b5e7?w=1600&h=700&fit=crop&auto=format",
    galleryImgs: [
      "https://images.unsplash.com/photo-1678263001211-b1c2f231b5e7?w=600&h=420&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1769848754718-be02141c6cc3?w=600&h=420&fit=crop&auto=format",
    ],
    badges: ["Expert Guide", "Convoy Safety System", "Small Group Policy"],
    metaDescription: "Wat Pho, Wat Arun, and Wat Traimit in a single focused morning with a licensed Bangkok cultural guide. Ancient Temple Circuit from 1,199 THB. Siam Journeys.",
    description: "Bangkok's three most architecturally and historically significant Buddhist temples — Wat Pho, Wat Arun, and Wat Traimit — are within three kilometres of each other, yet most visitors see them separately, without context, and without depth. The Ancient Temple Circuit connects all three in a single five-hour morning, paced to allow genuine engagement with each site rather than a photographic checklist. Your guide provides art-historical, religious, and social context that transforms the experience from sightseeing into understanding.",
    highlights: [
      "Wat Pho — Thailand's oldest royal temple and the birthplace of traditional Thai massage",
      "Wat Arun — the Temple of Dawn, climbed at morning light",
      "Wat Traimit — the Golden Buddha, the world's largest solid-gold statue",
      "In-depth cultural briefing on Theravada Buddhism",
      "River crossing by public express boat",
    ],
    included: [
      "Licensed TAT guide with art-history specialisation",
      "All tuk-tuk transportation",
      "River boat tickets",
      "All temple entry fees",
      "Bottled water",
      "Personal accident insurance",
    ],
    notIncluded: ["Meals", "Gratuities", "Personal purchases"],
    itinerary: [
      { time: "8:00 AM", title: "Briefing & Departure", description: "Meet at the convoy point near Sanam Luang. Route briefing and historical introduction to Rattanakosin Island." },
      { time: "8:30 AM", title: "Wat Pho", description: "90 minutes inside Thailand's oldest royal temple complex. Your guide covers the Reclining Buddha, the medical inscriptions (the world's first medical textbook), and the school of traditional Thai massage still operating within the compound." },
      { time: "10:00 AM", title: "River Crossing to Wat Arun", description: "Express boat across the Chao Phraya. Climb the steep prangs of the Temple of Dawn with your guide explaining the symbolism of Mount Meru and the Khmer architectural tradition." },
      { time: "11:00 AM", title: "Wat Traimit — The Golden Buddha", description: "The world's largest solid-gold Buddha, discovered by accident in 1955. Your guide explains the extraordinary story of how a 700-year-old statue was concealed under plaster for two centuries." },
      { time: "12:30 PM", title: "Return & Conclusion", description: "Convoy returns to the starting point. Tour concludes." },
    ],
    essentials: {
      dressCode: "Full temple dress code applies at all three sites: shoulders covered, knees covered. Sarongs are available to borrow at temple entrances but we recommend bringing your own.",
      fitness: "Moderate. Steep stairways at Wat Arun (approximately 70° incline). Guests with knee or mobility concerns should advise the guide before ascending.",
      agePolicy: "18+ unaccompanied; 12+ with a guardian aged 21 or above.",
      prep: [
        "Personal pen (Grand Palace-adjacent sites require entry forms)",
        "Sarong or lightweight scarf",
        "Sunscreen and hat (open courtyards at all three sites)",
        "Reusable water bottle",
      ],
    },
    pricing: {
        priceAdult: 1199,
        priceChild: 600,
        priceSoloPrivate: 2400,
        priceGroup: 1049,
        groupMin: 10,
        packages: [
            {
                key: "family",
                label: "Family Package",
                price: 2400,
                adults: 2,
                childrenMin: 1,
                childrenMax: 2
            },
            {
                key: "couple",
                label: "Comfort Package",
                price: 2180,
                adults: 2,
                childrenMin: 0,
                childrenMax: 0
            },
            {
                key: "adventure",
                label: "Adventure Package",
                price: 2850,
                adults: 3,
                childrenMin: 0,
                childrenMax: 0
            }
        ]
    }
},

];

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Tours" },
  { id: "morning", label: "Morning" },
  { id: "nightlife", label: "Nightlife" },
  { id: "cultural", label: "Cultural" },
  { id: "local", label: "Local Explore" },
];


