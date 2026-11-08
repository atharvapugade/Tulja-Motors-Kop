import Link from "next/link";
import {
  ArrowUpRight,
  Armchair,
  CarFront,
  Sparkles,
  ShieldCheck,
  Wrench,
  Lightbulb,
  Layers,
  Gauge,
  Disc3,
  Palette,
  Settings,
} from "lucide-react";
import "./sharvari-motors.css";

const serviceCategories = [
  {
    number: "01",
    title: "Interior Modification",
    subtitle: "YOUR CABIN. YOUR PERSONALITY.",
    description:
      "Transform your car's cabin with customised upholstery, premium materials, ambient lighting and carefully matched interior upgrades.",
    image:
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1500&q=85",
    icon: Armchair,
    services: [
      "Customised Seat Covers",
      "Semi Interior Modification",
      "Complete Interior Modification",
      "Starlight Headliner",
      "Ambient Lighting",
      "Dashboard Customisation",
      "Door Pads & Pillars",
      "7D Mats & Flooring",
    ],
  },
  {
    number: "02",
    title: "Exterior Modification",
    subtitle: "MAKE YOUR CAR STAND OUT.",
    description:
      "Give your vehicle a distinctive road presence with exterior styling, body enhancements, paint upgrades and custom-fit accessories.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1500&q=85",
    icon: CarFront,
    services: [
      "Body Kits & Styling",
      "Front & Rear Bumpers",
      "Front Grills",
      "Headlights & Tail Lights",
      "Spoilers & Beadings",
      "Chrome & Blackout Work",
      "Car Facelift",
      "Exterior Customisation",
    ],
  },
  {
    number: "03",
    title: "Car Detailing & Protection",
    subtitle: "SHINE THAT MAKES AN IMPRESSION.",
    description:
      "Enhance your vehicle's appearance and help protect its surfaces with detailing, paint correction and protective treatments.",
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1500&q=85",
    icon: Sparkles,
    services: [
      "Ceramic Coating",
      "Graphene Coating",
      "Paint Protection Film",
      "Exterior Detailing",
      "Interior Deep Cleaning",
      "Paint Correction",
      "Car Washing",
      "Cleaning & Polishing",
    ],
  },
  {
    number: "04",
    title: "Mechanical Work",
    subtitle: "BEAUTY WITH PERFORMANCE.",
    description:
      "Keep your vehicle in good running condition with routine maintenance, inspections and mechanical repair support.",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1500&q=85",
    icon: Wrench,
    services: [
      "Periodic Car Servicing",
      "General Check-up",
      "Wheel Balancing",
      "Wheel Alignment",
      "Engine Diagnostics",
      "AC Service & Repair",
      "Suspension Work",
      "Periodic Maintenance",
    ],
  },
  {
    number: "05",
    title: "Car Accessories",
    subtitle: "THE RIGHT DETAILS CHANGE EVERYTHING.",
    description:
      "Complete your vehicle's look and functionality with carefully selected accessories and professional fitment.",
    image:
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1500&q=85",
    icon: Settings,
    services: [
      "Headlights & Tail Lights",
      "Infotainment Systems",
      "Reverse Cameras",
      "Body Accessories",
      "Interior Accessories",
      "Safety Accessories",
      "Car Mats & Organisers",
      "Custom Fitment",
    ],
  },
];

const signatureWork = [
  {
    number: "01",
    title: "Customised Dashboard",
    description:
      "Give your dashboard a personalised finish that complements your vehicle's interior theme.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
    icon: Gauge,
  },
  {
    number: "02",
    title: "Premium Seat Covers",
    description:
      "Refresh your seating with customised upholstery, textures and stitching combinations.",
    image:
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1000&q=85",
    icon: Armchair,
  },
  {
    number: "03",
    title: "Ambient Lighting",
    description:
      "Create a distinctive cabin atmosphere with carefully placed interior lighting.",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=85",
    icon: Lightbulb,
  },
  {
    number: "04",
    title: "7D Floor Mats",
    description:
      "Add a tailored floor finish that complements the cabin while helping protect its flooring.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85",
    icon: Layers,
  },
  {
    number: "05",
    title: "Exterior Styling",
    description:
      "Bring a fresh look to your car with carefully selected exterior styling elements.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
    icon: Palette,
  },
  {
    number: "06",
    title: "Paint Protection",
    description:
      "Explore protective solutions designed to preserve your vehicle's exterior finish.",
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=85",
    icon: ShieldCheck,
  },
];

export default function SharvariMotorsPage() {
  return (
    <main className="sm-services-page">
      {/* INTRODUCTION */}
      <section className="sm-intro">
        <div className="sm-container">
          <div className="sm-intro-top">
            <span className="sm-kicker">
              <span />
              SHARVARI MOTORS · AUTOMOTIVE CUSTOMISATION
            </span>

            <span className="sm-intro-count">SERVICES / 2026</span>
          </div>

          <div className="sm-intro-main">
            <div className="sm-intro-title">
              <h1>
                YOUR CAR.
                <br />
                <span>YOUR STYLE.</span>
                <br />
                YOUR SIGNATURE.
              </h1>
            </div>

            <div className="sm-intro-copy">
              <div className="sm-intro-accent" />
              <p>
                Make your vehicle feel more personal. From premium interiors
                and exterior styling to detailing, protection and accessories,
                explore possibilities for your everyday drive.
              </p>

              <Link href="/contact" className="sm-text-link">
                EXPLORE YOUR OPTIONS
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="sm-intro-image">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=90"
              alt="Premium customised car"
              fetchPriority="high"
            />

            <div className="sm-intro-image-shade" />

            <div className="sm-intro-image-caption">
              <span>MAKE IT PERSONAL</span>
              <span>SHARVARI MOTORS</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SERVICE CATEGORIES */}
      <section className="sm-categories" id="services">
        <div className="sm-container">
          <div className="sm-section-heading">
            <div>
              <span className="sm-kicker">
                <span />
                WHAT WE OFFER
              </span>

              <h2>
                EVERYTHING YOUR CAR
                <br />
                <span>CAN BECOME.</span>
              </h2>
            </div>

            <p>
              Explore our range of vehicle customisation, care and maintenance
              solutions. Choose a category to discover the work that suits
              your car.
            </p>
          </div>

          <div className="sm-category-list">
            {serviceCategories.map((category, index) => {
              const Icon = category.icon;

              return (
                <article
                  className={`sm-category-row ${
                    index % 2 !== 0 ? "sm-category-reverse" : ""
                  }`}
                  key={category.number}
                >
                  <div className="sm-category-image">
                    <img
                      src={category.image}
                      alt={category.title}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="sm-category-image-shade" />

                    <span className="sm-category-image-number">
                      / {category.number}
                    </span>

                    <span className="sm-category-image-label">
                      SHARVARI MOTORS
                    </span>
                  </div>

                  <div className="sm-category-content">
                    <div className="sm-category-icon">
                      <Icon size={25} strokeWidth={1.6} />
                    </div>

                    <span className="sm-category-subtitle">
                      {category.subtitle}
                    </span>

                    <h3>{category.title}</h3>

                    <p className="sm-category-description">
                      {category.description}
                    </p>

                    <div className="sm-category-services">
                      {category.services.map((service) => (
                        <span key={service}>
                          <ArrowUpRight size={13} />
                          {service}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      className="sm-category-link"
                      aria-label={`Enquire about ${category.title}`}
                    >
                      ENQUIRE ABOUT THIS SERVICE
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SIGNATURE INTERIOR & EXTERIOR WORK */}
      <section className="sm-signature">
        <div className="sm-container">
          <div className="sm-signature-heading">
            <div>
              <span className="sm-kicker">
                <span />
                THE DETAILS THAT MATTER
              </span>

              <h2>
                SIGNATURE
                <br />
                <span>UPGRADES.</span>
              </h2>
            </div>

            <p>
              Small details can completely change the character of your
              vehicle. Explore some of the customisation options available.
            </p>
          </div>

          <div className="sm-signature-grid">
            {signatureWork.map((item) => {
              const Icon = item.icon;

              return (
                <article className="sm-signature-card" key={item.number}>
                  <div className="sm-signature-photo">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />

                    <span className="sm-signature-number">
                      {item.number}
                    </span>

                    <span className="sm-signature-icon">
                      <Icon size={20} />
                    </span>
                  </div>

                  <div className="sm-signature-card-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <Link href="/contact">
                      ENQUIRE <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="sm-brand-statement">
        <div className="sm-brand-background">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
            alt="Premium vehicle exterior"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="sm-brand-overlay" />

        <div className="sm-container sm-brand-content">
          <span className="sm-kicker">
            <span />
            BEYOND THE ORDINARY
          </span>

          <h2>
            NOT JUST
            <br />
            ANOTHER CAR.
            <br />
            <span>MAKE IT YOURS.</span>
          </h2>

          <p>
            Your taste. Your ideas. Your vehicle. Let's explore the right
            combination of styling, comfort and protection for your drive.
          </p>

          <Link href="/contact" className="sm-brand-button">
            START YOUR CUSTOMISATION
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sm-final-cta">
        <div className="sm-container sm-final-cta-inner">
          <div>
            <span className="sm-kicker">
              <span />
              LET'S CREATE YOUR STYLE
            </span>

            <h2>
              READY TO
              <br />
              <span>UPGRADE YOUR DRIVE?</span>
            </h2>

            <p>
              Tell us what you have in mind. Get in touch with Sharvari Motors
              to discuss your vehicle customisation requirements.
            </p>
          </div>

          <div className="sm-final-actions">
            <Link href="/contact" className="sm-final-primary">
              GET IN TOUCH
              <ArrowUpRight size={19} />
            </Link>

            <a href="tel:9130129205" className="sm-final-phone">
              <span className="sm-phone-icon">
                <CarFront size={20} />
              </span>

              <span>
                <small>CALL OUR TEAM</small>
                91301 29205
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* BOTTOM STRIP */}
      <div className="sm-bottom-strip">
        <div className="sm-container">
          <span>SHARVARI MOTORS</span>
          <span>INTERIOR · EXTERIOR · DETAILING · ACCESSORIES</span>
          <Link href="/contact">
            CONTACT US <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}