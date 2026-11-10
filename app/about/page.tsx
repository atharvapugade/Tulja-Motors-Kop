
import Link from "next/link";
import {
  ArrowUpRight,
  Wrench,
  Sparkles,
  Target,
  Eye,
  ShieldCheck,
  CarFront,
  ChevronRight,
} from "lucide-react";

import "../inner-pages.css";

const businesses = [
  {
    title: "Tulja Motors",
    subtitle: "Automotive Repair & Restoration",
    description:
      "From accident repairs and denting to painting, mechanical work and vehicle restoration, we focus on bringing vehicles back to their best condition.",
    image: "/images/services/Accident%20Repair.jpg",
    href: "/tulja-motors",
    icon: Wrench,
    label: "REPAIR & RESTORATION",
  },
  {
    title: "Sharvari Motors",
    subtitle: "Automotive Styling & Customisation",
    description:
      "Enhance your vehicle with interior upgrades, exterior modifications, detailing, ceramic coating, PPF and premium accessories.",
    image: "/images/services/car-renovation.jpg",
    href: "/sharvari-motors",
    icon: Sparkles,
    label: "STYLING & CUSTOMISATION",
  },
];

export default function AboutPage() {
  return (
    <main className="inner-page about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-image" />

        <div className="about-hero-shade" />

        <div className="about-hero-container">
          <div className="about-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>About Us</span>
          </div>

          <div className="about-hero-text">
            <span className="about-hero-tag">
              <span className="about-tag-line" />
              YOUR AUTOMOTIVE DESTINATION
            </span>

            <h1>
              WE DON'T JUST
              <span>CARE FOR CARS.</span>
              WE BRING THEM
              <span>BACK TO LIFE.</span>
            </h1>

            <p>
              Two specialised automotive divisions. One commitment to
              quality, craftsmanship and complete vehicle care.
            </p>

            <div className="about-hero-buttons">
              <Link href="/contact" className="about-btn-primary">
                TALK TO OUR TEAM <ArrowUpRight size={18} />
              </Link>

              <Link href="/#work" className="about-btn-outline">
                VIEW OUR WORK <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="about-hero-bottom">
            <div>
              <CarFront size={20} />
              <span>VEHICLE REPAIR</span>
            </div>
            <div>
              <Wrench size={20} />
              <span>RESTORATION</span>
            </div>
            <div>
              <Sparkles size={20} />
              <span>CUSTOMISATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="about-intro">
        <div className="about-container about-intro-grid">
          <div className="about-intro-heading">
            <span className="about-section-label">WHO WE ARE</span>

            <h2>
              MORE THAN JUST
              <span> AUTOMOTIVE SERVICES.</span>
            </h2>

            <div className="about-heading-line" />
          </div>

          <div className="about-intro-content">
            <p>
              Welcome to Tulja Motors and Sharvari Motors, your automotive
              destination in Kolhapur, Maharashtra.
            </p>

            <p>
              Our two specialised business divisions focus on different
              aspects of vehicle care. Tulja Motors handles vehicle repairs
              and restoration, while Sharvari Motors focuses on styling,
              customisation and vehicle protection.
            </p>

            <p>
              Our goal is to understand every vehicle requirement and help
              customers choose the right service for their cars.
            </p>

            <Link href="/contact" className="about-text-link">
              Get in Touch <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* BUSINESS DIVISIONS */}
      <section className="about-business">
        <div className="about-container">
          <div className="about-section-heading">
            <span className="about-section-label">OUR BUSINESS DIVISIONS</span>

            <h2>
              TWO SPECIALITIES.
              <span> ONE DESTINATION.</span>
            </h2>

            <p>
              Complete automotive solutions through two dedicated
              business divisions.
            </p>
          </div>

          <div className="about-business-grid">
            {businesses.map((business) => {
              const Icon = business.icon;

              return (
                <article className="about-business-card" key={business.title}>
                  <div className="about-business-image">
                    <img src={business.image} alt={business.title} />

                    <span className="about-business-label">
                      {business.label}
                    </span>
                  </div>

                  <div className="about-business-content">
                    <div className="about-business-icon">
                      <Icon size={23} />
                    </div>

                    <span className="about-business-subtitle">
                      {business.subtitle}
                    </span>

                    <h3>{business.title}</h3>

                    <p>{business.description}</p>

                    <Link href={business.href}>
                      EXPLORE SERVICES <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION VISION APPROACH */}
      <section className="about-values">
        <div className="about-container">
          <div className="about-section-heading">
            <span className="about-section-label">WHAT DRIVES US</span>

            <h2>
              OUR VALUES.
              <span> OUR COMMITMENT.</span>
            </h2>

            <p>
              The principles that guide the way we work and serve our
              customers.
            </p>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <div className="about-value-icon">
                <Target size={26} />
              </div>

              <span>01</span>
              <h3>OUR MISSION</h3>

              <p>
                To provide customer-focused automotive repair, restoration
                and customisation solutions with attention to workmanship
                and service quality.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-icon">
                <Eye size={26} />
              </div>

              <span>02</span>
              <h3>OUR VISION</h3>

              <p>
                To build a trusted automotive destination where customers
                can explore complete vehicle care under specialised
                business divisions.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-icon">
                <ShieldCheck size={26} />
              </div>

              <span>03</span>
              <h3>OUR APPROACH</h3>

              <p>
                Clear communication, understanding customer requirements
                and recommending suitable automotive solutions.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="about-final-cta">
        <div className="about-cta-inner">
          <div>
            <span>LET'S GET YOUR JOURNEY STARTED</span>
            <h2>YOUR CAR DESERVES THE RIGHT CARE.</h2>
            <p>Connect with our team to discuss your vehicle requirements.</p>
          </div>

          <Link href="/contact">
            CONTACT OUR TEAM <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>

    </main>
  );
}
