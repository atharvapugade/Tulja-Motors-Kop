
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, Wrench, ShieldCheck, CarFront, Paintbrush,
  Sparkles, CheckCircle2, MessageCircle, Languages, X,
} from "lucide-react";
import "./home-page.css";

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
  "https://www.google.com/maps/search/?api=1&query=16.783019595807485%2C74.28685209367279";

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

/* BEFORE / AFTER PROJECT SLIDER */

const beforeAfterProjects = [
  {
    number: "01", slug: "scorpio-restoration",
    brand: "TULJA MOTORS", vehicle: "MAHINDRA SCORPIO",
    title: "SCORPIO RESTORATION",
    service: "ACCIDENT REPAIR & RESTORATION",
    beforeImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "02", slug: "tata-nexon-repair",
    brand: "TULJA MOTORS", vehicle: "TATA NEXON",
    title: "NEXON BODY REPAIR",
    service: "DENTING, PAINTING & BODY WORK",
    beforeImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "03", slug: "mahindra-thar-customisation",
    brand: "SHARVARI MOTORS", vehicle: "MAHINDRA THAR",
    title: "THAR CUSTOMISATION",
    service: "EXTERIOR STYLING & MODIFICATION",
    beforeImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "04", slug: "hyundai-creta-detailing",
    brand: "SHARVARI MOTORS", vehicle: "HYUNDAI CRETA",
    title: "CRETA DETAILING",
    service: "PAINT CORRECTION & COATING",
    beforeImage: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "05", slug: "kia-seltos-interior",
    brand: "SHARVARI MOTORS", vehicle: "KIA SELTOS",
    title: "SELTOS INTERIOR UPGRADE",
    service: "INTERIOR MODIFICATION",
    beforeImage: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "06", slug: "maruti-swift-restoration",
    brand: "TULJA MOTORS", vehicle: "MARUTI SUZUKI SWIFT",
    title: "SWIFT RESTORATION",
    service: "CAR RENOVATION & REPAINTING",
    beforeImage: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1400&q=90",
    afterImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=90",
  },
];

/* SERVICES */

const services = [
  { number: "01", brand: "TULJA MOTORS", title: "Accident Repair & Body Work", description: "Professional repair solutions for accident damage, panels, bumpers and vehicle bodywork.", href: "#accident-repair" },
  { number: "02", brand: "TULJA MOTORS", title: "Denting & Painting", description: "Restore damaged panels with dent removal, scratch repair and colour-matched paintwork.", href: "#denting-painting" },
  { number: "03", brand: "SHARVARI MOTORS", title: "Ceramic & Graphene Coating", description: "Enhance your car's gloss and surface protection with professional coating options.", href: "#ceramic-coating" },
  { number: "04", brand: "SHARVARI MOTORS", title: "PPF & Vinyl Wrap", description: "Protect and personalise your vehicle with PPF, vinyl wraps and chrome delete.", href: "#ppf-wrap" },
  { number: "05", brand: "SHARVARI MOTORS", title: "Interior Modification", description: "Upgrade your cabin with custom upholstery, ambient lighting and premium accessories.", href: "#interior-modification" },
  { number: "06", brand: "SHARVARI MOTORS", title: "Exterior Modification", description: "Give your vehicle a distinctive look with styling upgrades and exterior accessories.", href: "#exterior-modification" },
  { number: "07", brand: "SHARVARI MOTORS", title: "Interior & Exterior Detailing", description: "Bring back a fresh finish with deep cleaning, polishing and detailed vehicle care.", href: "#detailing" },
  { number: "08", brand: "TULJA MOTORS", title: "Mechanical Work", description: "Vehicle maintenance and inspection for brakes, suspension, AC and electrical systems.", href: "#mechanical" },
  { number: "09", brand: "TULJA MOTORS", title: "Car Renovation & Restoration", description: "Give older vehicles a refreshed appearance with planned body, paint and interior work.", href: "#restoration" },
];

type ServiceMedia = {
  image: string;
  image2: string;
  cars: string;
};

const serviceMedia: Record<string, ServiceMedia> = {
  "accident-repair": { image: "/images/services/accident-repair.jpg", image2: "/images/services/accident-repair-2.jpg", cars: "MAHINDRA SCORPIO · TATA NEXON" },
  "denting-painting": { image: "/images/services/denting-painting.jpg", image2: "/images/services/denting-painting-2.jpg", cars: "TATA NEXON · MARUTI SWIFT" },
  "ceramic-coating": { image: "/images/services/ceramic-coating.jpg", image2: "/images/services/ceramic-coating-2.jpg", cars: "HYUNDAI CRETA · TOYOTA FORTUNER" },
  "ppf-wrap": { image: "/images/services/ppf-wrap.jpg", image2: "/images/services/ppf-wrap-2.jpg", cars: "MAHINDRA THAR · TATA HARRIER" },
  "interior-modification": { image: "/images/services/interior-modification.jpg", image2: "/images/services/interior-modification-2.jpg", cars: "KIA SELTOS · HYUNDAI CRETA" },
  "exterior-modification": { image: "/images/services/exterior-modification.jpg", image2: "/images/services/exterior-modification-2.jpg", cars: "MAHINDRA THAR · SCORPIO-N" },
  detailing: { image: "/images/services/detailing.jpg", image2: "/images/services/detailing-2.jpg", cars: "MARUTI BREZZA · HONDA CITY" },
  mechanical: { image: "/images/services/mechanical.jpg", image2: "/images/services/mechanical-2.jpg", cars: "TOYOTA INNOVA · MARUTI ERTIGA" },
  restoration: { image: "/images/services/restoration.jpg", image2: "/images/services/restoration-2.jpg", cars: "AMBASSADOR · MARUTI 800" },
};

/* SERVICE POPUP CONTENT */

const detailedServices = [
  {
    id: "accident-repair", number: "01 / TULJA MOTORS", title: "Accident Repair & Body Work",
    what: "Accident repair restores damaged vehicle body parts after a collision. The work may involve damaged panels, bumpers, lamps, mounting points and body alignment.",
    why: "Accident damage can affect the appearance, fitment and safe operation of vehicle components. A proper inspection helps identify visible and hidden damage before repair work begins.",
    description: "अपघातानंतर कारच्या बॉडी, पॅनेल आणि बाह्य भागांची तपासणी करून आवश्यक दुरुस्ती व फिटमेंट केली जाते.",
    points: ["Vehicle damage inspection", "Panel repair or replacement", "Bumper repair and fitment", "Body alignment checks", "Headlamp and tail-lamp fitment", "Final repair quality check"],
  },
  {
    id: "denting-painting", number: "02 / TULJA MOTORS", title: "Denting, Painting & Repainting",
    what: "Denting and painting involves repairing dents, scratches and damaged paint surfaces, followed by suitable refinishing of the affected panels.",
    why: "It helps improve the vehicle's appearance, address surface damage and refresh faded or damaged paintwork.",
    description: "डेंट, स्क्रॅच, पेंट फेडिंग किंवा पॅनेलवरील नुकसान दुरुस्त करून योग्य रंगाशी जुळणारा पेंट फिनिश देण्याची सेवा.",
    points: ["Minor dent removal", "Panel denting", "Scratch and paint correction", "Colour matching", "Panel repainting", "Full body repainting estimate"],
  },
  {
    id: "ceramic-coating", number: "03 / SHARVARI MOTORS", title: "Ceramic, Graphene & Paint Coating",
    what: "Ceramic and graphene coating are paint-protection treatments applied to a properly prepared exterior surface to provide gloss and water-repellent properties.",
    why: "These coatings can make routine cleaning easier and help maintain the vehicle's finish. Results and durability depend on the product, preparation and maintenance.",
    description: "पेंटची योग्य तयारी, आवश्यक असल्यास polishing आणि त्यानंतर coating लावून gloss व water-repellent finish वाढवण्याची प्रक्रिया.",
    points: ["Exterior wash and decontamination", "Paint surface inspection", "Machine polishing options", "Ceramic coating application", "Graphene coating options", "Curing and care guidance"],
  },
  {
    id: "ppf-wrap", number: "04 / SHARVARI MOTORS", title: "PPF, Vinyl Wrap & Chrome Delete",
    what: "PPF is a protective film applied to selected painted surfaces. Vinyl wrap and chrome delete use specialised films to change the vehicle's exterior appearance.",
    why: "PPF can help protect covered areas from everyday surface wear. Wraps offer styling choices such as gloss, matte and contrasting roof finishes.",
    description: "Paint Protection Film हा transparent protective film पर्याय आहे. Vinyl wrap किंवा chrome delete द्वारे कारचा बाह्य लूक बदलता येतो.",
    points: ["Full or partial PPF options", "Bonnet and bumper protection", "Door edge and handle protection", "Gloss or matte wrap options", "Roof wrap", "Chrome delete styling"],
  },
  {
    id: "interior-modification", number: "05 / SHARVARI MOTORS", title: "Interior Modification & Accessories",
    what: "Interior modification includes cabin styling, upholstery changes, lighting upgrades and accessories selected to suit the vehicle.",
    why: "It helps personalise the cabin, refresh worn interiors and add convenience or visual features according to the owner's preferences.",
    description: "कारच्या cabin ला नवीन theme आणि personal look देण्यासाठी upholstery, lighting व interior accessories चे पर्याय.",
    points: ["Custom seat covers", "Dashboard and door-pad styling", "7D floor mat options", "Ambient lighting", "Starlight roof options", "Steering and interior trims"],
  },
  {
    id: "exterior-modification", number: "06 / SHARVARI MOTORS", title: "Exterior Modification & Styling",
    what: "Exterior modification includes selected cosmetic upgrades such as body kits, spoilers, grille changes, lighting and compatible accessories.",
    why: "These upgrades allow owners to personalise their vehicle's appearance and choose a styling theme that suits their preferences.",
    description: "कारच्या बाह्य रूपात बदल करण्यासाठी model-compatible styling accessories आणि cosmetic upgrades चे पर्याय.",
    points: ["Body kit and spoiler options", "Grille and bumper styling", "Alloy wheel options", "Lighting upgrades", "Roof and body wrap", "Model-specific accessories"],
  },
  {
    id: "detailing", number: "07 / SHARVARI MOTORS", title: "Interior & Exterior Detailing",
    what: "Detailing is a more thorough cleaning and finishing process for the vehicle's exterior paint, glass, wheels, trims and interior cabin.",
    why: "It helps remove accumulated dirt, refresh interior surfaces and improve the overall presentation of the vehicle.",
    description: "कारच्या बाहेरील पेंट आणि आतील cabin ची खोलवर स्वच्छता, finishing आणि योग्य care products वापरून detailing.",
    points: ["Premium exterior wash", "Paint decontamination", "Machine polishing options", "Dashboard and trim cleaning", "Seat and carpet cleaning options", "Glass and wheel cleaning"],
  },
  {
    id: "mechanical", number: "08 / TULJA MOTORS", title: "Mechanical Work & General Service",
    what: "Mechanical work involves inspecting and addressing vehicle systems such as brakes, suspension, air conditioning and electrical components.",
    why: "Regular checks can help identify wear or developing faults and support reliable day-to-day vehicle operation.",
    description: "नियमित देखभाल आणि वाहनातील समस्या तपासण्यासाठी आवश्यक mechanical inspection व repair services.",
    points: ["General service checks", "Brake inspection", "Suspension checks", "AC inspection", "Battery and electrical checks", "Wheel alignment coordination"],
  },
  {
    id: "restoration", number: "09 / TULJA MOTORS", title: "Car Renovation & Restoration",
    what: "Vehicle restoration is a planned combination of repair and refurbishment work to refresh an older or worn vehicle.",
    why: "It helps owners improve the appearance and condition of an existing vehicle while planning the work according to its age, condition and budget.",
    description: "जुन्या किंवा थकलेल्या कारसाठी body, paint, interior आणि आवश्यक mechanical कामाचा टप्प्याटप्प्याने restoration plan.",
    points: ["Vehicle condition assessment", "Body repair planning", "Paint refresh or repainting", "Interior refresh options", "Trim and accessory renewal", "Final inspection"],
  },
];

/* GALLERY */

const galleryProjects = [
  { id: 1, title: "Accident Repair & Restoration", vehicle: "MAHINDRA SCORPIO", brand: "TULJA MOTORS", category: "Accident Repair", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=90", description: "Automotive bodywork and restoration inspiration." },
  { id: 2, title: "Premium Paint Finish", vehicle: "TATA NEXON", brand: "TULJA MOTORS", category: "Denting & Painting", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=90", description: "Paintwork and exterior finish inspiration." },
  { id: 3, title: "Ceramic Coating", vehicle: "HYUNDAI CRETA", brand: "SHARVARI MOTORS", category: "Detailing", image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1600&q=90", description: "Gloss enhancement and paint protection inspiration." },
  { id: 4, title: "Luxury Interior Styling", vehicle: "KIA SELTOS", brand: "SHARVARI MOTORS", category: "Interior Modification", image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1600&q=90", description: "Premium cabin styling and interior design inspiration." },
  { id: 5, title: "Exterior Styling", vehicle: "MAHINDRA THAR", brand: "SHARVARI MOTORS", category: "Exterior Modification", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=90", description: "Exterior styling and modification inspiration." },
  { id: 6, title: "Professional Detailing", vehicle: "TOYOTA FORTUNER", brand: "SHARVARI MOTORS", category: "Detailing", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=90", description: "Exterior detailing and vehicle care inspiration." },
  { id: 7, title: "Automotive Workshop", vehicle: "MULTI-BRAND", brand: "TULJA MOTORS", category: "Mechanical Work", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=90", description: "Professional automotive workshop environment." },
  { id: 8, title: "Premium Car Finish", vehicle: "LUXURY AUTOMOTIVE", brand: "SHARVARI MOTORS", category: "PPF & Wrap", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=90", description: "Vehicle protection and styling inspiration." },
  { id: 9, title: "Vehicle Restoration", vehicle: "MARUTI SUZUKI", brand: "TULJA MOTORS", category: "Restoration", image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1600&q=90", description: "Bodywork and vehicle restoration inspiration." },
];

const galleryCategories = [
  "All Projects", "Accident Repair", "Denting & Painting", "Detailing",
  "Interior Modification", "Exterior Modification", "PPF & Wrap",
  "Mechanical Work", "Restoration",
];

/* CAR BRAND LOGOS — ALL PNG */

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

/* HOME PAGE */

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeProject, setActiveProject] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [galleryCategory, setGalleryCategory] = useState("All Projects");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  const filteredGallery = galleryProjects
    .map((project, index) => ({ ...project, originalIndex: index }))
    .filter((project) =>
      galleryCategory === "All Projects" || project.category === galleryCategory
    );

  const selectedGallery = selectedGalleryIndex !== null
    ? galleryProjects[selectedGalleryIndex]
    : null;

  const currentProject = beforeAfterProjects[activeProject];
  const activeDetails = detailedServices.find((item) => item.id === activeService) ?? null;
  const activeCard = services.find((item) => item.href === `#${activeService}`) ?? null;
  const activeMedia = activeService ? serviceMedia[activeService] : null;

  const [form, setForm] = useState({
    name: "", phone: "", car: "", service: "", message: "",
  });

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

    const existingScript = document.getElementById("google-translate-script") as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, []);

  /* AUTOMATIC PROJECT SLIDER */

  useEffect(() => {
    if (sliderPaused) return;
    const interval = window.setInterval(() => {
      setActiveProject((current) => (current + 1) % beforeAfterProjects.length);
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

  /* GALLERY LIGHTBOX */

  useEffect(() => {
    if (selectedGalleryIndex === null) return;

    const handleGalleryKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGalleryIndex(null);
      if (event.key === "ArrowRight") {
        setSelectedGalleryIndex((current) =>
          current === null ? null : (current + 1) % galleryProjects.length
        );
      }
      if (event.key === "ArrowLeft") {
        setSelectedGalleryIndex((current) =>
          current === null ? null : (current - 1 + galleryProjects.length) % galleryProjects.length
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleGalleryKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleGalleryKeys);
    };
  }, [selectedGalleryIndex]);

  const showPreviousProject = () => {
    setActiveProject((current) =>
      current === 0 ? beforeAfterProjects.length - 1 : current - 1
    );
  };

  const showNextProject = () => {
    setActiveProject((current) => (current + 1) % beforeAfterProjects.length);
  };

  const changeLanguage = (languageCode: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;

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

      {/* TOP AUTOMOTIVE ADVERTISEMENT SLIDER */}

      <section className="tm-before-after-section" id="home">
        <div className="tm-ba-wrap">
          <div
            className="tm-ba-slider"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
            onFocus={() => setSliderPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSliderPaused(false);
            }}
          >
            <Link
              href={`/projects/${currentProject.slug}`}
              className="tm-ba-banner"
              aria-label={`View ${currentProject.title} project details`}
              key={currentProject.slug}
            >
              <div className="tm-ba-image tm-ba-before">
                <img src={currentProject.beforeImage} alt={`${currentProject.vehicle} before work — illustrative image`} />
                <span className="tm-ba-label">BEFORE</span>
              </div>
              <div className="tm-ba-image tm-ba-after">
                <img src={currentProject.afterImage} alt={`${currentProject.vehicle} after work — illustrative image`} />
                <span className="tm-ba-label">AFTER</span>
              </div>
              <div className="tm-ba-divider"><span>↔</span></div>
              <div className="tm-ba-bottom">
                <div>
                  <small>{currentProject.brand} <span>·</span> {currentProject.vehicle}</small>
                  <h3>{currentProject.title}</h3>
                  <span className="tm-ba-service">{currentProject.service}</span>
                </div>
                <span className="tm-ba-open">VIEW PROJECT <ArrowUpRight size={19} /></span>
              </div>
            </Link>

            <div className="tm-ba-controls">
              <div className="tm-ba-slide-info">
                <span className="tm-ba-current-number">{currentProject.number}</span>
                <span className="tm-ba-slide-line" />
                <span className="tm-ba-current-name">{currentProject.vehicle}</span>
              </div>
              <div className="tm-ba-arrows">
                <button type="button" onClick={showPreviousProject} aria-label="Previous project" className="tm-ba-arrow">
                  <ArrowLeft size={19} />
                </button>
                <button type="button" onClick={showNextProject} aria-label="Next project" className="tm-ba-arrow tm-ba-arrow-next">
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
                  className={activeProject === index ? "tm-ba-dot active" : "tm-ba-dot"}
                  aria-label={`Show project ${index + 1}: ${project.vehicle}`}
                  aria-current={activeProject === index ? "true" : undefined}
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
              <span>ACCIDENT REPAIR</span><i>✳</i>
              <span>DENTING & PAINTING</span><i>✳</i>
              <span>CAR RESTORATION</span><i>✳</i>
              <span>CERAMIC COATING</span><i>✳</i>
              <span>PPF & WRAPPING</span><i>✳</i>
              <span>CAR CUSTOMISATION</span><i>✳</i>
            </div>
          ))}
        </div>
      </div>

      {/* TWO BRANDS */}

      <section className="tm-section tm-brands-section" id="about">
        <div className="tm-wrap">
          <div className="tm-brand-showcase">
            <article className="tm-brand-showcase-card">
              <div className="tm-showcase-logo tm-tulja-logo">
                <img src="/tulja-motors-logo.png" alt="Tulja Motors" />
              </div>
              <div className="tm-showcase-info">
                <span className="tm-showcase-label">REPAIR · RESTORE · REBUILD</span>
                <p>Complete automotive care specialising in accident repairs, denting, painting, mechanical work and vehicle restoration.</p>
              </div>
            </article>

            <article className="tm-brand-showcase-card">
              <div className="tm-showcase-logo tm-sharvari-logo">
                <svg viewBox="0 0 420 150" role="img" aria-labelledby="sharvariLogoTitle">
                  <title id="sharvariLogoTitle">Sharvari Motors</title>
                  <text x="15" y="83" fill="#086565" fontSize="72" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-4">SHARVARI</text>
                  <path d="M270 12 L295 12 L263 92 L238 92 Z" fill="#FFC21B" />
                  <path d="M245 101 H390" stroke="#086565" strokeWidth="13" strokeLinecap="square" />
                  <text x="18" y="126" fill="#086565" fontSize="21" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="12">MOTORS</text>
                </svg>
              </div>
              <div className="tm-showcase-info">
                <span className="tm-showcase-label">STYLE · CUSTOMISE · PROTECT</span>
                <p>Personalise your vehicle with premium detailing, ceramic coating, PPF, interior upgrades and exterior customisation.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section className="tm-section tm-services-section" id="services">
        <div className="tm-wrap">
          <div className="tm-services-heading">
            <span>WHAT WE DO / OUR SERVICES</span>
            <h2>COMPLETE CARE. <em>DISTINCT CRAFT.</em></h2>
            <p>
              Explore repair, restoration, detailing and customisation options for your vehicle.
              Select any service to understand the work involved.
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
                    <img src={media.image} alt={`${service.title} — ${media.cars}`} loading="lazy" />
                    <span className="tm-svc-card-number">{service.number}</span>
                    <span className="tm-svc-card-car">{media.cars}</span>
                    <span className="tm-svc-card-brand">{service.brand}</span>
                  </span>
                  <span className="tm-svc-card-body">
                    <span className="tm-svc-card-title">{service.title}</span>
                    <span className="tm-svc-card-text">{service.description}</span>
                    <span className="tm-svc-card-action">VIEW DETAILS <ArrowUpRight size={16} /></span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="tm-service-note">
            <span>PLEASE NOTE</span>
            Service availability, materials, products, pricing and estimated completion time are confirmed after vehicle inspection and discussion.
            Images are illustrative stock photos, not verified photographs of completed workshop jobs.
          </div>
        </div>
      </section>

      {/* PREMIUM AUTOMOTIVE PROJECT GALLERY */}

      <section className="tm-section tm-premium-gallery-section" id="work">
        <div className="tm-wrap">
          <div className="tm-premium-gallery-heading">
            <div>
              <div className="tm-section-tag">AUTOMOTIVE SHOWCASE</div>
              <h2>
                CRAFTED FOR
                <br />
                THE <span>DRIVE.</span>
              </h2>
            </div>

            <div className="tm-premium-gallery-intro">
              <p>
                Explore automotive repair, restoration, detailing and
                customisation inspiration across our two specialist divisions.
              </p>
              <div className="tm-gallery-count">
                <strong>{String(filteredGallery.length).padStart(2, "0")}</strong>
                <span>VISUAL SHOWCASE</span>
              </div>
            </div>
          </div>

          <div className="tm-premium-gallery-filters">
            {galleryCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={galleryCategory === category ? "tm-gallery-filter active" : "tm-gallery-filter"}
                onClick={() => setGalleryCategory(category)}
              >
                {category}
                {galleryCategory === category && <span className="tm-gallery-filter-dot" />}
              </button>
            ))}
          </div>

          <div className="tm-premium-gallery-grid">
            {filteredGallery.map((project, index) => (
              <button
                type="button"
                key={project.id}
                className={`tm-premium-gallery-item tm-premium-gallery-item-${index % 6}`}
                onClick={() => setSelectedGalleryIndex(project.originalIndex)}
                aria-label={`Open ${project.title}`}
              >
                <img
                  src={project.image}
                  alt={`${project.title} — illustrative automotive image`}
                  loading="lazy"
                />
                <span className="tm-gallery-shade" />
                <span className="tm-gallery-topline">
                  <span>{project.brand}</span>
                  <span>{String(project.id).padStart(2, "0")}</span>
                </span>
                <span className="tm-gallery-card-info">
                  <span className="tm-gallery-category">{project.category}</span>
                  <strong>{project.title}</strong>
                  <span className="tm-gallery-vehicle">{project.vehicle}</span>
                </span>
                <span className="tm-gallery-open"><ArrowUpRight size={21} /></span>
              </button>
            ))}
          </div>

          <div className="tm-premium-gallery-footer">
            <span>REPAIR. RESTORE. REDEFINE.</span>
            <p>
              Gallery images are illustrative stock photography, not verified
              photographs of completed Tulja Motors or Sharvari Motors projects.
              Actual work examples can be added as workshop photographs become
              available.
            </p>
          </div>
        </div>
      </section>

      {/* INDIAN CAR BRAND LOGO MARQUEE */}

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
                  <div className="tm-brand-marquee-item" key={brand.name} title={brand.name}>
                    <img
                      src={brand.logo}
                      alt={repeatIndex === 0 ? `${brand.name} logo` : ""}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHARVARI MOTORS EXPERIENCE STATS */}

      <section className="tm-sharvari-stats-section">
        <div className="tm-sharvari-stats-inner">
          <div className="tm-sharvari-stats-heading">
            <span>SHARVARI MOTORS</span>
            <h2>EXPERIENCE THAT <em>DRIVES CONFIDENCE.</em></h2>
          </div>

          <div className="tm-sharvari-stats-grid">
            <div className="tm-sharvari-stat">
              <h3>7<span>+</span></h3>
              <p>Years in the automobile trade</p>
            </div>
            <div className="tm-sharvari-stat">
              <h3>1,500<span>+</span></h3>
              <p>Happy customers across Maharashtra</p>
            </div>
            <div className="tm-sharvari-stat">
              <h3>1,000<span>+</span></h3>
              <p>Vehicles modified</p>
            </div>
            <div className="tm-sharvari-stat">
              <h3>2.4L<span>+</span></h3>
              <p>Instagram followers</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}

      <section className="tm-section tm-process-section">
        <div className="tm-wrap">
          <div className="tm-section-heading">
            <div>
              <div className="tm-section-tag">HOW IT WORKS</div>
              <h2>
                FOUR STEPS.
                <br />
                ZERO GUESSWORK.
              </h2>
            </div>
            <p>Enquiry पासून delivery पर्यंत सोपी आणि स्पष्ट प्रक्रिया.</p>
          </div>

          <div className="tm-process-grid">
            {[
              ["01", "Tell Us", "Car model, photos आणि service requirement पाठवा."],
              ["02", "Inspect", "Vehicle तपासणी आणि estimate समजून घ्या."],
              ["03", "Book", "काम व वेळ निश्चित करून appointment घ्या."],
              ["04", "Drive Away", "काम पूर्ण झाल्यावर car तपासून delivery घ्या."],
            ].map(([number, title, description]) => (
              <article key={number}>
                <strong>{number}</strong>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}

      <section className="tm-section tm-why-section">
        <div className="tm-wrap">
          <div className="tm-section-heading">
            <div>
              <div className="tm-section-tag">THE DIFFERENCE</div>
              <h2 className="tm-difference-title">
                BUILT AROUND <span>YOUR VEHICLE.</span>
              </h2>
            </div>
            <p>A considered approach to repair, restoration and customisation.</p>
          </div>

          <div className="tm-why-grid">
            <article>
              <CarFront />
              <h3>10,000 SQ FT</h3>
              <p>Planned workshop space for automotive operations.</p>
            </article>
            <article>
              <Wrench />
              <h3>MODERN WORKSHOP</h3>
              <p>Workshop setup planned around multiple automotive needs.</p>
            </article>
            <article>
              <ShieldCheck />
              <h3>MULTI-BRAND APPROACH</h3>
              <p>Service enquiries for a wide range of vehicle brands.</p>
            </article>
            <article>
              <Paintbrush />
              <h3>TWO SPECIALIST DIVISIONS</h3>
              <p>Repair and restoration alongside styling and detailing.</p>
            </article>
            <article>
              <Sparkles />
              <h3>PERSONALISED OPTIONS</h3>
              <p>Discuss the finish and upgrades you want for your car.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section className="tm-section tm-faq-section">
        <div className="tm-wrap tm-faq-layout">
          <div>
            <div className="tm-section-tag">NEED TO KNOW</div>
            <h2>
              YOUR QUESTIONS.
              <br />
              ANSWERED.
            </h2>
            <p>Have another question about your car? Contact our team directly.</p>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="tm-btn tm-btn-teal"
            >
              ASK ON WHATSAPP <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="tm-faq-list">
            {faqs.map((faq, index) => (
              <article className="tm-faq-item" key={faq.q}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  aria-expanded={faqOpen === index}
                >
                  <span>{faq.q}</span>
                  <span>{faqOpen === index ? "−" : "+"}</span>
                </button>
                {faqOpen === index && <p>{faq.a}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}

      <section className="tm-section tm-contact-section" id="contact">
        <div className="tm-wrap">
          <div className="tm-contact-panel">
            <div className="tm-contact-grid">
              <div className="tm-contact-info">
                <div className="tm-eyebrow">COME SAY HELLO</div>
                <h2>
                  LET&apos;S MAKE
                  <br />
                  YOUR CAR BETTER.
                </h2>

                <div className="tm-contact-detail">
                  <MapPin />
                  <div>
                    <b>VISIT OUR LOCATION</b>
                    <p>
                      Tulja Motors &amp; Sharvari Motors,
                      <br />
                      Pune Bengaluru National Highway NH 48,
                      <br />
                      Near Shetimal Petrol Pump, Top Sambhapur,
                      <br />
                      Kolhapur, Maharashtra – 416122
                    </p>
                  </div>
                </div>

                <div className="tm-contact-detail">
                  <Phone />
                  <div>
                    <b>CALL OUR TEAM</b>
                    <p><a href={`tel:+91${PHONE}`}>+91 91301 29205</a></p>
                  </div>
                </div>

                <div className="tm-contact-detail">
                  <Mail />
                  <div>
                    <b>EMAIL US</b>
                    <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
                  </div>
                </div>

                <div className="tm-actions">
                  <a href={`tel:+91${PHONE}`} className="tm-btn tm-btn-yellow">
                    CALL NOW <Phone size={15} />
                  </a>
                  <button
                    type="button"
                    className="tm-btn tm-btn-outline"
                    onClick={() => openWhatsApp("Hello Tulja Motors, I want to enquire.")}
                  >
                    WHATSAPP <MessageCircle size={15} />
                  </button>
                </div>
              </div>

              <div className="tm-contact-form-area">
                <div className="tm-form-heading">
                  <span>START A CONVERSATION</span>
                  <h3>Tell us about your car.</h3>
                  <p>Fill in the details and continue on WhatsApp.</p>
                </div>

                <form className="tm-contact-form" onSubmit={handleSubmit}>
                  <label>
                    YOUR NAME
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </label>

                  <label>
                    PHONE NUMBER
                    <input
                      required
                      type="tel"
                      pattern="[0-9+\s-]{10,15}"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </label>

                  <label>
                    CAR MODEL
                    <input
                      value={form.car}
                      onChange={(e) => setForm({ ...form, car: e.target.value })}
                      placeholder="e.g. Tata Nexon"
                    />
                  </label>

                  <label>
                    SERVICE REQUIRED
                    <select
                      required
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
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

                  <label className="tm-form-full">
                    MESSAGE
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you need..."
                    />
                  </label>

                  <button type="submit" className="tm-btn tm-btn-yellow tm-form-submit">
                    SEND ENQUIRY ON WHATSAPP <ArrowUpRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <a className="tm-map-card" href={MAP_URL} target="_blank" rel="noreferrer">
            <div className="tm-map-icon"><MapPin size={32} /></div>
            <div>
              <span>FIND OUR WORKSHOP</span>
              <h3>NH 48 · Top Sambhapur · Kolhapur</h3>
              <p>Open directions in Google Maps</p>
            </div>
            <ArrowUpRight className="tm-map-arrow" />
          </a>
        </div>
      </section>

      {/* PREMIUM GALLERY IMAGE LIGHTBOX */}

      {selectedGallery && selectedGalleryIndex !== null && (
        <div
          className="tm-gallery-lightbox"
          onClick={() => setSelectedGalleryIndex(null)}
          role="presentation"
        >
          <button
            type="button"
            className="tm-gallery-lightbox-close"
            onClick={() => setSelectedGalleryIndex(null)}
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          <div
            className="tm-gallery-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label={selectedGallery.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tm-gallery-lightbox-image">
              <img
                src={selectedGallery.image}
                alt={`${selectedGallery.title} — illustrative automotive image`}
              />

              <button
                type="button"
                className="tm-gallery-lightbox-prev"
                onClick={() => setSelectedGalleryIndex((current) =>
                  current === null ? null : (current - 1 + galleryProjects.length) % galleryProjects.length
                )}
                aria-label="Previous gallery image"
              >
                <ChevronLeft size={27} />
              </button>

              <button
                type="button"
                className="tm-gallery-lightbox-next"
                onClick={() => setSelectedGalleryIndex((current) =>
                  current === null ? null : (current + 1) % galleryProjects.length
                )}
                aria-label="Next gallery image"
              >
                <ChevronRight size={27} />
              </button>

              <span className="tm-gallery-lightbox-counter">
                {String(selectedGalleryIndex + 1).padStart(2, "0")}
                <i />
                {String(galleryProjects.length).padStart(2, "0")}
              </span>
            </div>

            <div className="tm-gallery-lightbox-info">
              <span>{selectedGallery.brand}</span>
              <h3>{selectedGallery.title}</h3>
              <p>{selectedGallery.vehicle}</p>
              <div>{selectedGallery.category}</div>
              <small>Illustrative stock image — not a verified workshop project.</small>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE DETAILS POPUP */}

      {activeDetails && activeCard && (
        <div className="tm-modal-backdrop" onClick={() => setActiveService(null)}>
          <div
            className="tm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tm-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="tm-modal-close"
              onClick={() => setActiveService(null)}
              aria-label="Close service details"
            >
              <X size={20} />
            </button>

            <div className="tm-modal-photos">
              {activeMedia && (
                <>
                  <img src={activeMedia.image} alt={`${activeCard.title} — ${activeMedia.cars}`} />
                  <img src={activeMedia.image2} alt={`${activeCard.title} work example`} />
                </>
              )}
            </div>

            <div className="tm-modal-content">
              <span className="tm-modal-tag">{activeDetails.number}</span>
              <h3 id="tm-modal-title">{activeDetails.title}</h3>
              <p className="tm-modal-local">{activeDetails.description}</p>

              <div className="tm-modal-blocks">
                <div>
                  <span>01 / WHAT IS THIS SERVICE?</span>
                  <p>{activeDetails.what}</p>
                </div>
                <div>
                  <span>02 / WHY IS IT DONE? (BENEFITS)</span>
                  <p>{activeDetails.why}</p>
                </div>
              </div>

              <span className="tm-modal-label">03 / HOW WE DO IT</span>
              <ul className="tm-modal-steps">
                {activeDetails.points.map((point, index) => (
                  <li key={point}>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <span>{point}</span>
                    <CheckCircle2 size={16} />
                  </li>
                ))}
              </ul>

              <div className="tm-modal-footer">
                <p>Final work, products and price are confirmed after vehicle inspection.</p>
                <button
                  type="button"
                  className="tm-btn tm-btn-teal"
                  onClick={() => openWhatsApp(
                    `Hello Tulja Motors / Sharvari Motors,\n\nI want to enquire about: ${activeCard.title}\nCar model: \nPlease share the process, available options and an estimate.`
                  )}
                >
                  ENQUIRE ON WHATSAPP <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN GOOGLE TRANSLATE ENGINE */}

      <div
        id="google_translate_element"
        className="tm-google-translate"
        aria-hidden="true"
      />

      {/* FLOATING LANGUAGE SELECTOR */}

      <div className="tm-language-widget">
        {languageOpen && (
          <div className="tm-language-menu">
            <div className="tm-language-heading">
              <div>
                <span>WEBSITE LANGUAGE</span>
                <h3>Choose Language</h3>
              </div>
              <button
                type="button"
                onClick={() => setLanguageOpen(false)}
                aria-label="Close language menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tm-language-options">
              {languages.map((language) => (
                <button
                  type="button"
                  key={language.code}
                  className={selectedLanguage === language.code ? "tm-language-option active" : "tm-language-option"}
                  onClick={() => changeLanguage(language.code)}
                >
                  <span>{language.native}</span>
                  <small>{language.name}</small>
                  {selectedLanguage === language.code && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
            <p className="tm-language-note">Translation powered by Google.</p>
          </div>
        )}

        <button
          type="button"
          className="tm-language-trigger"
          onClick={() => setLanguageOpen((open) => !open)}
          aria-label="Choose website language"
          aria-expanded={languageOpen}
        >
          <Languages size={23} />
        </button>
      </div>
    </main>
  );
}
