import Link from "next/link";
import {
  ArrowUpRight,
  Wrench,
  Sparkles,
  Target,
  Eye,
  ShieldCheck,
} from "lucide-react";
import "../inner-pages.css";

const businesses = [
  {
    title: "Tulja Motors",
    subtitle: "Automotive Repair & Restoration",
    description:
      "From accident repairs and denting to painting, mechanical work and vehicle restoration, Tulja Motors focuses on bringing vehicles back to their best condition.",
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

      {/* WHO WE ARE */}
      <section className="ip-section about-intro-section">
        <div className="ip-container ip-about-grid">
          <div>
            <span className="ip-eyebrow">ABOUT TULJA & SHARVARI MOTORS</span>

            <h2>
              MORE THAN JUST
              <span> AUTOMOTIVE SERVICES.</span>
            </h2>
          </div>

          <div className="ip-about-copy">
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

            <Link href="/contact" className="about-inline-link">
              Get in Touch <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* BUSINESS DIVISIONS */}
      <section className="ip-section ip-dark-section">
        <div className="ip-container">
          <div className="ip-heading">
            <span className="ip-eyebrow">OUR BUSINESS DIVISIONS</span>

            <h2>
              TWO IDENTITIES.
              <span> ONE AUTOMOTIVE DESTINATION.</span>
            </h2>

            <p>
              Specialised automotive solutions under two dedicated
              business divisions.
            </p>
          </div>

          <div className="ip-business-grid">
            {businesses.map((business) => {
              const Icon = business.icon;

              return (
                <article className="ip-business-card" key={business.title}>
                  <div className="ip-card-image">
                    <img
                      src={business.image}
                      alt={business.title}
                    />

                    <span className="about-card-label">
                      {business.label}
                    </span>
                  </div>

                  <div className="ip-card-content">
                    <Icon size={28} />

                    <span>{business.subtitle}</span>

                    <h3>{business.title}</h3>

                    <p>{business.description}</p>

                    <Link href={business.href}>
                      Explore Services <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION, VISION & APPROACH */}
      <section className="ip-section about-values-section">
        <div className="ip-container">
          <div className="ip-heading about-values-heading">
            <span className="ip-eyebrow">WHAT DRIVES US</span>
            <h2>
              OUR VALUES.
              <span> OUR COMMITMENT.</span>
            </h2>
          </div>

          <div className="ip-values-grid">
            <article>
              <Target size={32} />

              <h3>OUR MISSION</h3>

              <p>
                To provide customer-focused automotive repair, restoration
                and customisation solutions with attention to workmanship
                and service quality.
              </p>
            </article>

            <article>
              <Eye size={32} />

              <h3>OUR VISION</h3>

              <p>
                To build a trusted automotive destination where customers
                can explore complete vehicle care under specialised
                business divisions.
              </p>
            </article>

            <article>
              <ShieldCheck size={32} />

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
      <section className="ip-cta">
        <div className="ip-container">
          <span>YOUR VEHICLE DESERVES THE RIGHT CARE</span>

          <h2>LET&apos;S TALK ABOUT YOUR CAR.</h2>

          <Link href="/contact">
            Contact Our Team <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}