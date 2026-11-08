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
} from "lucide-react";

import "./home-page.css";

const PHONE_NUMBER = "9130129205";
const WHATSAPP_NUMBER = "919130129205";

const generalWhatsAppMessage = encodeURIComponent(
  "Hello Tulja Motors, I would like to enquire about your services."
);

/* TULJA MOTORS — SIX SERVICE-SPECIFIC IMAGES */
const services = [
  {
    number: "01",
    title: "Accident Repair",
    description:
      "Professional collision damage repair and vehicle body restoration.",
    icon: CarFront,
    image: "/images/services/Accident%20Repair.jpg",
    alt: "Indian car undergoing accident repair and restoration",
    vehicle: "TATA NEXON",
  },
  {
    number: "02",
    title: "Denting & Painting",
    description:
      "Expert dent removal, panel work and quality paint finishing.",
    icon: Paintbrush,
    image:
      "https://www.team-bhp.com/sites/default/files/styles/amp_high_res/public/nexon_1.jpeg",
    alt: "Tata Nexon showing damaged rear bodywork requiring dent repair",
    vehicle: "TATA NEXON",
  },
  {
    number: "03",
    title: "Car Restoration",
    description:
      "Bring your vehicle back to life with complete restoration solutions.",
    icon: Wrench,
    image: "/images/services/Car%20Restoration.jpg",
    alt: "Restored Maruti Suzuki vehicle",
    vehicle: "MARUTI SUZUKI",
  },
  {
    number: "04",
    title: "Mechanical Repairs",
    description:
      "Vehicle inspection, mechanical diagnosis and repair services.",
    icon: Settings,
    image: "/images/services/mechanical-repair.jpg",
    alt: "Technician working on a vehicle during mechanical repairs",
    vehicle: "TATA MOTORS",
  },
  {
    number: "05",
    title: "Insurance Assistance",
    description:
      "Guidance and support throughout the vehicle insurance claim process.",
    icon: ShieldCheck,
    image: "/images/services/insurance-assistance.jpg",
    alt: "Vehicle damage inspection for insurance claim assistance",
    vehicle: "DAMAGE ASSESSMENT",
  },
  {
    number: "06",
    title: "Car Renovation",
    description:
      "Refresh your vehicle with professional renovation and upgrade work.",
    icon: Sparkles,
    image: "/images/services/car-renovation.jpg",
    alt: "Mahindra Thar with refreshed exterior trim and styling",
    vehicle: "MAHINDRA THAR",
  },
];

/* SHARVARI — EXACTLY TWO IMAGE FEATURES */
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
    alt: "Modified red Kia Seltos with sporty black alloy wheels",
    vehicle: "KIA SELTOS",
  },
  {
    number: "02",
    title: "Interior Modification",
    description:
      "Upgrade your cabin with refreshed interiors, premium finishes and personalised styling.",
    image:
      "https://www.vroomvroomrestoration.in/uploads/image/vroom/cars/2005-maruti-swift/16.jpeg",
    alt: "Maruti Suzuki Swift interior with refreshed dashboard and cabin",
    vehicle: "MARUTI SUZUKI",
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
    alt: "Tata Nexon body damage reference",
  },
  {
    title: "Premium Vehicle Customisation",
    category: "SHARVARI MOTORS",
    image:
      "https://s3-ap-southeast-1.amazonaws.com/permaisuriban/img/20210702/portfolio/OZ_Racing_Italia_150_with_KIA_Seltos_gallery_13.jpg",
    alt: "Black Kia Seltos with custom alloy wheels",
  },
];

const faqs = [
  {
    question: "How long does accident repair take?",
    answer:
      "The repair duration depends on the extent of vehicle damage, spare-part availability and the work required. Our team can provide an estimated timeline after inspecting your vehicle.",
  },
  {
    question: "Can you help with insurance claims?",
    answer:
      "Yes. We provide insurance claim assistance and guidance during the vehicle repair process. Contact our team to discuss your policy and requirements.",
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

    const name = String(form.get("name") || "");
    const phone = String(form.get("phone") || "");
    const vehicle = String(form.get("vehicle") || "");
    const service = String(form.get("service") || "");
    const location = String(form.get("location") || "");

    const message = [
      "Hello Tulja Motors, I would like to request a vehicle service quotation.",
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
      {/* HERO */}
      <section className="tm-main-hero">
        <div className="tm-main-hero-image" />
        <div className="tm-main-hero-overlay" />

        <div className="tm-main-hero-content">
          <div className="tm-container">
            <div className="tm-hero-label">
              <span className="tm-orange-dot" />
              KOLHAPUR&apos;S AUTOMOTIVE REPAIR & RESTORATION CENTRE
            </div>

            <h1>
              ACCIDENT REPAIR &
              <span>DENTING PAINTING</span>
              <span className="tm-heading-white">IN KOLHAPUR.</span>
            </h1>

            <p>
              From accident damage to complete vehicle restoration,
              experience professional automotive care at Tulja Motors.
            </p>

            <div className="tm-hero-buttons">
              <Link href="/contact" className="tm-btn-primary">
                Book Your Service
                <ArrowUpRight size={18} />
              </Link>

              <a href={`tel:+91${PHONE_NUMBER}`} className="tm-btn-outline">
                <Phone size={17} />
                Call +91 {PHONE_NUMBER}
              </a>
            </div>

            <div className="tm-hero-points">
              <span>
                <CheckCircle2 size={16} /> Accident Repair
              </span>
              <span>
                <CheckCircle2 size={16} /> Denting & Painting
              </span>
              <span>
                <CheckCircle2 size={16} /> Insurance Assistance
              </span>
            </div>
          </div>
        </div>

        <div className="tm-hero-bottom">
          <span>PROFESSIONAL AUTOMOTIVE CARE</span>
          <span>
            REPAIR <i /> RESTORE <i /> REDEFINE
          </span>
        </div>
      </section>

      {/* QUICK CONTACT BAR */}
      <section className="tm-quick-bar">
        <div className="tm-container tm-quick-inner">
          <div>
            <Phone size={20} />
            <span>
              <small>CALL OUR TEAM</small>
              <strong>+91 {PHONE_NUMBER}</strong>
            </span>
          </div>

          <div>
            <MapPin size={20} />
            <span>
              <small>VISIT OUR WORKSHOP</small>
              <strong>Top Sambhapur, Kolhapur</strong>
            </span>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${generalWhatsAppMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={19} />
            WhatsApp Enquiry
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

     

      {/* TULJA SERVICES — SIX IMAGE CARDS */}
      <section className="tm-services-section tm-section">
        <div className="tm-container">
          <div className="tm-services-heading">
            <div className="tm-section-heading tm-align-left">
              <span className="tm-section-eyebrow">TULJA MOTORS</span>

              <h2>
                COMPLETE CAR
                <span> REPAIR SOLUTIONS.</span>
              </h2>

              <p>
                Professional repair and restoration services to help get your
                vehicle back on the road.
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
                Talk to our team about insurance claim assistance and vehicle
                repair requirements.
              </p>
            </div>

            <Link href="/contact">
              Get Assistance
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHARVARI SERVICES — ONLY TWO PHOTOS */}
      <section className="tm-sharvari-section tm-section">
        <div className="tm-container tm-sharvari-layout">
          <div className="tm-sharvari-copy">
            <span className="tm-section-eyebrow">SHARVARI MOTORS</span>

            <h2>
              MAKE YOUR CAR
              <span> UNIQUELY YOURS.</span>
            </h2>

            <p>
              Explore premium automotive styling, personalisation and
              protection solutions through Sharvari Motors.
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
                  <img src={item.image} alt={item.alt} loading="lazy" />

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
            <span className="tm-section-eyebrow">WHY TULJA MOTORS</span>

            <h2>
              YOUR VEHICLE DESERVES
              <span> THE RIGHT CARE.</span>
            </h2>

            <p>
              We focus on professional workmanship, transparent communication
              and customer-focused service.
            </p>
          </div>

          <div className="tm-why-grid">
            <article>
              <div><Wrench size={27} /></div>
              <h3>Professional Workmanship</h3>
              <p>
                Repair solutions with attention to vehicle condition and
                finishing quality.
              </p>
            </article>

            <article>
              <div><ClipboardCheck size={27} /></div>
              <h3>Clear Communication</h3>
              <p>
                Understand your repair requirements and discuss estimates
                before proceeding.
              </p>
            </article>

            <article>
              <div><ShieldCheck size={27} /></div>
              <h3>Insurance Assistance</h3>
              <p>
                Guidance to help you understand the vehicle insurance claim
                and repair process.
              </p>
            </article>

            <article>
              <div><BadgeCheck size={27} /></div>
              <h3>Customer-Focused Service</h3>
              <p>
                A dedicated team to discuss your vehicle&apos;s needs and
                service requirements.
              </p>
            </article>
          </div>

          <p className="tm-proof-note">
            Verified business experience, completed vehicle counts, warranty
            terms and insurance tie-ups will be displayed here after client
            confirmation.
          </p>
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
                Explore automotive repair, restoration and customisation
                projects.
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
            These are illustrative Indian-car reference photographs, not
            confirmed Tulja Motors customer projects. Replace them with actual
            workshop and before/after photographs before launch.
          </p>
        </div>
      </section>

      {/* INSURANCE SUPPORT */}
      <section className="tm-partners-section">
        <div className="tm-container tm-partners-inner">
          <div>
            <span className="tm-section-eyebrow">INSURANCE SUPPORT</span>
            <h2>INSURANCE CLAIM ASSISTANCE</h2>
            <p>
              Contact us to discuss your insurance claim and vehicle repair
              requirements.
            </p>
          </div>

          <div className="tm-partner-placeholder">
            <ShieldCheck size={25} />
            <span>
              Insurance company names and logos will be added after verifying
              the current tie-ups.
            </span>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="tm-reviews-section tm-section">
        <div className="tm-container">
          <div className="tm-section-heading">
            <span className="tm-section-eyebrow">CUSTOMER FEEDBACK</span>

            <h2>
              TRUST BUILT THROUGH
              <span> CUSTOMER EXPERIENCE.</span>
            </h2>

            <p>Read genuine customer feedback about our services.</p>
          </div>

          <div className="tm-reviews-content">
            <div className="tm-review-icon">
              <Star size={30} />
            </div>

            <div>
              <h3>What our customers say</h3>
              <p>
                Verified Google reviews, actual ratings and customer review
                screenshots will be displayed here.
              </p>
              <span>
                Customer reviews awaiting verified Google Business Profile
                details.
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
            <span className="tm-section-eyebrow">HAVE QUESTIONS?</span>

            <h2>
              FREQUENTLY ASKED
              <span> QUESTIONS.</span>
            </h2>

            <p>
              Quick answers to common questions about vehicle repairs,
              insurance assistance and customisation.
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
              <span className="tm-section-eyebrow">FIND OUR WORKSHOP</span>

              <h2>
                VISIT TULJA MOTORS
                <span> IN KOLHAPUR.</span>
              </h2>

              <p>
                Find us near Shetimal Petrol Pump, Top Sambhapur, on
                Pune–Bengaluru National Highway NH48.
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
                  Pune–Bengaluru NH48, near Shetimal Petrol Pump, Top
                  Sambhapur, Kolhapur, Maharashtra 416122
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
              Please contact our team to confirm current workshop hours before
              visiting.
            </span>
          </div>
        </div>
      </section>

      {/* QUICK QUOTE FORM */}
      <section className="tm-quote-section tm-section" id="quick-enquiry">
        <div className="tm-container tm-quote-layout">
          <div className="tm-quote-copy">
            <span className="tm-section-eyebrow">GET A SERVICE ENQUIRY</span>

            <h2>
              LET&apos;S GET YOUR CAR
              <span> BACK ON THE ROAD.</span>
            </h2>

            <p>
              Share a few details about your vehicle. Our WhatsApp enquiry
              will open with your information ready to send.
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
            <h3>REQUEST A QUICK QUOTE</h3>
            <p>Fill in your vehicle details to get started.</p>

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

            <button type="submit" className="tm-btn-primary tm-quote-submit">
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
            <span>YOUR VEHICLE. OUR RESPONSIBILITY.</span>
            <h2>NEED PROFESSIONAL CAR CARE?</h2>
            <p>Talk to Tulja Motors today.</p>
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