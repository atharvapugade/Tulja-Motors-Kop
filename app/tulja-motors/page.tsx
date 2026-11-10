
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  Paintbrush,
  Wrench,
  Settings,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Phone,
  MapPin,
  Clock3,
  BadgeCheck,
  Building2,
  ChevronRight,
} from "lucide-react";

import "./tulja-motors.css";

const services = [
  {
    number: "01",
    title: "Accident Repair",
    description:
      "From minor collision damage to major accident repairs, we work to bring your vehicle back to its proper condition.",
    image: "/images/services/Accident%20Repair.jpg",
    icon: CarFront,
    tag: "BODY SHOP",
    id: "accident-repair",
  },
  {
    number: "02",
    title: "Denting & Painting",
    description:
      "Panel dent removal, surface preparation, colour matching and professional paint finishing.",
    image: "/images/services/denting-painting.jpg",
    icon: Paintbrush,
    tag: "PAINT & FINISH",
    id: "denting-painting",
  },
  {
    number: "03",
    title: "Car Restoration",
    description:
      "Refresh your vehicle with detailed restoration work focused on appearance, finish and condition.",
    image: "/images/services/Car%20Restoration.jpg",
    icon: Wrench,
    tag: "RESTORE & RENEW",
    id: "restoration",
  },
  {
    number: "04",
    title: "Mechanical Repairs",
    description:
      "Inspection and repair support to help keep your vehicle performing reliably on the road.",
    image: "/images/services/mechanical-repair.jpg",
    icon: Settings,
    tag: "MECHANICAL",
    id: "mechanical",
  },
  {
    number: "05",
    title: "Insurance Assistance",
    description:
      "Guidance with the insurance claim process and coordination for eligible accident repair work.",
    image: "/images/services/insurance-assistance.jpg",
    icon: ShieldCheck,
    tag: "CLAIM SUPPORT",
    id: "insurance",
  },
  {
    number: "06",
    title: "Car Renovation",
    description:
      "Give your car a refreshed appearance through refurbishment and carefully planned improvement work.",
    image: "/images/services/car-renovation.jpg",
    icon: Sparkles,
    tag: "REFRESH",
    id: "renovation",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share Your Requirement",
    description:
      "Tell us about your vehicle, the damage or the work you want done.",
    icon: Phone,
  },
  {
    number: "02",
    title: "Vehicle Inspection",
    description:
      "We inspect the vehicle and understand the repair or service requirements.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Workshop Execution",
    description:
      "The required repair, painting, mechanical or restoration work is carried out.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Quality Delivery",
    description:
      "We review the completed work before your vehicle is handed back.",
    icon: CheckCircle2,
  },
];

const reasons = [
  {
    icon: CarFront,
    title: "Multiple Car Brands",
    description:
      "Automotive repair and workshop support for a range of vehicle brands.",
  },
  {
    icon: ClipboardCheck,
    title: "Inspection First",
    description:
      "We understand the vehicle's condition and requirements before planning the work.",
  },
  {
    icon: Paintbrush,
    title: "Attention to Finish",
    description:
      "Careful attention to panel work, surface preparation and paint finishing.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance Guidance",
    description:
      "Assistance with understanding the insurance claim process for eligible repairs.",
  },
];

const highlights = [
  "Accident and collision repair",
  "Denting and painting solutions",
  "Vehicle restoration and renovation",
  "Mechanical repair support",
  "Insurance claim assistance",
  "Interior and exterior car care",
];

export default function TuljaMotorsPage() {
  return (
    <main className="tulja-page">

      {/* =====================================
          PAGE INTRO / HERO
      ====================================== */}
      <section className="tulja-hero">
        <div className="tulja-container">

          <div className="tulja-hero-top">
            <div className="tulja-eyebrow">
              <span className="tulja-eyebrow-dot" />
              TULJA MOTORS · KOLHAPUR
            </div>

            <span className="tulja-hero-reference">
              AUTOMOTIVE REPAIR & RESTORATION
            </span>
          </div>

          <div className="tulja-hero-grid">

            <div className="tulja-hero-copy">
              <span className="tulja-small-label">
                COMPLETE AUTOMOTIVE CARE
              </span>

              <h1>
                YOUR CAR.
                <br />
                <span>OUR CARE.</span>
                <br />
                BACK ON THE ROAD.
              </h1>

              <p>
                From accident repairs and denting to painting, mechanical
                work and complete restoration — Tulja Motors brings
                multiple automotive solutions together under one roof.
              </p>

              <div className="tulja-hero-actions">
                <Link
                  href="/contact"
                  className="tulja-button tulja-button-primary"
                >
                  Book an Inspection
                  <ArrowUpRight size={18} />
                </Link>

                <a
                  href="tel:9130129205"
                  className="tulja-button tulja-button-outline"
                >
                  <Phone size={17} />
                  Call Our Workshop
                </a>
              </div>

              <div className="tulja-hero-trust">
                <span>
                  <CheckCircle2 size={16} />
                  Repair & Restoration
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  Insurance Assistance
                </span>
              </div>
            </div>

            <div className="tulja-hero-visual">
              <div className="tulja-hero-image-main">
                <img
                  src="/images/services/Accident%20Repair.jpg"
                  alt="Vehicle accident repair at Tulja Motors"
                  fetchPriority="high"
                />

                <div className="tulja-hero-image-shade" />

                <div className="tulja-hero-image-caption">
                  <span>WORKSHOP EXPERTISE</span>
                  <strong>REPAIR. RESTORE. REBUILD.</strong>
                </div>
              </div>

              <div className="tulja-hero-floating-card">
                <span className="tulja-floating-icon">
                  <Wrench size={22} />
                </span>
                <div>
                  <strong>Complete Car Care</strong>
                  <small>Multiple services. One workshop.</small>
                </div>
              </div>

              <div className="tulja-hero-side-label">
                TULJA MOTORS
              </div>
            </div>

          </div>

          <div className="tulja-hero-bottom">
            <span>ACCIDENT REPAIR</span>
            <span>DENTING & PAINTING</span>
            <span>RESTORATION</span>
            <span>MECHANICAL WORK</span>
          </div>

        </div>
      </section>

      {/* =====================================
          INTRODUCTION
      ====================================== */}
      <section className="tulja-intro-section">
        <div className="tulja-container tulja-intro-grid">

          <div className="tulja-intro-heading">
            <span className="tulja-section-label">
              <span className="tulja-label-line" />
              ABOUT TULJA MOTORS
            </span>

            <h2>
              MORE THAN A
              <br />
              <span>REPAIR WORKSHOP.</span>
            </h2>
          </div>

          <div className="tulja-intro-content">
            <p className="tulja-intro-lead">
              Every vehicle deserves the right attention, the right
              repair approach and a finish you can feel confident about.
            </p>

            <p>
              Tulja Motors brings together accident repair, bodywork,
              denting and painting, mechanical repairs and vehicle
              restoration. Our focus is to understand your vehicle's
              requirements and guide you through the work needed.
            </p>

            <Link href="/about" className="tulja-text-link">
              KNOW MORE ABOUT US
              <ArrowRight size={17} />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================
          SERVICES
      ====================================== */}
      <section className="tulja-services-section" id="services">
        <div className="tulja-container">

          <div className="tulja-section-heading">
            <div>
              <span className="tulja-section-label">
                <span className="tulja-label-line" />
                WHAT WE DO
              </span>

              <h2>
                COMPLETE CARE.
                <br />
                <span>EVERY DETAIL MATTERS.</span>
              </h2>
            </div>

            <p>
              Explore our workshop services, designed to address
              different vehicle repair, maintenance and restoration needs.
            </p>
          </div>

          <div className="tulja-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="tulja-service-card"
                  id={service.id}
                  key={service.number}
                >
                  <Link
                    href="/contact"
                    className="tulja-service-image"
                    aria-label={`Enquire about ${service.title}`}
                  >
                    <img
                      src={service.image}
                      alt={`${service.title} at Tulja Motors`}
                      loading="lazy"
                      decoding="async"
                    />

                    <span className="tulja-service-image-number">
                      {service.number}
                    </span>

                    <span className="tulja-service-image-tag">
                      {service.tag}
                    </span>

                    <span className="tulja-service-image-icon">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                  </Link>

                  <div className="tulja-service-card-content">
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>

                    <Link
                      href="/contact"
                      className="tulja-service-link"
                      aria-label={`Enquire about ${service.title}`}
                    >
                      <ArrowUpRight size={20} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="tulja-services-bottom">
            <span>
              NEED HELP CHOOSING THE RIGHT SERVICE?
            </span>

            <Link href="/contact">
              TALK TO OUR TEAM
              <ArrowUpRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================
          WORKSHOP FEATURE
      ====================================== */}
      <section className="tulja-feature-section">
        <div className="tulja-container tulja-feature-grid">

          <div className="tulja-feature-visual">
            <img
              src="/images/services/Car%20Restoration.jpg"
              alt="Car restoration and workshop work"
              loading="lazy"
              decoding="async"
            />

            <div className="tulja-feature-image-note">
              <span>01 / WORKSHOP FOCUS</span>
              <strong>BUILT AROUND YOUR VEHICLE</strong>
            </div>

            <div className="tulja-feature-small-card">
              <Wrench size={22} />
              <span>REPAIR & RESTORATION</span>
            </div>
          </div>

          <div className="tulja-feature-content">
            <span className="tulja-section-label">
              <span className="tulja-label-line" />
              THE TULJA APPROACH
            </span>

            <h2>
              GOOD WORK
              <br />
              STARTS WITH
              <br />
              <span>THE RIGHT CARE.</span>
            </h2>

            <p>
              A vehicle repair is not just about fixing what is visible.
              It is about understanding the condition, identifying the
              work required and paying attention to the final result.
            </p>

            <div className="tulja-feature-checklist">
              {highlights.map((item) => (
                <div key={item}>
                  <CheckCircle2 size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="tulja-button tulja-button-primary"
            >
              DISCUSS YOUR VEHICLE
              <ArrowUpRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================
          WHY CHOOSE US
      ====================================== */}
      <section className="tulja-why-section">
        <div className="tulja-container">

          <div className="tulja-section-heading tulja-why-heading">
            <div>
              <span className="tulja-section-label">
                <span className="tulja-label-line" />
                WHY TULJA MOTORS
              </span>

              <h2>
                THE RIGHT APPROACH.
                <br />
                <span>THE RIGHT ATTENTION.</span>
              </h2>
            </div>

            <p>
              We believe good automotive care begins with understanding
              the vehicle and ends with careful attention to the work.
            </p>
          </div>

          <div className="tulja-why-grid">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;

              return (
                <article className="tulja-why-card" key={reason.title}>
                  <div className="tulja-why-card-top">
                    <span className="tulja-why-icon">
                      <Icon size={25} strokeWidth={1.7} />
                    </span>

                    <span className="tulja-why-number">
                      0{index + 1}
                    </span>
                  </div>

                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* =====================================
          WORK PROCESS
      ====================================== */}
      <section className="tulja-process-section">
        <div className="tulja-container">

          <div className="tulja-section-heading">
            <div>
              <span className="tulja-section-label">
                <span className="tulja-label-line" />
                HOW WE WORK
              </span>

              <h2>
                FROM FIRST LOOK
                <br />
                <span>TO ROAD READY.</span>
              </h2>
            </div>

            <p>
              A simple and clear process helps you understand what
              happens to your vehicle at every stage.
            </p>
          </div>

          <div className="tulja-process-grid">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article className="tulja-process-card" key={step.number}>
                  <div className="tulja-process-card-top">
                    <span className="tulja-process-icon">
                      <Icon size={23} />
                    </span>

                    <span className="tulja-process-number">
                      {step.number}
                    </span>
                  </div>

                  <div className="tulja-process-line">
                    <span />
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>

                  {index !== processSteps.length - 1 && (
                    <ChevronRight
                      className="tulja-process-next"
                      size={20}
                    />
                  )}
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* =====================================
          WORKSHOP CTA BANNER
      ====================================== */}
      <section className="tulja-workshop-banner">
        <div className="tulja-container tulja-workshop-banner-inner">

          <div className="tulja-workshop-banner-copy">
            <span className="tulja-banner-kicker">
              YOUR VEHICLE NEEDS ATTENTION?
            </span>

            <h2>
              LET'S GET YOUR CAR
              <br />
              <span>BACK IN SHAPE.</span>
            </h2>

            <p>
              Tell us what your vehicle needs. Our team can help you
              understand the next step.
            </p>

            <Link
              href="/contact"
              className="tulja-button tulja-button-white"
            >
              MAKE AN ENQUIRY
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="tulja-workshop-banner-art">
            <CarFront size={190} strokeWidth={0.8} />
            <span>TULJA MOTORS</span>
          </div>

        </div>
      </section>

      {/* =====================================
          LOCATION & CONTACT
      ====================================== */}
      <section className="tulja-location-section">
        <div className="tulja-container">

          <div className="tulja-section-heading">
            <div>
              <span className="tulja-section-label">
                <span className="tulja-label-line" />
                VISIT OUR WORKSHOP
              </span>

              <h2>
                LET'S TALK
                <br />
                <span>ABOUT YOUR CAR.</span>
              </h2>
            </div>

            <p>
              Visit Tulja Motors in Kolhapur or contact our team
              to discuss your vehicle's repair and service needs.
            </p>
          </div>

          <div className="tulja-contact-grid">

            <div className="tulja-contact-details">

              <div className="tulja-contact-item">
                <span className="tulja-contact-icon">
                  <MapPin size={22} />
                </span>

                <div>
                  <small>WORKSHOP LOCATION</small>
                  <strong>Tulja Motors, Kolhapur</strong>
                  <p>
                    Pune–Bengaluru National Highway NH48,
                    near Shetimal Petrol Pump, Top Sambhapur,
                    Kolhapur, Maharashtra 416122.
                  </p>
                </div>
              </div>

              <div className="tulja-contact-item">
                <span className="tulja-contact-icon">
                  <Phone size={22} />
                </span>

                <div>
                  <small>CALL OUR TEAM</small>
                  <strong>91301 29205</strong>
                  <p>Contact us for workshop enquiries.</p>
                  <a href="tel:9130129205">
                    CALL NOW <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>

              <div className="tulja-contact-item">
                <span className="tulja-contact-icon">
                  <Building2 size={22} />
                </span>

                <div>
                  <small>WORKSHOP SERVICES</small>
                  <strong>Automotive Repair & Restoration</strong>
                  <p>
                    Accident repair, painting, mechanical work
                    and vehicle restoration.
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="tulja-button tulja-button-primary tulja-contact-button"
              >
                CONTACT TULJA MOTORS
                <ArrowUpRight size={18} />
              </Link>

            </div>

            <div className="tulja-map-card">
              <iframe
                title="Tulja Motors Kolhapur location map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=74.279622%2C16.793993%2C74.289622%2C16.803993&layer=mapnik&marker=16.798993%2C74.284622"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <a
                href="https://www.google.com/maps/search/?api=1&query=16.798993%2C74.284622"
                target="_blank"
                rel="noreferrer"
                className="tulja-map-link"
              >
                OPEN DIRECTIONS
                <ArrowUpRight size={17} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================
          BOTTOM BRAND STRIP
      ====================================== */}
      <section className="tulja-bottom-strip">
        <div className="tulja-container">
          <div className="tulja-bottom-brand">
            <BadgeCheck size={19} />
            <span>TULJA MOTORS</span>
          </div>

          <p>REPAIR · RESTORE · REBUILD</p>

          <Link href="/contact">
            START YOUR ENQUIRY
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

    </main>
  );
}
