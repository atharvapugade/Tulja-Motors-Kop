import Link from "next/link";
import {
  ArrowUpRight,
  CarFront,
  Paintbrush,
  Wrench,
  Settings,
  ShieldCheck,
  Sparkles,
  Gauge,
  Disc3,
  ClipboardCheck,
  Phone,
  CheckCircle2,
} from "lucide-react";
import "./tulja-motors.css";

const services = [
  {
    number: "01",
    title: "Accident Repair",
    category: "BODY SHOP",
    description:
      "From minor collision damage to major body repairs, we bring your vehicle back to its original form.",
    image: "/images/services/Accident%20Repair.jpg",
    icon: CarFront,
    size: "large",
  },
  {
    number: "02",
    title: "Denting & Painting",
    category: "BODY FINISH",
    description:
      "Professional dent removal, panel correction and smooth paint finishing for a refreshed look.",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=85",
    icon: Paintbrush,
    size: "normal",
  },
  {
    number: "03",
    title: "Full Car Restoration",
    category: "RESTORATION",
    description:
      "Careful restoration work to renew the appearance, finish and overall condition of your car.",
    image: "/images/services/Car%20Restoration.jpg",
    icon: Wrench,
    size: "normal",
  },
  {
    number: "04",
    title: "Mechanical Repairs",
    category: "MECHANICAL",
    description:
      "Inspection, troubleshooting and repair support to keep your vehicle performing reliably.",
    image: "/images/services/mechanical-repair.jpg",
    icon: Settings,
    size: "normal",
  },
  {
    number: "05",
    title: "Insurance Claim Support",
    category: "CLAIM ASSISTANCE",
    description:
      "Assistance through the accident repair claim process, from initial guidance to repair coordination.",
    image: "/images/services/insurance-assistance.jpg",
    icon: ShieldCheck,
    size: "large",
  },
  {
    number: "06",
    title: "Car Renovation",
    category: "REFRESH & RENEW",
    description:
      "Give your car a new lease of life with appearance improvements and refurbishment work.",
    image: "/images/services/car-renovation.jpg",
    icon: Sparkles,
    size: "normal",
  },
  {
    number: "07",
    title: "Interior & Exterior Detailing",
    category: "CAR CARE",
    description:
      "A detailed clean-up and finish-focused care for your car's interior and exterior surfaces.",
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=85",
    icon: Gauge,
    size: "normal",
  },
  {
    number: "08",
    title: "Bumper & Panel Repair",
    category: "PANEL WORK",
    description:
      "Repair and refinishing of damaged bumpers, panels and exterior components.",
    image:
      "https://images.unsplash.com/photo-1613214150384-6f6b8e5e3b5b?auto=format&fit=crop&w=1200&q=85",
    icon: Disc3,
    size: "normal",
  },
];

const process = [
  {
    number: "01",
    title: "Vehicle Inspection",
    description:
      "We inspect the vehicle and understand the damage or service requirement.",
  },
  {
    number: "02",
    title: "Repair Planning",
    description:
      "Our team discusses the required work and the next steps with you.",
  },
  {
    number: "03",
    title: "Workshop Execution",
    description:
      "The vehicle moves through the required repair, painting or restoration work.",
  },
  {
    number: "04",
    title: "Final Check",
    description:
      "We review the completed work before handing the vehicle back to you.",
  },
];

export default function TuljaMotorsPage() {
  return (
    <main className="tm-services-page">
      {/* INTRODUCTION — deliberately no hero banner */}
      <section className="tm-services-intro">
        <div className="tm-services-container">
          <div className="tm-intro-topline">
            <span className="tm-section-kicker">
              <span className="tm-kicker-dot" />
              TULJA MOTORS · KOLHAPUR
            </span>

            <span className="tm-intro-index">AUTOMOTIVE CARE / 01</span>
          </div>

          <div className="tm-intro-layout">
            <div className="tm-intro-heading">
              <h1>
                WE REPAIR.
                <br />
                <span>WE RESTORE.</span>
                <br />
                YOU DRIVE.
              </h1>
            </div>

            <div className="tm-intro-description">
              <span className="tm-intro-line" />
              <p>
                More than just a repair workshop. Tulja Motors brings together
                accident repair, denting and painting, mechanical work and
                vehicle restoration — with attention to every detail.
              </p>

              <Link href="/contact" className="tm-intro-link">
                DISCUSS YOUR REQUIREMENT
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="tm-intro-bottom">
            <span>COMPLETE AUTOMOTIVE SOLUTIONS</span>
            <span>BUILT AROUND YOUR VEHICLE</span>
          </div>
        </div>
      </section>

      {/* VISUAL SERVICE COLLECTION */}
      <section className="tm-service-collection" id="services">
        <div className="tm-services-container">
          <div className="tm-collection-heading">
            <div>
              <span className="tm-section-kicker">
                <span className="tm-kicker-dot" />
                OUR WORKSHOP CAPABILITIES
              </span>

              <h2>
                ONE WORKSHOP.
                <br />
                <span>MANY SOLUTIONS.</span>
              </h2>
            </div>

            <p>
              Explore the range of automotive services available at Tulja
              Motors. Every vehicle gets the attention its condition and
              requirements deserve.
            </p>
          </div>

          <div className="tm-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className={`tm-service-tile ${
                    service.size === "large" ? "tm-service-tile-large" : ""
                  }`}
                  key={service.number}
                >
                  <div className="tm-service-photo">
                    <img
                      src={service.image}
                      alt={`${service.title} at Tulja Motors`}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="tm-service-photo-overlay" />

                    <span className="tm-service-number">
                      {service.number}
                    </span>

                    <span className="tm-service-category">
                      {service.category}
                    </span>

                    <div className="tm-service-photo-icon">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>
                  </div>

                  <div className="tm-service-tile-content">
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>

                    <Link
                      href="/contact"
                      aria-label={`Enquire about ${service.title}`}
                      className="tm-service-arrow"
                    >
                      <ArrowUpRight size={21} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WORKSHOP HIGHLIGHT STRIP */}
      <section className="tm-workshop-highlight">
        <div className="tm-workshop-highlight-image">
          <img
            src="https://images.unsplash.com/photo-1632823471565-1ecdf5c7a7a5?auto=format&fit=crop&w=1800&q=85"
            alt="Automotive workshop and vehicle service"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="tm-workshop-highlight-overlay" />

        <div className="tm-services-container tm-workshop-highlight-content">
          <span className="tm-section-kicker">
            <span className="tm-kicker-dot" />
            THE TULJA MOTORS APPROACH
          </span>

          <h2>
            EVERY VEHICLE
            <br />
            HAS A STORY.
            <br />
            <span>LET'S RESTORE IT.</span>
          </h2>

          <p>
            Whether it is accident damage, a fresh paint finish or a complete
            vehicle refresh, our focus is on careful work and a better
            ownership experience.
          </p>

          <Link href="/contact" className="tm-highlight-button">
            TALK TO OUR TEAM
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="tm-service-values">
        <div className="tm-services-container">
          <div className="tm-values-heading">
            <span className="tm-section-kicker">
              <span className="tm-kicker-dot" />
              WHY TULJA MOTORS
            </span>

            <h2>
              GOOD WORK IS
              <br />
              <span>IN THE DETAILS.</span>
            </h2>
          </div>

          <div className="tm-values-grid">
            <div className="tm-value-item">
              <span className="tm-value-icon">
                <CarFront size={25} />
              </span>
              <span className="tm-value-number">01</span>
              <h3>Multiple Car Brands</h3>
              <p>
                Repair and service support for a range of Indian and
                international car brands.
              </p>
            </div>

            <div className="tm-value-item">
              <span className="tm-value-icon">
                <ClipboardCheck size={25} />
              </span>
              <span className="tm-value-number">02</span>
              <h3>Work With a Plan</h3>
              <p>
                Understand the vehicle's requirements before moving ahead
                with the repair work.
              </p>
            </div>

            <div className="tm-value-item">
              <span className="tm-value-icon">
                <Paintbrush size={25} />
              </span>
              <span className="tm-value-number">03</span>
              <h3>Finish-Focused Work</h3>
              <p>
                Attention to panel alignment, surface preparation and the
                final appearance.
              </p>
            </div>

            <div className="tm-value-item">
              <span className="tm-value-icon">
                <ShieldCheck size={25} />
              </span>
              <span className="tm-value-number">04</span>
              <h3>Insurance Guidance</h3>
              <p>
                Get guidance on the insurance claim process for eligible
                accident repair work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="tm-service-process">
        <div className="tm-services-container">
          <div className="tm-process-heading">
            <div>
              <span className="tm-section-kicker">
                <span className="tm-kicker-dot" />
                SIMPLE & CLEAR
              </span>

              <h2>
                FROM INSPECTION
                <br />
                <span>TO ROAD READY.</span>
              </h2>
            </div>

            <p>
              A clear process helps you understand what happens to your
              vehicle at every stage.
            </p>
          </div>

          <div className="tm-process-grid">
            {process.map((item) => (
              <article className="tm-process-step" key={item.number}>
                <span className="tm-process-number">{item.number}</span>
                <div className="tm-process-rule" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL ENQUIRY */}
      <section className="tm-services-cta">
        <div className="tm-services-container tm-cta-inner">
          <div className="tm-cta-copy">
            <span className="tm-section-kicker">
              <span className="tm-kicker-dot" />
              YOUR CAR. OUR WORKSHOP.
            </span>

            <h2>
              LET'S GET YOUR
              <br />
              <span>CAR BACK IN SHAPE.</span>
            </h2>

            <p>
              Tell us what your vehicle needs. Our team will help you with the
              next step.
            </p>
          </div>

          <div className="tm-cta-actions">
            <Link href="/contact" className="tm-cta-primary">
              MAKE AN ENQUIRY
              <ArrowUpRight size={19} />
            </Link>

            <a href="tel:9130129205" className="tm-cta-phone">
              <Phone size={18} />
              <span>
                <small>CALL TULJA MOTORS</small>
                91301 29205
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* LOCATION NOTE */}
      <div className="tm-services-location">
        <div className="tm-services-container">
          <span>TULJA MOTORS</span>
          <span>
            <CheckCircle2 size={15} />
            PUNE–BENGALURU NH48, TOP SAMBHAPUR, KOLHAPUR
          </span>
          <Link href="/contact">
            FIND US <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}