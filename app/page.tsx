"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  CarFront,
  Wrench,
  Paintbrush,
  Settings,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  ChevronDown,
  BadgeCheck,
  Ruler,
} from "lucide-react";

import "./home-page.css";

const PHONE_NUMBER = "9130129205";
const WHATSAPP_NUMBER = "919130129205";

const generalWhatsAppMessage = encodeURIComponent(
  "Hello Tulja Motors, I would like to enquire about your multi-brand automotive workshop in Kolhapur."
);

const services = [
  {
    number: "01",
    title: "Accident Repair",
    description:
      "Professional collision damage repair and vehicle body restoration.",
    icon: CarFront,
    image: "/images/services/Accident%20Repair.jpg",
    alt: "Indian car undergoing accident repair and restoration",
    vehicle: "ACCIDENT REPAIR",
  },
  {
    number: "02",
    title: "Denting & Painting",
    description:
      "Expert dent removal, panel work and quality paint finishing.",
    icon: Paintbrush,
    image:
      "https://www.team-bhp.com/sites/default/files/styles/amp_high_res/public/nexon_1.jpeg",
    alt: "Tata Nexon showing bodywork damage",
    vehicle: "BODY & PAINT",
  },
  {
    number: "03",
    title: "Car Restoration",
    description:
      "Bring your vehicle back to life with complete restoration solutions.",
    icon: Wrench,
    image: "/images/services/Car%20Restoration.jpg",
    alt: "Restored Maruti Suzuki vehicle",
    vehicle: "RESTORATION",
  },
  {
    number: "04",
    title: "Mechanical Repairs",
    description:
      "Vehicle inspection, mechanical diagnosis and repair services.",
    icon: Settings,
    image: "/images/services/mechanical-repair.jpg",
    alt: "Technician working on a vehicle",
    vehicle: "MECHANICAL",
  },
  {
    number: "05",
    title: "Insurance Assistance",
    description:
      "Guidance and support throughout the vehicle insurance claim process.",
    icon: ShieldCheck,
    image: "/images/services/insurance-assistance.jpg",
    alt: "Vehicle damage inspection for insurance assistance",
    vehicle: "INSURANCE SUPPORT",
  },
  {
    number: "06",
    title: "Car Renovation",
    description:
      "Refresh your vehicle with professional renovation and upgrade work.",
    icon: Sparkles,
    image: "/images/services/car-renovation.jpg",
    alt: "Mahindra Thar with refreshed exterior styling",
    vehicle: "CAR RENOVATION",
  },
];

const sharvariServices = [
  "Ceramic Coating",
  "PPF Installation",
  "Car Detailing",
  "Ambient Lighting",
  "Premium Seat Covers",
  "7D Floor Mats",
];

const sharvariHighlights = [
  {
    number: "01",
    title: "Exterior Modification",
    description:
      "Give your vehicle a distinctive road presence with exterior styling and customisation.",
    image:
      "https://imgx.gridoto.com/crop/0x126%3A740x654/700x465/photo/2020/01/21/3740741001.jpg",
    alt: "Modified car with sporty exterior styling",
    vehicle: "EXTERIOR STYLING",
  },
  {
    number: "02",
    title: "Interior Modification",
    description:
      "Upgrade your cabin with refreshed interiors, premium finishes and personalised styling.",
    image:
      "https://www.vroomvroomrestoration.in/uploads/image/vroom/cars/2005-maruti-swift/16.jpeg",
    alt: "Car interior with refreshed dashboard and cabin",
    vehicle: "INTERIOR STYLING",
  },
];

const projects = [
  {
    title: "Accident Repair & Restoration",
    category: "TULJA MOTORS",
    image:
      "https://cdn.cartoq.com/photos/052025/tata_nexon_shell_de01e28849.jpg",
    alt: "Tata Nexon accident repair reference",
  },
  {
    title: "Professional Denting & Painting",
    category: "TULJA MOTORS",
    image:
      "https://www.team-bhp.com/sites/default/files/styles/amp_high_res/public/nexon_1.jpeg",
    alt: "Tata Nexon bodywork reference",
  },
  {
    title: "Premium Vehicle Customisation",
    category: "SHARVARI MOTORS",
    image:
      "https://s3-ap-southeast-1.amazonaws.com/permaisuriban/img/20210702/portfolio/OZ_Racing_Italia_150_with_KIA_Seltos_gallery_13.jpg",
    alt: "Kia Seltos with custom alloy wheels",
  },
];

const districtTowns = [
  "Kolhapur",
  "Ichalkaranji",
  "Kagal",
  "Panhala",
  "Hatkanangale",
  "Shirol",
  "Gadhinglaj",
  "Radhanagari",
  "Ajra",
  "Chandgad",
  "Bhudargad",
  "Shahuwadi",
];

const faqs = [
  {
    question: "What is special about the new workshop?",
    answer:
      "The upcoming facility is planned as a 10,000 sq. ft. multi-brand automotive workshop in Top Sambhapur, Kolhapur, bringing multiple vehicle repair, restoration and customisation services together.",
  },
  {
    question: "Which vehicle brands do you work on?",
    answer:
      "The workshop is intended to cater to multiple car brands. Contact our team with your vehicle make and model to discuss your specific requirements.",
  },
  {
    question: "How long does accident repair take?",
    answer:
      "The repair duration depends on the extent of vehicle damage, spare-part availability and the work required. Our team can provide an estimated timeline after inspecting your vehicle.",
  },
  {
    question: "Can you help with insurance claims?",
    answer:
      "We provide insurance claim assistance and guidance during the vehicle repair process. Contact our team to discuss your policy and requirements.",
  },
  {
    question: "Can I get a repair estimate before booking?",
    answer:
      "You can contact us or submit an enquiry to discuss your vehicle's requirements. The final estimate may depend on a physical inspection.",
  },
  {
    question: "Do you provide vehicle customisation?",
    answer:
      "Yes. Sharvari Motors handles interior and exterior modifications, detailing, ceramic coating, PPF, ambient lighting and accessories.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleQuoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const vehicle = String(form.get("vehicle") || "").trim();
    const service = String(form.get("service") || "").trim();
    const location = String(form.get("location") || "").trim();

    const message = [
      "Hello Tulja Motors, I would like to enquire about your multi-brand workshop.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Vehicle: ${vehicle}`,
      `Service: ${service}`,
      `Location: ${location}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    event.currentTarget.reset();
  }

  return (
    <main className="tm-new-home">
      {/* HERO — KOLHAPUR MULTI-BRAND WORKSHOP */}
      <section className="tm-main-hero tm-kolhapur-hero">
        <div className="tm-main-hero-image" />
        <div className="tm-main-hero-overlay" />

        <div className="tm-main-hero-content">
          <div className="tm-container">
            <div className="tm-hero-label">
              <span className="tm-orange-dot" />
              A NEW AUTOMOTIVE DESTINATION FOR KOLHAPUR
            </div>

            <h1>
              KOLHAPUR&apos;S NEW
              <span>MULTI-BRAND</span>
              <span className="tm-heading-white">CAR WORKSHOP.</span>
            </h1>

            <p>
              A new 10,000 sq. ft. automotive workshop is coming to
              Kolhapur. From accident repairs and mechanical work to
              premium customisation — multiple automotive solutions
              under one roof.
            </p>

            <div className="tm-hero-buttons">
              <Link href="/contact" className="tm-btn-primary">
                Enquire About Our Workshop
                <ArrowUpRight size={18} />
              </Link>

              <a href={`tel:+91${PHONE_NUMBER}`} className="tm-btn-outline">
                <Phone size={17} />
                Call +91 {PHONE_NUMBER}
              </a>
            </div>

            <div className="tm-hero-points">
              <span>
                <CheckCircle2 size={16} /> Multi-Brand Services
              </span>
              <span>
                <CheckCircle2 size={16} /> 10,000 Sq. Ft. Space
              </span>
              <span>
                <CheckCircle2 size={16} /> Kolhapur District
              </span>
            </div>
          </div>
        </div>

        <div className="tm-hero-bottom">
          <span>COMING TO KOLHAPUR</span>
          <span>
            REPAIR <i /> RESTORE <i /> CUSTOMISE
          </span>
        </div>
      </section>

      {/* WORKSHOP HIGHLIGHTS */}
      <section className="tm-quick-bar tm-kolhapur-quick-bar">
        <div className="tm-container tm-quick-inner">
          <div>
            <MapPin size={20} />
            <span>
              <small>OUR LOCATION</small>
              <strong>Top Sambhapur, Kolhapur</strong>
            </span>
          </div>

          <div>
            <Ruler size={20} />
            <span>
              <small>WORKSHOP SPACE</small>
              <strong>10,000 Sq. Ft.</strong>
            </span>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${generalWhatsAppMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={19} />
            Enquire Now
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {/* KOLHAPUR DISTRICT INTRODUCTION */}
      <section className="tm-kolhapur-intro tm-section">
        <div className="tm-container">
          <div className="tm-kolhapur-intro-grid">
            <div className="tm-kolhapur-intro-copy">
              <span className="tm-section-eyebrow">
                A NEW CHAPTER FOR KOLHAPUR
              </span>

              <h2>
                KOLHAPUR,
                <span> YOUR CAR CARE DESTINATION IS COMING.</span>
              </h2>

              <p>
                Finding the right place for your car repairs, restoration,
                mechanical work and customisation is about to get easier.
                Tulja Motors and Sharvari Motors are bringing multiple
                automotive services together at a new 10,000 sq. ft.
                multi-brand workshop in Kolhapur.
              </p>

              <p>
                Whether you are from Kolhapur city or surrounding parts
                of the district, our goal is to make professional
                automotive care more accessible under one roof.
              </p>

              <Link href="/contact" className="tm-btn-primary">
                Discover Our Workshop
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="tm-kolhapur-stat-card">
              <span className="tm-kolhapur-stat-label">
                OUR UPCOMING WORKSHOP
              </span>

              <strong className="tm-kolhapur-stat-number">10,000</strong>

              <span className="tm-kolhapur-stat-unit">
                SQ. FT. WORKSHOP SPACE
              </span>

              <div className="tm-kolhapur-stat-divider" />

              <div className="tm-kolhapur-stat-bottom">
                <MapPin size={20} />
                <span>
                  <strong>Top Sambhapur</strong>
                  <small>Kolhapur, Maharashtra</small>
                </span>
              </div>
            </div>
          </div>

          <div className="tm-kolhapur-district">
            <div className="tm-kolhapur-district-heading">
              <span className="tm-section-eyebrow">
                CONNECTING KOLHAPUR DISTRICT
              </span>

              <h3>
                ONE DESTINATION.
                <span> MULTIPLE CAR CARE SOLUTIONS.</span>
              </h3>

              <p>
                Conveniently located near NH48 at Top Sambhapur,
                Kolhapur. We aim to serve customers from across
                Kolhapur and nearby areas.
              </p>
            </div>

            <div className="tm-kolhapur-town-list">
              {districtTowns.map((town) => (
                <span key={town}>
                  <MapPin size={14} />
                  {town}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TULJA MOTORS SERVICES */}
      <section className="tm-services-section tm-section">
        <div className="tm-container">
          <div className="tm-services-heading">
            <div className="tm-section-heading tm-align-left">
              <span className="tm-section-eyebrow">DIVISION 01 · TULJA MOTORS</span>

              <h2>
                COMPLETE CAR
                <span> REPAIR SOLUTIONS.</span>
              </h2>

              <p>
                Professional repair and restoration services to help
                get your vehicle back on the road.
              </p>
            </div>

            <Link href="/tulja-motors" className="tm-btn-outline-dark">
              All Tulja Services
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="tm-services-grid tm-services-image-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="tm-service-card tm-service-image-card"
                  key={service.number}
                >
                  <div className="tm-service-image-wrap">
                    <img
                      src={service.image}
                      alt={service.alt}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="tm-service-image-overlay" />

                    <span className="tm-service-vehicle-tag">
                      {service.vehicle}
                    </span>
                  </div>

                  <div className="tm-service-card-content">
                    <div className="tm-service-card-top">
                      <span>{service.number}</span>
                      <Icon size={26} strokeWidth={1.6} />
                    </div>

                    <h3>{service.title}</h3>
                    <p>{service.description}</p>

                    <Link
                      href="/tulja-motors"
                      aria-label={`Explore ${service.title}`}
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="tm-insurance-banner">
            <div className="tm-insurance-icon">
              <ShieldCheck size={29} />
            </div>

            <div>
              <strong>Need help with an insurance claim?</strong>
              <p>
                Talk to our team about insurance claim assistance
                and vehicle repair requirements.
              </p>
            </div>

            <Link href="/contact">
              Get Assistance
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHARVARI MOTORS SERVICES */}
      <section className="tm-sharvari-section tm-section">
        <div className="tm-container tm-sharvari-layout">
          <div className="tm-sharvari-copy">
            <span className="tm-section-eyebrow">
              DIVISION 02 · SHARVARI MOTORS
            </span>

            <h2>
              MAKE YOUR CAR
              <span> UNIQUELY YOURS.</span>
            </h2>

            <p>
              Explore premium automotive styling, personalisation
              and protection solutions through Sharvari Motors.
            </p>

            <Link href="/sharvari-motors" className="tm-btn-primary">
              Explore Customisation
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="tm-sharvari-services-content">
            <div className="tm-sharvari-feature-grid">
              {sharvariHighlights.map((item) => (
                <Link
                  href="/sharvari-motors"
                  className="tm-sharvari-feature-card"
                  key={item.number}
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="tm-sharvari-feature-overlay" />

                  <div className="tm-sharvari-feature-content">
                    <span>{item.number} / {item.vehicle}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <ArrowUpRight size={20} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="tm-sharvari-service-list">
              {sharvariServices.map((service, index) => (
                <Link
                  href="/sharvari-motors"
                  className="tm-sharvari-service-item"
                  key={service}
                >
                  <span>{String(index + 3).padStart(2, "0")}</span>
                  <strong>{service}</strong>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="tm-why-section tm-section">
        <div className="tm-container">
          <div className="tm-section-heading">
            <span className="tm-section-eyebrow">
              WHY THIS WORKSHOP
            </span>

            <h2>
              KOLHAPUR&apos;S NEXT
              <span> AUTOMOTIVE DESTINATION.</span>
            </h2>

            <p>
              A dedicated multi-brand workshop bringing vehicle
              repairs, restoration, mechanical services and
              customisation together in one convenient location.
            </p>
          </div>

         <div className="tm-why-grid">
  <article>
    <div><Ruler size={27} /></div>
    <h3>10,000 Sq. Ft. Space</h3>
    <p>
      A spacious workshop facility planned to bring multiple
      automotive services together under one roof.
    </p>
  </article>

  {/* NEW WORKSHOP CARD */}
  <article>
    <div><Wrench size={27} /></div>
    <h3>Fully Equipped Modern Workshop</h3>
    <p>
      Planned with modern automotive equipment, professional
      tools and dedicated work areas for vehicle servicing.
    </p>
  </article>

  <article>
    <div><CarFront size={27} /></div>
    <h3>Multi-Brand Approach</h3>
    <p>
      Automotive repair and customisation solutions for
      customers with different car brands.
    </p>
  </article>

  <article>
    <div><ShieldCheck size={27} /></div>
    <h3>Insurance Assistance</h3>
    <p>
      Guidance to help you understand the vehicle
      insurance claim and repair process.
    </p>
  </article>

  <article>
    <div><BadgeCheck size={27} /></div>
    <h3>Two Specialist Divisions</h3>
    <p>
      Tulja Motors for repairs and restoration, and
      Sharvari Motors for styling and customisation.
    </p>
  </article>
</div>
        </div>
      </section>

      {/* OUR WORK */}
      <section className="tm-gallery-section tm-section">
        <div className="tm-container">
          <div className="tm-gallery-heading">
            <div className="tm-section-heading tm-align-left">
              <span className="tm-section-eyebrow">OUR WORK</span>

              <h2>
                QUALITY YOU CAN
                <span> SEE.</span>
              </h2>

              <p>
                Explore automotive repair, restoration and
                customisation projects.
              </p>
            </div>

            <Link href="/gallery" className="tm-btn-outline-dark">
              View All Projects
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="tm-gallery-grid">
            {projects.map((project, index) => (
              <Link
                href="/gallery"
                className={`tm-gallery-card tm-gallery-card-${index + 1}`}
                key={project.title}
              >
                <img
                  src={project.image}
                  alt={project.alt}
                  loading="lazy"
                  decoding="async"
                />

                <div className="tm-gallery-overlay">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <ArrowUpRight size={22} />
                </div>
              </Link>
            ))}
          </div>

          <p className="tm-proof-note">
            These are illustrative Indian-car reference photographs,
            not confirmed Tulja Motors customer projects. Replace
            them with actual workshop and before/after photographs
            before launch.
          </p>
        </div>
      </section>

      {/* INSURANCE SUPPORT */}
      <section className="tm-partners-section">
        <div className="tm-container tm-partners-inner">
          <div>
            <span className="tm-section-eyebrow">
              INSURANCE SUPPORT
            </span>
            <h2>INSURANCE CLAIM ASSISTANCE</h2>
            <p>
              Contact us to discuss your insurance claim and
              vehicle repair requirements.
            </p>
          </div>

          <div className="tm-partner-placeholder">
            <ShieldCheck size={25} />
            <span>
              Insurance company names and logos will be added
              after verifying the current tie-ups.
            </span>
          </div>
        </div>
      </section>

      {/* CUSTOMER FEEDBACK */}
      <section className="tm-reviews-section tm-section">
        <div className="tm-container">
          <div className="tm-section-heading">
            <span className="tm-section-eyebrow">
              CUSTOMER FEEDBACK
            </span>

            <h2>
              TRUST BUILT THROUGH
              <span> CUSTOMER EXPERIENCE.</span>
            </h2>

            <p>
              Read genuine customer feedback about our services.
            </p>
          </div>

          <div className="tm-reviews-content">
            <div className="tm-review-icon">
              <Star size={30} />
            </div>

            <div>
              <h3>What our customers say</h3>
              <p>
                Verified Google reviews, actual ratings and customer
                review screenshots will be displayed here.
              </p>
              <span>
                Customer reviews awaiting verified Google Business
                Profile details.
              </span>
            </div>

            <Link href="/contact">
              Contact Our Team
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="tm-faq-section tm-section">
        <div className="tm-container tm-faq-layout">
          <div className="tm-faq-intro">
            <span className="tm-section-eyebrow">
              HAVE QUESTIONS?
            </span>

            <h2>
              FREQUENTLY ASKED
              <span> QUESTIONS.</span>
            </h2>

            <p>
              Quick answers about our upcoming Kolhapur workshop,
              vehicle repairs, insurance assistance and customisation.
            </p>

            <a href={`tel:+91${PHONE_NUMBER}`} className="tm-btn-primary">
              <Phone size={17} />
              Speak to Our Team
            </a>
          </div>

          <div className="tm-faq-list">
            {faqs.map((faq, index) => (
              <div
                className={`tm-faq-item ${
                  openFaq === index ? "is-open" : ""
                }`}
                key={faq.question}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} />
                </button>

                {openFaq === index && <p>{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="tm-location-section tm-section">
        <div className="tm-container">
          <div className="tm-location-heading">
            <div>
              <span className="tm-section-eyebrow">
                FIND OUR WORKSHOP
              </span>

              <h2>
                FIND YOUR NEW
                <span> CAR CARE DESTINATION.</span>
              </h2>

              <p>
                Find us near Shetimal Petrol Pump, Top Sambhapur,
                on Pune–Bengaluru National Highway NH48.
              </p>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=16.783019595807485,74.28685209367279"
              target="_blank"
              rel="noopener noreferrer"
              className="tm-btn-primary"
            >
              <MapPin size={17} />
              Get Directions
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="tm-map-frame">
            <iframe
              title="Tulja Motors Kolhapur location"
              src="https://www.google.com/maps?q=16.783019595807485,74.28685209367279&z=15&output=embed"
              width="100%"
              height="390"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="tm-location-bottom">
            <div>
              <MapPin size={19} />
              <span>
                <strong>Tulja Motors</strong>
                <small>
                  Pune–Bengaluru NH48, near Shetimal Petrol Pump,
                  Top Sambhapur, Kolhapur, Maharashtra 416122
                </small>
              </span>
            </div>

            <a href={`tel:+91${PHONE_NUMBER}`}>
              <Phone size={17} />
              +91 {PHONE_NUMBER}
            </a>
          </div>

          <div className="tm-hours-note">
            <Clock size={17} />
            <span>
              Please contact our team to confirm current workshop
              hours and opening status before visiting.
            </span>
          </div>
        </div>
      </section>

      {/* QUICK QUOTE */}
      <section className="tm-quote-section tm-section" id="quick-enquiry">
        <div className="tm-container tm-quote-layout">
          <div className="tm-quote-copy">
            <span className="tm-section-eyebrow">
              GET A WORKSHOP ENQUIRY
            </span>

            <h2>
              YOUR CAR.
              <span> OUR NEXT PROJECT.</span>
            </h2>

            <p>
              Share a few details about your vehicle and the service
              you need. Your WhatsApp enquiry will open with the
              information ready to send.
            </p>

            <div className="tm-quote-contact">
              <Phone size={20} />
              <span>
                <small>CALL US DIRECTLY</small>
                <strong>+91 {PHONE_NUMBER}</strong>
              </span>
            </div>
          </div>

          <form className="tm-quote-form" onSubmit={handleQuoteSubmit}>
            <h3>REQUEST A QUICK ENQUIRY</h3>
            <p>Tell us about your vehicle.</p>

            <div className="tm-quote-fields">
              <input
                name="name"
                type="text"
                placeholder="Your full name *"
                required
                maxLength={100}
              />

              <input
                name="phone"
                type="tel"
                placeholder="10-digit mobile number *"
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                required
              />

              <input
                name="vehicle"
                type="text"
                placeholder="Vehicle model *"
                required
                maxLength={100}
              />

              <select name="service" required defaultValue="">
                <option value="" disabled>
                  Select required service *
                </option>
                <option>Accident Repair</option>
                <option>Denting & Painting</option>
                <option>Car Restoration</option>
                <option>Mechanical Repairs</option>
                <option>Insurance Assistance</option>
                <option>Car Renovation</option>
                <option>Interior / Exterior Modification</option>
                <option>PPF / Ceramic Coating</option>
                <option>Car Detailing</option>
                <option>Other</option>
              </select>

              <input
                name="location"
                type="text"
                placeholder="Your city / location *"
                required
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              className="tm-btn-primary tm-quote-submit"
            >
              Send Enquiry on WhatsApp
              <MessageCircle size={18} />
            </button>

            <small className="tm-quote-disclaimer">
              Your enquiry will be shared with our team through WhatsApp.
            </small>
          </form>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="tm-final-cta">
        <div className="tm-container tm-final-cta-inner">
          <div>
            <span>A NEW AUTOMOTIVE DESTINATION FOR KOLHAPUR</span>
            <h2>10,000 SQ. FT. OF AUTOMOTIVE POSSIBILITIES.</h2>
            <p>
              Multiple automotive services. Two specialist divisions.
              One destination in Kolhapur.
            </p>
          </div>

          <div className="tm-final-actions">
            <a href={`tel:+91${PHONE_NUMBER}`}>
              <Phone size={18} />
              Call Now
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${generalWhatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CONTACT */}
      <div className="tm-mobile-sticky-contact">
        <a href={`tel:+91${PHONE_NUMBER}`}>
          <Phone size={19} />
          Call Now
        </a>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${generalWhatsAppMessage}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={19} />
          WhatsApp
        </a>
      </div>
    </main>
  );
}