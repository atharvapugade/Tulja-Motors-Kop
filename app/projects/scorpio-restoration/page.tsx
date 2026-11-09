import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Wrench,
} from "lucide-react";
import "./project-details.css";

const beforeImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=90";

const afterImage =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=90";

const workItems = [
  "Initial vehicle condition inspection",
  "Body damage assessment",
  "Panel repair and alignment planning",
  "Denting and surface preparation",
  "Paint finishing and exterior detailing",
  "Final quality inspection",
];

export default function ScorpioRestorationPage() {
  return (
    <main className="tm-project-page">
      <section className="tm-project-hero">
        <div className="tm-project-hero-image" />

        <div className="tm-project-hero-content">
          <Link href="/" className="tm-project-back">
            <ArrowLeft size={16} />
            BACK TO HOME
          </Link>

          <div className="tm-project-eyebrow">
            TULJA MOTORS / PROJECT SPOTLIGHT
          </div>

          <h1>
            MAHINDRA
            <br />
            <span>SCORPIO</span>
            <br />
            RESTORATION
          </h1>

          <p>
            A sample project detail page showcasing the stages involved
            in vehicle body repair and exterior restoration.
          </p>

          <span className="tm-project-demo-label">
            DEMO PROJECT · SAMPLE CONTENT
          </span>
        </div>
      </section>

      <section className="tm-project-overview">
        <div className="tm-project-container">
          <div className="tm-project-overview-heading">
            <div>
              <span className="tm-project-kicker">PROJECT OVERVIEW</span>
              <h2>
                A FRESH LOOK.
                <br />
                A NEW ROAD AHEAD.
              </h2>
            </div>

            <p>
              This page is a preview of how individual workshop projects
              can be presented. Later, actual vehicle photographs,
              customer-approved details and project updates can be managed
              through the admin panel.
            </p>
          </div>

          <div className="tm-project-stats">
            <div>
              <CarFront size={21} />
              <span>VEHICLE</span>
              <strong>Mahindra Scorpio</strong>
            </div>

            <div>
              <Wrench size={21} />
              <span>PROJECT TYPE</span>
              <strong>Body Restoration</strong>
            </div>

            <div>
              <Clock3 size={21} />
              <span>ESTIMATED TIMELINE</span>
              <strong>Project-specific</strong>
            </div>

            <div>
              <CalendarDays size={21} />
              <span>PROJECT STATUS</span>
              <strong>Demo Preview</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="tm-project-gallery-section">
        <div className="tm-project-container">
          <div className="tm-project-section-heading">
            <span className="tm-project-kicker">VISUAL COMPARISON</span>
            <h2>BEFORE & AFTER</h2>
            <p>
              A side-by-side visual layout for presenting a vehicle
              transformation.
            </p>
          </div>

          <div className="tm-project-comparison">
            <article className="tm-project-photo">
              <img src={beforeImage} alt="Illustrative vehicle before work" />
              <span>BEFORE</span>
            </article>

            <article className="tm-project-photo">
              <img src={afterImage} alt="Illustrative vehicle after work" />
              <span>AFTER</span>
            </article>
          </div>

          <p className="tm-project-image-note">
            These are illustrative stock photographs, not verified
            photographs of an actual Mahindra Scorpio project.
          </p>
        </div>
      </section>

      <section className="tm-project-work-section">
        <div className="tm-project-container tm-project-work-grid">
          <div className="tm-project-work-intro">
            <span className="tm-project-kicker">WORK BREAKDOWN</span>
            <h2>
              THE WORK
              <br />
              BEHIND THE FINISH.
            </h2>

            <p>
              Every restoration begins with understanding the vehicle's
              condition. The actual repair plan, parts and finishing
              process depend on a physical inspection.
            </p>

            <div className="tm-project-work-icon">
              <Wrench size={28} />
            </div>
          </div>

          <div className="tm-project-work-list">
            {workItems.map((item, index) => (
              <div className="tm-project-work-item" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
                <CheckCircle2 size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tm-project-cta-section">
        <div className="tm-project-container">
          <div className="tm-project-cta">
            <div>
              <span className="tm-project-kicker">HAVE A PROJECT IN MIND?</span>
              <h2>
                LET&apos;S TALK
                <br />
                ABOUT YOUR CAR.
              </h2>
              <p>
                Contact Tulja Motors to discuss accident repair,
                restoration or bodywork requirements.
              </p>
            </div>

            <div className="tm-project-cta-actions">
              <a href="tel:+919130129205">
                CALL OUR TEAM <ArrowUpRight size={17} />
              </a>

              <a
                href="https://wa.me/919130129205?text=Hello%20Tulja%20Motors%2C%20I%20want%20to%20enquire%20about%20a%20vehicle%20restoration%20project."
                target="_blank"
                rel="noreferrer"
              >
                WHATSAPP ENQUIRY <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          <Link href="/" className="tm-project-return">
            <ArrowLeft size={16} />
            RETURN TO TULJA MOTORS
          </Link>

          <div className="tm-project-location">
            <MapPin size={15} />
            NH 48 · Top Sambhapur · Kolhapur, Maharashtra
          </div>
        </div>
      </section>
    </main>
  );
}