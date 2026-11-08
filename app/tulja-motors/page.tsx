import Link from "next/link";
import {
  ArrowUpRight,
  CarFront,
  Paintbrush,
  Wrench,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import InnerPageHero from "../components/InnerPageHero";
import "../inner-pages.css";

const services = [
  {
    title: "Accident Repair",
    description: "Collision damage repair and vehicle body restoration.",
    image: "/images/services/Accident%20Repair.jpg",
    icon: CarFront,
  },
  {
    title: "Denting & Painting",
    description: "Dent removal, panel work and quality paint finishing.",
    image: "https://www.team-bhp.com/sites/default/files/styles/amp_high_res/public/nexon_1.jpeg",
    icon: Paintbrush,
  },
  {
    title: "Car Restoration",
    description: "Complete vehicle restoration and refurbishment solutions.",
    image: "/images/services/Car%20Restoration.jpg",
    icon: Wrench,
  },
  {
    title: "Mechanical Repairs",
    description: "Vehicle inspection, diagnosis and mechanical repairs.",
    image: "/images/services/mechanical-repair.jpg",
    icon: Settings,
  },
  {
    title: "Insurance Assistance",
    description: "Guidance throughout the vehicle insurance claim process.",
    image: "/images/services/insurance-assistance.jpg",
    icon: ShieldCheck,
  },
  {
    title: "Car Renovation",
    description: "Refresh your vehicle with renovation and upgrade work.",
    image: "/images/services/car-renovation.jpg",
    icon: Sparkles,
  },
];

export default function TuljaMotorsPage() {
  return (
    <main className="inner-page">
      <InnerPageHero
        eyebrow="TULJA MOTORS"
        title="ACCIDENT REPAIR &"
        highlight="DENTING PAINTING."
        description="Professional vehicle repair, mechanical services and restoration solutions in Kolhapur."
        image="/images/services/Accident%20Repair.jpg"
      />

      <section className="ip-section">
        <div className="ip-container">
          <div className="ip-heading">
            <span className="ip-eyebrow">WHAT WE DO</span>
            <h2>
              COMPLETE VEHICLE
              <span> REPAIR SOLUTIONS.</span>
            </h2>
            <p>
              Explore our automotive repair and restoration services.
            </p>
          </div>

          <div className="ip-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article className="ip-service-card" key={service.title}>
                  <div className="ip-card-image">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="ip-service-content">
                    <Icon size={26} />
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <Link href="/contact">
                      Enquire Now <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ip-cta">
        <div className="ip-container">
          <span>TULJA MOTORS · KOLHAPUR</span>
          <h2>NEED YOUR CAR REPAIRED?</h2>
          <Link href="/contact">
            Book a Service Enquiry <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}