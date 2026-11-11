"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Wrench,
  ShieldCheck,
  CarFront,
  CheckCircle2,
  Languages,
  X,
  Building2,
  MapPinned,
  Sparkles,
  Car,
  Settings,
} from "lucide-react";

import "./home-page.css";
import { beforeAfterProjects } from "./projects/project-data";

/* GOOGLE TRANSLATE TYPES */

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

/* CONSTANTS */

const PHONE = "9130129205";
const WHATSAPP = "919130129205";
const EMAIL = "tuljamotors@gmail.com";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=16.798993%2C74.284622";

/* LANGUAGES */

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

/* SERVICES */

const services = [
  {
    number: "01",
    brand: "TULJA MOTORS",
    title: "Accident Repair & Body Work",
    description:
      "Professional repair solutions for accident damage, panels, bumpers and vehicle bodywork.",
    href: "#accident-repair",
  },
  {
    number: "02",
    brand: "TULJA MOTORS",
    title: "Denting & Painting",
    description:
      "Restore damaged panels with dent removal, scratch repair and colour-matched paintwork.",
    href: "#denting-painting",
  },
  {
    number: "03",
    brand: "SHARVARI MOTORS",
    title: "Ceramic & Graphene Coating",
    description:
      "Enhance your car's gloss and surface protection with professional coating options.",
    href: "#ceramic-coating",
  },
  {
    number: "04",
    brand: "SHARVARI MOTORS",
    title: "PPF & Vinyl Wrap",
    description:
      "Protect and personalise your vehicle with PPF, vinyl wraps and chrome delete.",
    href: "#ppf-wrap",
  },
  {
    number: "05",
    brand: "SHARVARI MOTORS",
    title: "Interior Modification",
    description:
      "Upgrade your cabin with custom upholstery, ambient lighting and premium accessories.",
    href: "#interior-modification",
  },
  {
    number: "06",
    brand: "SHARVARI MOTORS",
    title: "Exterior Modification",
    description:
      "Give your vehicle a distinctive look with styling upgrades and exterior accessories.",
    href: "#exterior-modification",
  },
  {
    number: "07",
    brand: "SHARVARI MOTORS",
    title: "Interior & Exterior Detailing",
    description:
      "Bring back a fresh finish with deep cleaning, polishing and detailed vehicle care.",
    href: "#detailing",
  },
  {
    number: "08",
    brand: "TULJA MOTORS",
    title: "Mechanical Work",
    description:
      "Vehicle maintenance and inspection for brakes, suspension, AC and electrical systems.",
    href: "#mechanical",
  },
  {
    number: "09",
    brand: "TULJA MOTORS",
    title: "Car Renovation & Restoration",
    description:
      "Give older vehicles a refreshed appearance with planned body, paint and interior work.",
    href: "#restoration",
  },
];

/* SERVICE MEDIA */

type ServiceMedia = {
  image: string;
  image2: string;
  cars: string;
};

const serviceMedia: Record<string, ServiceMedia> = {
  "accident-repair": {
    image: "/images/services/accident-repair.jpg",
    image2: "/images/services/accident-repair-2.jpg",
    cars: "MAHINDRA SCORPIO · TATA NEXON",
  },
  "denting-painting": {
    image: "/images/services/denting-painting.jpg",
    image2: "/images/services/denting-painting-2.jpg",
    cars: "TATA NEXON · MARUTI SWIFT",
  },
  "ceramic-coating": {
    image: "/images/services/ceramic-coating.jpg",
    image2: "/images/services/ceramic-coating-2.jpg",
    cars: "HYUNDAI CRETA · TOYOTA FORTUNER",
  },
  "ppf-wrap": {
    image: "/images/services/ppf-wrap.jpg",
    image2: "/images/services/ppf-wrap-2.jpg",
    cars: "MAHINDRA THAR · TATA HARRIER",
  },
  "interior-modification": {
    image: "/images/services/interior-modification.jpg",
    image2: "/images/services/interior-modification-2.jpg",
    cars: "KIA SELTOS · HYUNDAI CRETA",
  },
  "exterior-modification": {
    image: "/images/services/exterior-modification.jpg",
    image2: "/images/services/exterior-modification-2.jpg",
    cars: "MAHINDRA THAR · SCORPIO-N",
  },
  detailing: {
    image: "/images/services/detailing.jpg",
    image2: "/images/services/detailing-2.jpg",
    cars: "MARUTI BREZZA · HONDA CITY",
  },
  mechanical: {
    image: "/images/services/mechanical.jpg",
    image2: "/images/services/mechanical-2.jpg",
    cars: "TOYOTA INNOVA · MARUTI ERTIGA",
  },
  restoration: {
    image: "/images/services/restoration.jpg",
    image2: "/images/services/restoration-2.jpg",
    cars: "AMBASSADOR · MARUTI 800",
  },
};

/* SERVICE POPUP CONTENT */

const detailedServices = [
  {
    id: "accident-repair",
    number: "01 / TULJA MOTORS",
    title: "Accident Repair & Body Work",
    what: "Accident repair restores damaged vehicle body parts after a collision. The work may involve damaged panels, bumpers, lamps, mounting points and body alignment.",
    why: "Accident damage can affect the appearance, fitment and safe operation of vehicle components. A proper inspection helps identify visible and hidden damage before repair work begins.",
    description:
      "अपघातानंतर कारच्या बॉडी, पॅनेल आणि बाह्य भागांची तपासणी करून आवश्यक दुरुस्ती व फिटमेंट केली जाते.",
    points: [
      "Vehicle damage inspection",
      "Panel repair or replacement",
      "Bumper repair and fitment",
      "Body alignment checks",
      "Headlamp and tail-lamp fitment",
      "Final repair quality check",
    ],
  },
  {
    id: "denting-painting",
    number: "02 / TULJA MOTORS",
    title: "Denting, Painting & Repainting",
    what: "Denting and painting involves repairing dents, scratches and damaged paint surfaces, followed by suitable refinishing of the affected panels.",
    why: "It helps improve the vehicle's appearance, address surface damage and refresh faded or damaged paintwork.",
    description:
      "डेंट, स्क्रॅच, पेंट फेडिंग किंवा पॅनेलवरील नुकसान दुरुस्त करून योग्य रंगाशी जुळणारा पेंट फिनिश देण्याची सेवा.",
    points: [
      "Minor dent removal",
      "Panel denting",
      "Scratch and paint correction",
      "Colour matching",
      "Panel repainting",
      "Full body repainting estimate",
    ],
  },
  {
    id: "ceramic-coating",
    number: "03 / SHARVARI MOTORS",
    title: "Ceramic, Graphene & Paint Coating",
    what: "Ceramic and graphene coating are paint-protection treatments applied to a properly prepared exterior surface to provide gloss and water-repellent properties.",
    why: "These coatings can make routine cleaning easier and help maintain the vehicle's finish. Results and durability depend on the product, preparation and maintenance.",
    description:
      "पेंटची योग्य तयारी, आवश्यक असल्यास polishing आणि त्यानंतर coating लावून gloss व water-repellent finish वाढवण्याची प्रक्रिया.",
    points: [
      "Exterior wash and decontamination",
      "Paint surface inspection",
      "Machine polishing options",
      "Ceramic coating application",
      "Graphene coating options",
      "Curing and care guidance",
    ],
  },
  {
    id: "ppf-wrap",
    number: "04 / SHARVARI MOTORS",
    title: "PPF, Vinyl Wrap & Chrome Delete",
    what: "PPF is a protective film applied to selected painted surfaces. Vinyl wrap and chrome delete use specialised films to change the vehicle's exterior appearance.",
    why: "PPF can help protect covered areas from everyday surface wear. Wraps offer styling choices such as gloss, matte and contrasting roof finishes.",
    description:
      "Paint Protection Film हा transparent protective film पर्याय आहे. Vinyl wrap किंवा chrome delete द्वारे कारचा बाह्य लूक बदलता येतो.",
    points: [
      "Full or partial PPF options",
      "Bonnet and bumper protection",
      "Door edge and handle protection",
      "Gloss or matte wrap options",
      "Roof wrap",
      "Chrome delete styling",
    ],
  },
  {
    id: "interior-modification",
    number: "05 / SHARVARI MOTORS",
    title: "Interior Modification & Accessories",
    what: "Interior modification includes cabin styling, upholstery changes, lighting upgrades and accessories selected to suit the vehicle.",
    why: "It helps personalise the cabin, refresh worn interiors and add convenience or visual features according to the owner's preferences.",
    description:
      "कारच्या cabin ला नवीन theme आणि personal look देण्यासाठी upholstery, lighting व interior accessories चे पर्याय.",
    points: [
      "Custom seat covers",
      "Dashboard and door-pad styling",
      "7D floor mat options",
      "Ambient lighting",
      "Starlight roof options",
      "Steering and interior trims",
    ],
  },
  {
    id: "exterior-modification",
    number: "06 / SHARVARI MOTORS",
    title: "Exterior Modification & Styling",
    what: "Exterior modification includes selected cosmetic upgrades such as body kits, spoilers, grille changes, lighting and compatible accessories.",
    why: "These upgrades allow owners to personalise their vehicle's appearance and choose a styling theme that suits their preferences.",
    description:
      "कारच्या बाह्य रूपात बदल करण्यासाठी model-compatible styling accessories आणि cosmetic upgrades चे पर्याय.",
    points: [
      "Body kit and spoiler options",
      "Grille and bumper styling",
      "Alloy wheel options",
      "Lighting upgrades",
      "Roof and body wrap",
      "Model-specific accessories",
    ],
  },
  {
    id: "detailing",
    number: "07 / SHARVARI MOTORS",
    title: "Interior & Exterior Detailing",
    what: "Detailing is a more thorough cleaning and finishing process for the vehicle's exterior paint, glass, wheels, trims and interior cabin.",
    why: "It helps remove accumulated dirt, refresh interior surfaces and improve the overall presentation of the vehicle.",
    description:
      "कारच्या बाहेरील पेंट आणि आतील cabin ची खोलवर स्वच्छता, finishing आणि योग्य care products वापरून detailing.",
    points: [
      "Premium exterior wash",
      "Paint decontamination",
      "Machine polishing options",
      "Dashboard and trim cleaning",
      "Seat and carpet cleaning options",
      "Glass and wheel cleaning",
    ],
  },
  {
    id: "mechanical",
    number: "08 / TULJA MOTORS",
    title: "Mechanical Work & General Service",
    what: "Mechanical work involves inspecting and addressing vehicle systems such as brakes, suspension, air conditioning and electrical components.",
    why: "Regular checks can help identify wear or developing faults and support reliable day-to-day vehicle operation.",
    description:
      "नियमित देखभाल आणि वाहनातील समस्या तपासण्यासाठी आवश्यक mechanical inspection व repair services.",
    points: [
      "General service checks",
      "Brake inspection",
      "Suspension checks",
      "AC inspection",
      "Battery and electrical checks",
      "Wheel alignment coordination",
    ],
  },
  {
    id: "restoration",
    number: "09 / TULJA MOTORS",
    title: "Car Renovation & Restoration",
    what: "Vehicle restoration is a planned combination of repair and refurbishment work to refresh an older or worn vehicle.",
    why: "It helps owners improve the appearance and condition of an existing vehicle while planning the work according to its age, condition and budget.",
    description:
      "जुन्या किंवा थकलेल्या कारसाठी body, paint, interior आणि आवश्यक mechanical कामाचा टप्प्याटप्प्याने restoration plan.",
    points: [
      "Vehicle condition assessment",
      "Body repair planning",
      "Paint refresh or repainting",
      "Interior refresh options",
      "Trim and accessory renewal",
      "Final inspection",
    ],
  },
];

/* CAR BRAND LOGOS */

const indianCarBrands = [
  { name: "Tata", logo: "/images/brands/tata-logo.png" },
  { name: "Mahindra", logo: "/images/brands/mahindra-logo.png" },
  { name: "Maruti Suzuki", logo: "/images/brands/maruti-logo.png" },
  { name: "Hyundai", logo: "/images/brands/hyundai-logo.svg" },
  { name: "Kia", logo: "/images/brands/kia-logo.svg" },
  { name: "Toyota", logo: "/images/brands/toyota-logo.svg" },
  { name: "Honda", logo: "/images/brands/honda-logo.png" },
  { name: "Skoda", logo: "/images/brands/skoda-logo.svg" },
  { name: "Volkswagen", logo: "/images/brands/volkswagen-logo.svg" },
  { name: "MG", logo: "/images/brands/mg-logo.png" },
  { name: "Jeep", logo: "/images/brands/jeep-logo.svg" },
];

/* CATEGORY-WISE GALLERY PHOTOS */

type GalleryPhoto = {
  name: string;
  image: string;
  category: string;
};

type CategoryGallery = {
  id: string;
  brand: "TULJA MOTORS" | "SHARVARI MOTORS";
  title: string;
  photos: GalleryPhoto[];
};

const tuljaGallery: GalleryPhoto[] = [
  {
    name: "MAHINDRA SCORPIO",
    image: "/images/tulja/scorpio.jpeg",
    category: "Accident Repair",
  },
  {
    name: "TATA NEXON",
    image: "/images/tulja/nexon.jpeg",
    category: "Accident Repair",
  },
  {
    name: "HYUNDAI CRETA",
    image: "/images/tulja/creta.jpeg",
    category: "Accident Repair",
  },
  {
    name: "TATA PUNCH",
    image: "/images/tulja/punch.jpeg",
    category: "Denting & Painting",
  },
  {
    name: "HINDUSTAN AMBASSADOR",
    image: "/images/tulja/ambassador.jpeg",
    category: "Restoration",
  },
  {
    name: "MARUTI 800",
    image: "/images/tulja/maruti-800.jpeg",
    category: "Restoration",
  },
];

const sharvariGallery: GalleryPhoto[] = [
  {
    name: "KIA SELTOS",
    image: "/images/sharvari/seltos.jpeg",
    category: "Interior Modification",
  },
  {
    name: "TOYOTA INNOVA",
    image: "/images/sharvari/innova.jpeg",
    category: "Interior Modification",
  },
  {
    name: "MAHINDRA THAR",
    image: "/images/sharvari/thar.jpeg",
    category: "Exterior Modification",
  },
  {
    name: "MAHINDRA SCORPIO-N",
    image: "/images/sharvari/scorpio-n.jpeg",
    category: "Exterior Modification",
  },
  {
    name: "MARUTI BREZZA",
    image: "/images/sharvari/brezza.jpeg",
    category: "Detailing",
  },
  {
    name: "HONDA CITY",
    image: "/images/sharvari/city.jpeg",
    category: "Detailing",
  },
  {
    name: "KIA CARENS",
    image: "/images/sharvari/carens.jpeg",
    category: "Detailing",
  },
];

/* BUILD CATEGORY GALLERY FROM THE PHOTO ARRAYS */

function buildCategoryGallery(
  photos: GalleryPhoto[],
  brand: CategoryGallery["brand"],
  prefix: string
): CategoryGallery[] {
  const grouped = new Map<string, GalleryPhoto[]>();

  photos.forEach((photo) => {
    const existing = grouped.get(photo.category) ?? [];
    existing.push(photo);
    grouped.set(photo.category, existing);
  });

  return Array.from(grouped.entries()).map(([title, categoryPhotos]) => ({
    id: `${prefix}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    brand,
    title,
    photos: categoryPhotos,
  }));
}

const categoryGallery: CategoryGallery[] = [
  ...buildCategoryGallery(tuljaGallery, "TULJA MOTORS", "tulja"),
  ...buildCategoryGallery(sharvariGallery, "SHARVARI MOTORS", "sharvari"),
];

/* ALL GALLERY PHOTOS FOR THE POPUP */

type GalleryLightboxPhoto = GalleryPhoto & {
  brand: CategoryGallery["brand"];
};

const allGalleryPhotos: GalleryLightboxPhoto[] = categoryGallery.flatMap(
  (category) =>
    category.photos.map((photo) => ({
      ...photo,
      brand: category.brand,
    }))
);

/* HOME PAGE */

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeProject, setActiveProject] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [serviceImageIndex, setServiceImageIndex] = useState(0);

  /* NEW: GALLERY LIGHTBOX STATE */

  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<number | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    car: "",
    service: "",
    message: "",
  });

  const currentProject = beforeAfterProjects[activeProject];

  const activeDetails =
    detailedServices.find((item) => item.id === activeService) ?? null;

  const activeMedia: ServiceMedia | null = activeService
    ? serviceMedia[activeService] ?? null
    : null;

  const currentGalleryPhoto =
    activeGalleryPhoto === null
      ? null
      : allGalleryPhotos[activeGalleryPhoto];

  /* GOOGLE TRANSLATE */

  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (!window.google?.translate?.TranslateElement) return;

      const element = document.getElementById("google_translate_element");

      if (!element || element.dataset.initialized === "true") return;

      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );

      element.dataset.initialized = "true";
    };

    window.googleTranslateElementInit = initializeGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();

      return () => {
        window.googleTranslateElementInit = undefined;
      };
    }

    const existingScript = document.getElementById(
      "google-translate-script"
    ) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, []);

  /* AUTOMATIC PROJECT SLIDER */

  useEffect(() => {
    if (sliderPaused || beforeAfterProjects.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveProject(
        (current) => (current + 1) % beforeAfterProjects.length
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [sliderPaused]);

  /* SERVICE POPUP */

  useEffect(() => {
    if (!activeService) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveService(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeService]);

  /* NEW: GALLERY POPUP KEYBOARD + SCROLL CONTROL */

  useEffect(() => {
    if (activeGalleryPhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleGalleryKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveGalleryPhoto(null);
      }

      if (event.key === "ArrowRight") {
        setActiveGalleryPhoto((current) =>
          current === null
            ? null
            : (current + 1) % allGalleryPhotos.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveGalleryPhoto((current) =>
          current === null
            ? null
            : (current - 1 + allGalleryPhotos.length) %
              allGalleryPhotos.length
        );
      }
    };

    window.addEventListener("keydown", handleGalleryKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleGalleryKeyDown);
    };
  }, [activeGalleryPhoto]);

  /* GALLERY POPUP CONTROLS */

  const openGalleryPhoto = (photo: GalleryPhoto) => {
    const photoIndex = allGalleryPhotos.findIndex(
      (item) => item.image === photo.image
    );

    if (photoIndex !== -1) {
      setActiveGalleryPhoto(photoIndex);
    }
  };

  const showPreviousGalleryPhoto = () => {
    setActiveGalleryPhoto((current) =>
      current === null
        ? null
        : (current - 1 + allGalleryPhotos.length) %
          allGalleryPhotos.length
    );
  };

  const showNextGalleryPhoto = () => {
    setActiveGalleryPhoto((current) =>
      current === null
        ? null
        : (current + 1) % allGalleryPhotos.length
    );
  };

  /* SERVICE IMAGE AUTO SWITCH */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setServiceImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3800);

    return () => window.clearInterval(interval);
  }, []);

  /* PROJECT SLIDER CONTROLS */

  const showPreviousProject = () => {
    setActiveProject((current) =>
      current === 0 ? beforeAfterProjects.length - 1 : current - 1
    );
  };

  const showNextProject = () => {
    setActiveProject(
      (current) => (current + 1) % beforeAfterProjects.length
    );
  };

  /* LANGUAGE SWITCHER */

  const changeLanguage = (languageCode: string) => {
    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement | null;

    if (languageCode === "en") {
      if (select) {
        select.value = "en";
        select.dispatchEvent(new Event("change"));
      } else {
        document.cookie = "googtrans=/en/en; path=/; max-age=31536000";
        window.location.reload();
      }

      setSelectedLanguage("en");
      setLanguageOpen(false);
      return;
    }

    if (!select) {
      alert("Translator is loading. Please try again in a moment.");
      return;
    }

    select.value = languageCode;
    select.dispatchEvent(new Event("change"));

    setSelectedLanguage(languageCode);
    setLanguageOpen(false);
  };

  /* WHATSAPP ENQUIRY */

  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = `Hello Tulja Motors,

Name: ${form.name}
Phone: ${form.phone}
Car Model: ${form.car}
Service: ${form.service}
Message: ${form.message}

Please contact me regarding this enquiry.`;

    openWhatsApp(message);
  };

  /* FAQ DATA */

  const faqs = [
    {
      q: "Which car brands do you work with?",
      a: "We aim to cater to popular Indian and international car brands including Tata, Mahindra, Maruti Suzuki, Hyundai, Kia, Toyota, Honda, Skoda, Volkswagen and others. Please confirm compatibility for your specific vehicle.",
    },
    {
      q: "How can I get an estimate for accident repair?",
      a: "Share your car model, contact details and clear photos of the damaged areas on WhatsApp. A final estimate depends on physical inspection and the extent of damage.",
    },
    {
      q: "Can I enquire about PPF and ceramic coating?",
      a: "Yes. Share your vehicle model and the type of protection or finish you are interested in. Available products and packages can be discussed.",
    },
    {
      q: "Do I need an appointment?",
      a: "We recommend contacting us before visiting so the team can guide you about availability and the next steps.",
    },
  ];

  return (
    <main className="tm-home">
{/* KOLHAPUR WORKSHOP HERO */}
<section className="kh6 kh6--warm" id="kolhapur-workshop">
  <div className="kh6-photo" />

  <div className="kh6-inner">
    <span className="kh6-eyebrow">
      TULJA MOTORS × SHARVARI MOTORS · KOLHAPUR
    </span>

    <h1>
      KOLHAPUR,
      <span>GET READY !</span>
    </h1>

    <p className="kh6-text">
     Our 10,000 sq. ft. multi-brand automotive workshop in Kolhapur brings accident repair, restoration, detailing and customisation together under one roof
    </p>

    <div className="kh6-actions">
      <a href="#services" className="kh6-btn kh6-btn-primary">
        DISCOVER OUR SERVICES
      </a>
      <a
        href={`https://wa.me/${WHATSAPP}?text=Hello%20Tulja%20Motors%2C%20I%20would%20like%20to%20enquire%20about%20your%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        className="kh6-btn kh6-btn-outline"
      >
        CHAT ON WHATSAPP
      </a>
    </div>

    <ul className="kh6-points">
      <li><span>✦</span>TULJA MOTORS · REPAIR &amp; RESTORE</li>
      <li><span>✦</span>SHARVARI MOTORS · CUSTOMISE &amp; PROTECT</li>
    </ul>
  </div>

  <div className="kh6-mark">10,000</div>
</section>
      {/* TOP AUTOMOTIVE ADVERTISEMENT SLIDER */}

      <section className="tm-before-after-section" id="home">
        <div className="tm-ba-wrap">
          <div
            className="tm-ba-slider"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
            onFocus={() => setSliderPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setSliderPaused(false);
              }
            }}
          >
            <Link
              href={`/projects/${currentProject.slug}`}
              className="tm-ba-banner"
              aria-label={`View ${currentProject.title} project details`}
              key={currentProject.slug}
            >
              <div className="tm-ba-image tm-ba-before">
                <img
                  src={currentProject.beforeImage}
                  alt={`${currentProject.vehicle} before work`}
                />
                <span className="tm-ba-label">BEFORE</span>
              </div>

              <div className="tm-ba-image tm-ba-after">
                <img
                  src={currentProject.afterImage}
                  alt={`${currentProject.vehicle} after work`}
                />
                <span className="tm-ba-label">AFTER</span>
              </div>

              <div className="tm-ba-divider">
                <span>↔</span>
              </div>

              <div className="tm-ba-bottom">
                <div>
                  <small>
                    {currentProject.brand} <span>·</span>{" "}
                    {currentProject.vehicle}
                  </small>
                  <h3>{currentProject.title}</h3>
                  <span className="tm-ba-service">
                    {currentProject.service}
                  </span>
                </div>

                <span className="tm-ba-open">
                  VIEW PROJECT <ArrowUpRight size={19} />
                </span>
              </div>
            </Link>

            <div className="tm-ba-controls">
              <div className="tm-ba-slide-info">
                <span className="tm-ba-current-number">
                  {currentProject.number}
                </span>
                <span className="tm-ba-slide-line" />
                <span className="tm-ba-current-name">
                  {currentProject.vehicle}
                </span>
              </div>

              <div className="tm-ba-arrows">
                <button
                  type="button"
                  onClick={showPreviousProject}
                  aria-label="Previous project"
                  className="tm-ba-arrow"
                >
                  <ArrowLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={showNextProject}
                  aria-label="Next project"
                  className="tm-ba-arrow tm-ba-arrow-next"
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>

            <div className="tm-ba-dots" aria-label="Choose project slide">
              {beforeAfterProjects.map((project, index) => (
                <button
                  type="button"
                  key={project.slug}
                  onClick={() => setActiveProject(index)}
                  className={
                    activeProject === index
                      ? "tm-ba-dot active"
                      : "tm-ba-dot"
                  }
                  aria-label={`Show project ${index + 1}: ${project.vehicle}`}
                  aria-current={
                    activeProject === index ? "true" : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MOVING RIBBON */}

      <div className="tm-ribbon">
        <div className="tm-ribbon-track">
          {[0, 1].map((item) => (
            <div className="tm-ribbon-group" key={item}>
              <span>ACCIDENT REPAIR</span>
              <i>✳</i>
              <span>DENTING & PAINTING</span>
              <i>✳</i>
              <span>CAR RESTORATION</span>
              <i>✳</i>
              <span>CERAMIC COATING</span>
              <i>✳</i>
              <span>PPF & WRAPPING</span>
              <i>✳</i>
              <span>CAR CUSTOMISATION</span>
              <i>✳</i>
            </div>
          ))}
        </div>
      </div>


      

      {/* SERVICES */}

      <section className="tm-section tm-services-section" id="services">
        <div className="tm-wrap">
          <div className="tm-services-heading">
            <span>WHAT WE DO / OUR SERVICES</span>
            <h2>
              COMPLETE CARE. <em>DISTINCT CRAFT.</em>
            </h2>
            <p>
              Explore repair, restoration, detailing and customisation options
              for your vehicle. Select any service to understand the work
              involved.
            </p>
          </div>

          <div className="tm-svc-grid">
            {services.map((service) => {
              const serviceId = service.href.replace("#", "");
              const media = serviceMedia[serviceId];

              return (
                <button
                  type="button"
                  key={service.number}
                  className="tm-svc-card"
                  onClick={() => setActiveService(serviceId)}
                  aria-haspopup="dialog"
                  aria-label={`View details: ${service.title}`}
                >
                  <span className="tm-svc-card-media">
                    <div className="tm-service-card-image-slider">
                      <img
                        key={serviceImageIndex}
                        src={
                          serviceImageIndex === 0
                            ? media.image
                            : media.image2
                        }
                        alt={`${service.title} — ${media.cars}`}
                        loading="lazy"
                      />
                      <span className="tm-service-image-counter">
                        0{serviceImageIndex + 1} / 02
                      </span>
                    </div>

                    <span className="tm-svc-card-number">
                      {service.number}
                    </span>
                    <span className="tm-svc-card-car">{media.cars}</span>
                    <span className="tm-svc-card-brand">
                      {service.brand}
                    </span>
                  </span>

                  <span className="tm-svc-card-body">
                    <span className="tm-svc-card-title">
                      {service.title}
                    </span>
                    <span className="tm-svc-card-text">
                      {service.description}
                    </span>
                    <span className="tm-svc-card-action">
                      VIEW DETAILS <ArrowUpRight size={16} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="tm-service-note">
            <span>PLEASE NOTE</span>
            Service availability, materials, products, pricing and estimated
            completion time are confirmed after vehicle inspection and
            discussion. Images are illustrative stock photos, not verified
            photographs of completed workshop jobs.
          </div>
        </div>
      </section>

      {/* INDIAN CAR BRANDS MARQUEE */}

      <section className="tm-brand-marquee-section" id="brands">
        <div className="tm-brand-marquee-heading">
          <span className="tm-brand-marquee-line" />
          <p>WE WORK ON INDIAN CAR BRANDS LIKE</p>
          <span className="tm-brand-marquee-line" />
        </div>

        <div className="tm-brand-marquee">
          <div className="tm-brand-marquee-track">
            {[0, 1].map((repeatIndex) => (
              <div
                className="tm-brand-marquee-group"
                key={repeatIndex}
                aria-hidden={repeatIndex === 1}
              >
                {indianCarBrands.map((brand) => (
                  <div
                    className="tm-brand-marquee-item"
                    key={`${repeatIndex}-${brand.name}`}
                    title={brand.name}
                  >
                    <img
                      src={brand.logo}
                      alt={repeatIndex === 0 ? `${brand.name} logo` : ""}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
            {/* PREMIUM CATEGORY-WISE AUTOMOTIVE GALLERY */}

      <section
        className="tm-section tm-category-gallery-section"
        id="work"
      >
        <div className="tm-wrap">
          <div className="tm-category-gallery-heading">
            <div>
              <span className="tm-section-tag">AUTOMOTIVE SHOWCASE</span>

              <h2>
                OUR WORK.
                <em> OUR SPECIALITIES.</em>
              </h2>

              <p>
                Explore the vehicles and automotive categories associated
                with Tulja Motors and Sharvari Motors.
              </p>
            </div>

            <div className="tm-category-gallery-count">
              <strong>
                {categoryGallery
                  .reduce(
                    (total, category) => total + category.photos.length,
                    0
                  )
                  .toString()
                  .padStart(2, "0")}
              </strong>
              <span>CAR PHOTOS</span>
            </div>
          </div>

          {/* TULJA MOTORS */}

          <div className="tm-category-brand-section tm-category-tulja">
            <div className="tm-category-brand-heading">
              <div>
                <span className="tm-category-brand-number">
                  01 / AUTOMOTIVE REPAIR
                </span>

                <h3>
                  TULJA <span>MOTORS.</span>
                </h3>

                <p>
                  Accident repair, denting, painting and complete vehicle
                  restoration.
                </p>
              </div>

              <span className="tm-category-brand-side">
                REPAIR · RESTORE · RENEW
              </span>
            </div>

            <div className="tm-category-grid">
              {categoryGallery
                .filter((category) => category.brand === "TULJA MOTORS")
                .map((category, categoryIndex) => (
                  <div className="tm-category-card" key={category.id}>
                    <div className="tm-category-card-heading">
                      <span>
                        {String(categoryIndex + 1).padStart(2, "0")}
                      </span>

                      <h4>{category.title}</h4>

                      <span className="tm-category-photo-count">
                        {category.photos.length
                          .toString()
                          .padStart(2, "0")}{" "}
                        PHOTOS
                      </span>
                    </div>

                    <div className="tm-category-photo-grid">
                      {category.photos.map((photo, photoIndex) => (
                        <div
                          className="tm-category-photo"
                          key={photo.image}
                          role="button"
                          tabIndex={0}
                          aria-label={`View larger photo of ${photo.name}`}
                          onClick={() => openGalleryPhoto(photo)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              event.preventDefault();
                              openGalleryPhoto(photo);
                            }
                          }}
                        >
                          <img
                            src={photo.image}
                            alt={`${photo.name} - ${category.title}`}
                            loading="lazy"
                          />

                          <div className="tm-category-photo-shade" />

                          <span className="tm-category-photo-number">
                            {String(photoIndex + 1).padStart(2, "0")}
                          </span>

                          <div className="tm-category-photo-caption">
                            <span>TULJA MOTORS</span>
                            <h5>{photo.name}</h5>
                            <p>{category.title}</p>
                          </div>

                          <span className="tm-category-photo-arrow">
                            <ArrowUpRight size={19} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* SHARVARI MOTORS */}

          <div className="tm-category-brand-section tm-category-sharvari">
            <div className="tm-category-brand-heading">
              <div>
                <span className="tm-category-brand-number">
                  02 / AUTOMOTIVE CUSTOMISATION
                </span>

                <h3>
                  SHARVARI <span>MOTORS.</span>
                </h3>

                <p>
                  Premium interiors, exterior styling, detailing and
                  personalised automotive upgrades.
                </p>
              </div>

              <span className="tm-category-brand-side">
                STYLE · DETAIL · PROTECT
              </span>
            </div>

            <div className="tm-category-grid">
              {categoryGallery
                .filter((category) => category.brand === "SHARVARI MOTORS")
                .map((category, categoryIndex) => (
                  <div className="tm-category-card" key={category.id}>
                    <div className="tm-category-card-heading">
                      <span>
                        {String(categoryIndex + 1).padStart(2, "0")}
                      </span>

                      <h4>{category.title}</h4>

                      <span className="tm-category-photo-count">
                        {category.photos.length
                          .toString()
                          .padStart(2, "0")}{" "}
                        PHOTOS
                      </span>
                    </div>

                    <div className="tm-category-photo-grid">
                      {category.photos.map((photo, photoIndex) => (
                        <div
                          className="tm-category-photo"
                          key={photo.image}
                          role="button"
                          tabIndex={0}
                          aria-label={`View larger photo of ${photo.name}`}
                          onClick={() => openGalleryPhoto(photo)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              event.preventDefault();
                              openGalleryPhoto(photo);
                            }
                          }}
                        >
                          <img
                            src={photo.image}
                            alt={`${photo.name} - ${category.title}`}
                            loading="lazy"
                          />

                          <div className="tm-category-photo-shade" />

                          <span className="tm-category-photo-number">
                            {String(photoIndex + 1).padStart(2, "0")}
                          </span>

                          <div className="tm-category-photo-caption">
                            <span>SHARVARI MOTORS</span>
                            <h5>{photo.name}</h5>
                            <p>{category.title}</p>
                          </div>

                          <span className="tm-category-photo-arrow">
                            <ArrowUpRight size={19} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* GALLERY BOTTOM LINE */}

          <div className="tm-category-gallery-footer">
            <span>BUILT AROUND EVERY VEHICLE.</span>

            <span>
              TULJA MOTORS <i>×</i> SHARVARI MOTORS
            </span>
          </div>
        </div>
      </section>

      {/* SHARVARI MOTORS SHOWCASE */}

      <section className="tm-sharvari-stats-section">
        <div className="tm-sharvari-stats-inner">
          <div className="tm-sharvari-stats-content">
            <span className="tm-section-tag" />

            <h2>
              EXPERIENCE THAT
              <br />
              MOVES WITH YOU
            </h2>

            <p>
              At Sharvari Motors, we bring together automobile experience,
              attention to detail and a passion for making every vehicle
              better. From everyday repairs to personalised upgrades, our
              focus remains on quality workmanship.
            </p>

            <Link href="/about" className="tm-outline-link">
              DISCOVER OUR STORY <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="tm-sharvari-stats-grid">
            <div className="tm-stat-card">
              <span className="tm-stat-number">7+</span>
              <span className="tm-stat-label">
                YEARS IN AUTOMOBILE TRADE
              </span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">1,500+</span>
              <span className="tm-stat-label">HAPPY CUSTOMERS</span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">1,000+</span>
              <span className="tm-stat-label">VEHICLES MODIFIED</span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">2.4L+</span>
              <span className="tm-stat-label">INSTAGRAM FOLLOWERS</span>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PROCESS */}

      <section className="tm-process-section">
        <div className="tm-process-container">
          <div className="tm-section-heading">
            <div>
              <div className="tm-section-tag">HOW WE WORK</div>
              FROM FIRST LOOK TO FINAL FINISH
            </div>
          </div>

          <div className="tm-process-grid">
            {[
              {
                number: "01",
                title: "INSPECT",
                description:
                  "We understand your vehicle's condition and identify the work required.",
                icon: <CarFront size={27} />,
              },
              {
                number: "02",
                title: "PLAN",
                description:
                  "We discuss the requirements, suitable solutions and project scope.",
                icon: <CheckCircle2 size={27} />,
              },
              {
                number: "03",
                title: "WORK",
                description:
                  "Our team carries out the agreed repair, restoration or customisation.",
                icon: <Wrench size={27} />,
              },
              {
                number: "04",
                title: "DELIVER",
                description:
                  "We complete the finishing checks and prepare your vehicle for delivery.",
                icon: <ShieldCheck size={27} />,
              },
            ].map((step) => (
              <div className="tm-process-card" key={step.number}>
                <div className="tm-process-top">
                  <span>{step.number}</span>
                  <div className="tm-process-icon">{step.icon}</div>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="tm-process-bottom-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section className="tm-faq-section" id="faq">
        <div className="tm-faq-container">
          <div className="tm-section-heading">
            <div>
              <div className="tm-section-tag">GOT QUESTIONS?</div>
              <h2>
                GOOD TO KNOW
                <br />
                BEFORE YOU VISIT
              </h2>
            </div>

            <p>
              A few helpful answers about our automobile repair and
              customisation services.
            </p>
          </div>

          <div className="tm-faq-list">
            {faqs.map((faq, index) => (
              <div
                className={`tm-faq-item ${
                  faqOpen === index ? "active" : ""
                }`}
                key={index}
              >
                <button
                  type="button"
                  className="tm-faq-question"
                  onClick={() =>
                    setFaqOpen(faqOpen === index ? -1 : index)
                  }
                  aria-expanded={faqOpen === index}
                >
                  <span className="tm-faq-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span>{faq.q}</span>

                  <span className="tm-faq-toggle">
                    {faqOpen === index ? (
                      <X size={19} />
                    ) : (
                      <ArrowUpRight size={19} />
                    )}
                  </span>
                </button>

                {faqOpen === index && (
                  <div className="tm-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}

      <section className="tm-contact-section" id="contact">
        <div className="tm-contact-container">
          <div className="tm-contact-left">
            <span className="tm-section-tag">LET'S TALK CARS</span>

            <h2>
              YOUR CAR
              <br />
              OUR <span>RESPONSBILITY</span>
            </h2>

            <p>
              Tell us what your vehicle needs. Whether it is accident repair,
              restoration, detailing or a custom upgrade, get in touch with
              our team.
            </p>

            <div className="tm-contact-details">
              <a href={`tel:${PHONE}`} className="tm-contact-detail">
                <span className="tm-contact-detail-icon">
                  <Phone size={20} />
                </span>

                <span>
                  <small>CALL US</small>
                  <strong>{PHONE}</strong>
                </span>

                <ArrowUpRight size={17} />
              </a>

              <a href={`mailto:${EMAIL}`} className="tm-contact-detail">
                <span className="tm-contact-detail-icon">
                  <Mail size={20} />
                </span>

                <span>
                  <small>EMAIL US</small>
                  <strong>{EMAIL}</strong>
                </span>

                <ArrowUpRight size={17} />
              </a>

              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tm-contact-detail"
              >
                <span className="tm-contact-detail-icon">
                  <MapPin size={20} />
                </span>

                <span>
                  <small>FIND OUR LOCATION</small>
                  <strong>GET DIRECTIONS</strong>
                </span>

                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          <div className="tm-contact-form-card">
            <div className="tm-contact-form-heading">
              <span>01 / ENQUIRY</span>
              <h3>LET'S GET STARTED</h3>
              <p>Share a few details and we will get back to you.</p>
            </div>

            <form onSubmit={handleSubmit} className="tm-contact-form">
              <div className="tm-form-row">
                <label>
                  YOUR NAME *
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  PHONE NUMBER *
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label>
                VEHICLE MODEL *
                <input
                  type="text"
                  placeholder="e.g. Mahindra Scorpio"
                  value={form.car}
                  onChange={(e) =>
                    setForm({ ...form, car: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                SERVICE REQUIRED *
                <select
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  required
                >
                  <option value="">Select a service</option>

                  {services.map((service) => (
                    <option key={service.number} value={service.title}>
                      {service.title}
                    </option>
                  ))}

                  <option value="Other enquiry">Other enquiry</option>
                </select>
              </label>

              <label>
                MESSAGE
                <textarea
                  rows={4}
                  placeholder="Tell us a little about the work required..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </label>

              <button type="submit" className="tm-contact-submit">
                SEND ENQUIRY <ArrowUpRight size={19} />
              </button>

              <p className="tm-form-note">
                By submitting this form, you agree to be contacted regarding
                your enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* MAP / DIRECTIONS */}

      <section className="tm-map-section">
        <div className="tm-map-heading">
          <div>
            <span className="tm-section-tag">COME VISIT US</span>
            <h2>FIND YOUR WAY TO US.</h2>
            <p>
              Visit Tulja Motors for professional automotive repair,
              restoration and customisation.
            </p>
          </div>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-map-directions"
          >
            OPEN DIRECTIONS <ArrowUpRight size={17} />
          </a>
        </div>

        <div className="tm-map-frame">
          <iframe
            title="Tulja Motors workshop location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=74.279622%2C16.793993%2C74.289622%2C16.803993&layer=mapnik&marker=16.798993%2C74.284622"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* SERVICE DETAILS MODAL */}

      {activeService && activeDetails && activeMedia && (
        <div
          className="tm-service-modal-overlay"
          onClick={() => setActiveService(null)}
          role="presentation"
        >
          <div
            className="tm-service-modal"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              className="tm-service-modal-close"
              onClick={() => setActiveService(null)}
              aria-label="Close service details"
            >
              <X size={23} />
            </button>

            <div className="tm-service-modal-gallery">
              <div className="tm-service-modal-image">
                <img
                  src={activeMedia.image}
                  alt={`${activeDetails.title} - First view`}
                />
                <span className="tm-service-image-label">01</span>
              </div>

              <div className="tm-service-modal-image">
                <img
                  src={activeMedia.image2}
                  alt={`${activeDetails.title} - Second view`}
                />
                <span className="tm-service-image-label">02</span>
              </div>

              <div className="tm-service-gallery-brand">
                {activeDetails.number}
              </div>
            </div>

            <div className="tm-service-modal-content">
              <span className="tm-section-tag">
                {activeDetails.number}
              </span>

              <h2>{activeDetails.title}</h2>
              <p>{activeDetails.description}</p>

              <h4>WHAT IS THIS SERVICE?</h4>
              <p>{activeDetails.what}</p>

              <h4>WHY IS IT IMPORTANT?</h4>
              <p>{activeDetails.why}</p>

              <h4>WHAT WE OFFER</h4>

              <ul>
                {activeDetails.points.map((point, index) => (
                  <li key={index}>
                    <CheckCircle2 size={17} />
                    {point}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="tm-contact-submit"
                onClick={() => {
                  const selectedTitle = activeDetails.title;

                  setActiveService(null);

                  setForm((previous) => ({
                    ...previous,
                    service: selectedTitle,
                  }));

                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ENQUIRE ABOUT THIS SERVICE
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: GALLERY PHOTO LIGHTBOX */}

      {currentGalleryPhoto && (
        <div
          className="tm-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer: ${currentGalleryPhoto.name}`}
          onClick={() => setActiveGalleryPhoto(null)}
        >
          <button
            type="button"
            className="tm-gallery-lightbox-close"
            onClick={() => setActiveGalleryPhoto(null)}
            aria-label="Close photo viewer"
          >
            <X size={25} />
          </button>

          <button
            type="button"
            className="tm-gallery-lightbox-arrow tm-gallery-lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPreviousGalleryPhoto();
            }}
            aria-label="Previous photo"
          >
            <ArrowLeft size={25} />
          </button>

          <div
            className="tm-gallery-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tm-gallery-lightbox-image-wrap">
              <img
                src={currentGalleryPhoto.image}
                alt={`${currentGalleryPhoto.name} - ${currentGalleryPhoto.category}`}
              />
            </div>

            <div className="tm-gallery-lightbox-caption">
              <div>
                <span>{currentGalleryPhoto.brand}</span>
                <h3>{currentGalleryPhoto.name}</h3>
                <p>{currentGalleryPhoto.category}</p>
              </div>

              <span className="tm-gallery-lightbox-counter">
                {String(activeGalleryPhoto! + 1).padStart(2, "0")} /{" "}
                {String(allGalleryPhotos.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="tm-gallery-lightbox-arrow tm-gallery-lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNextGalleryPhoto();
            }}
            aria-label="Next photo"
          >
            <ArrowRight size={25} />
          </button>
        </div>
      )}

      {/* GOOGLE TRANSLATE */}

      <div id="google_translate_element" className="tm-google-translate" />

      {/* FLOATING LANGUAGE SELECTOR */}

      <div className="tm-language-widget">
        {languageOpen && (
          <div className="tm-language-menu">
            <div className="tm-language-menu-heading">
              <Languages size={17} />
              <span>SELECT LANGUAGE</span>
            </div>

            {languages.map((language) => (
              <button
                type="button"
                key={language.code}
                className={
                  selectedLanguage === language.code ? "active" : ""
                }
                onClick={() => changeLanguage(language.code)}
              >
                <span>{language.native}</span>

                {selectedLanguage === language.code && (
                  <CheckCircle2 size={16} />
                )}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="tm-language-toggle"
          onClick={() => setLanguageOpen(!languageOpen)}
          aria-label="Change website language"
        >
          {languageOpen ? <X size={22} /> : <Languages size={22} />}
        </button>
      </div>
    </main>
  );
}