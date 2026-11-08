import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CarFront,
  Lightbulb,
  Layers,
  Armchair,
} from "lucide-react";
import InnerPageHero from "../components/InnerPageHero";
import "../inner-pages.css";

const services = [
  {
    title: "Exterior Modification",
    description: "Personalise your car's exterior appearance and styling.",
    image:
      "https://imgx.gridoto.com/crop/0x126%3A740x654/700x465/photo/2020/01/21/3740741001.jpg",
    icon: CarFront,
  },
  {
    title: "Interior Modification",
    description: "Refresh your cabin with personalised interior upgrades.",
    image: "/images/services/Car%20Restoration.jpg",
    icon: Armchair,
  },
  {
    title: "Ceramic Coating",
    description: "Enhance paint appearance with professional coating solutions.",
    image:
      "https://thedetailinggang.com/images/price-list/3m-ceramic-coating-price-list.webp",
    icon: Sparkles,
  },
  {
    title: "PPF Installation",
    description: "Paint protection film solutions for vehicle surfaces.",
    image:
      "https://s3-ap-southeast-1.amazonaws.com/permaisuriban/img/20210702/portfolio/OZ_Racing_Italia_150_with_KIA_Seltos_gallery_13.jpg",
    icon: ShieldCheck,
  },
  {
    title: "Car Detailing",
    description: "Detailed vehicle cleaning and appearance enhancement.",
    image:
      "https://thedetailinggang.com/images/price-list/3m-ceramic-coating-price-list.webp",
    icon: Sparkles,
  },
  {
    title: "Ambient Lighting",
    description: "Add a distinctive lighting experience to your cabin.",
    image: "/images/services/car-renovation.jpg",
    icon: Lightbulb,
  },
  {
    title: "Premium Seat Covers",
    description: "Upgrade your seating with stylish upholstery options.",
    image: "/images/services/Car%20Restoration.jpg",
    icon: Armchair,
  },
  {
    title: "7D Floor Mats",
    description: "Practical interior floor protection and styling.",
    image: "/images/services/car-renovation.jpg",
    icon: Layers,
  },
];

export default function SharvariMotorsPage() {
  return (
    <main className="inner-page">
      <InnerPageHero
        eyebrow="SHARVARI MOTORS"
        title="STYLE YOUR DRIVE."
        highlight="MAKE IT YOURS."
        description="Discover vehicle customisation, interior styling, exterior upgrades and premium protection solutions."
        image="https://imgx.gridoto.com/crop/0x126%3A740x654/700x465/photo/2020/01/21/3740741001.jpg"
      />

      <section className="ip-section">
        <div className="ip-container">
          <div className="ip-heading">
            <span className="ip-eyebrow">PERSONALISE YOUR VEHICLE</span>
            <h2>
              MAKE EVERY DETAIL
              <span> COUNT.</span>
            </h2>
            <p>
              Explore styling, protection and comfort upgrades for your vehicle.
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
          <span>SHARVARI MOTORS</span>
          <h2>READY TO PERSONALISE YOUR CAR?</h2>
          <Link href="/contact">
            Start Your Enquiry <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}