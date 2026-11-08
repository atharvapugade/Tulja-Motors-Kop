import Link from "next/link";
import { ArrowUpRight, Home } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
};

export default function InnerPageHero({
  eyebrow,
  title,
  highlight,
  description,
  image,
}: Props) {
  return (
    <section
      className="inner-hero"
      style={{ backgroundImage: `url("${image}")` }}
    >
      <div className="inner-hero-overlay" />

      <div className="inner-hero-content">
        <div className="inner-breadcrumb">
          <Link href="/">
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </div>

        <span className="inner-eyebrow">{eyebrow}</span>

        <h1>
          {title}
          <span>{highlight}</span>
        </h1>

        <p>{description}</p>

        <Link href="/contact" className="inner-primary-btn">
          Get in Touch <ArrowUpRight size={19} />
        </Link>
      </div>

      <div className="inner-hero-bottom">
        <span>REPAIR. RESTORE. REDEFINE.</span>
        <span>PROFESSIONAL AUTOMOTIVE CARE</span>
      </div>
    </section>
  );
}