import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { beforeAfterProjects } from "../project-data";
import "../project-details.css";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return beforeAfterProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;

  const project = beforeAfterProjects.find(
    (item) => item.slug === slug
  );

  if (!project) {
    return {
      title: "Project Not Found | Tulja Motors",
    };
  }

  return {
    title: `${project.title} | Tulja Motors`,
    description: project.description,
  };
}

export default async function ProjectDetailsPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const projectIndex = beforeAfterProjects.findIndex(
    (item) => item.slug === slug
  );

  if (projectIndex === -1) {
    notFound();
  }

  const project = beforeAfterProjects[projectIndex];

  const relatedProjects = beforeAfterProjects.filter(
    (item) => item.slug !== project.slug
  );

  const previousProject =
    beforeAfterProjects[
      (projectIndex - 1 + beforeAfterProjects.length) %
        beforeAfterProjects.length
    ];

  const nextProject =
    beforeAfterProjects[
      (projectIndex + 1) % beforeAfterProjects.length
    ];

  return (
    <main className="tm-project-page">
      {/* HERO */}

      <section
        className="tm-project-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(3, 43, 43, 0.96) 0%, rgba(3, 43, 43, 0.82) 48%, rgba(3, 43, 43, 0.24) 100%), url("${project.afterImage}")`,
        }}
      >
        <div className="tm-project-hero-content">
          <Link href="/" className="tm-project-back">
            <ArrowLeft size={16} />
            BACK TO HOME
          </Link>

          <div className="tm-project-eyebrow">
            {project.brand}
            <span />
            PROJECT SPOTLIGHT
          </div>

          <span className="tm-project-number">
            PROJECT {project.number}
          </span>

          <h1>
            {project.vehicle}
            <span>{project.title}</span>
          </h1>

          <p>{project.description}</p>

          <div className="tm-project-hero-tags">
            <span>{project.service}</span>
            <span>
              <Clock3 size={14} />
              {project.estimatedDays}
            </span>
          </div>
        </div>

        <div className="tm-project-hero-bottom">
          <span>{project.brand}</span>
          <span>REPAIR · RESTORATION · CUSTOMISATION</span>
        </div>

        <div className="tm-project-hero-index">
          {project.number}
        </div>
      </section>

      {/* OVERVIEW */}

      <section className="tm-project-overview">
        <div className="tm-project-container">
          <div className="tm-project-overview-heading">
            <div>
              <span className="tm-project-kicker">
                <span /> PROJECT OVERVIEW
              </span>

              <h2>
                A FRESH LOOK.
                <br />
                <span>A NEW ROAD AHEAD.</span>
              </h2>
            </div>

            <p>{project.description}</p>
          </div>

          <div className="tm-project-stats">
            <div className="tm-project-stat">
              <CarFront />
              <span>VEHICLE</span>
              <strong>{project.vehicle}</strong>
            </div>

            <div className="tm-project-stat">
              <Wrench />
              <span>PROJECT TYPE</span>
              <strong>{project.projectType}</strong>
            </div>

            <div className="tm-project-stat">
              <Clock3 />
              <span>ESTIMATED TIMELINE</span>
              <strong>{project.timeline}</strong>
            </div>

            <div className="tm-project-stat">
              <CalendarDays />
              <span>PROJECT STATUS</span>
              <strong>{project.status}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE AND AFTER */}

      <section className="tm-project-gallery-section">
        <div className="tm-project-container">
          <div className="tm-project-section-heading">
            <span className="tm-project-kicker">
              <span /> VISUAL COMPARISON
            </span>

            <h2>
              BEFORE <span>&</span> AFTER
            </h2>

            <p>
              Take a closer look at the vehicle condition and its
              transformation through the project photographs.
            </p>
          </div>

          <div className="tm-project-comparison">
            <article className="tm-project-photo">
              <div className="tm-project-photo-image">
                <img
                  src={project.beforeImage}
                  alt={`${project.vehicle} before work`}
                />
                <span className="tm-project-photo-corner">
                  01 / BEFORE
                </span>
              </div>

              <div className="tm-project-photo-caption">
                <span className="tm-photo-dot tm-photo-dot-before" />
                <div>
                  <strong>BEFORE</strong>
                  <p>Initial vehicle condition</p>
                </div>
              </div>
            </article>

            <div className="tm-project-comparison-divider">
              <span>TRANSFORMATION</span>
              <ArrowRight size={20} />
            </div>

            <article className="tm-project-photo">
              <div className="tm-project-photo-image">
                <img
                  src={project.afterImage}
                  alt={`${project.vehicle} after work`}
                />
                <span className="tm-project-photo-corner">
                  02 / AFTER
                </span>
              </div>

              <div className="tm-project-photo-caption">
                <span className="tm-photo-dot tm-photo-dot-after" />
                <div>
                  <strong>AFTER</strong>
                  <p>Final project appearance</p>
                </div>
              </div>
            </article>
          </div>

          <p className="tm-project-image-note">
            Photographs are provided for visual reference. Actual repair
            procedures and results depend on the vehicle's condition and
            agreed scope of work.
          </p>
        </div>
      </section>

      {/* WORKING STRATEGY */}

      <section className="tm-project-strategy-section">
        <div className="tm-project-container">
          <div className="tm-project-strategy-heading">
            <div>
              <span className="tm-project-kicker">
                <span /> OUR WORKING STRATEGY
              </span>

              <h2>
                FROM FIRST
                <br />
                <span>INSPECTION TO FINISH.</span>
              </h2>
            </div>

            <div className="tm-project-strategy-summary">
              <span className="tm-strategy-summary-icon">
                <Clock3 size={22} />
              </span>

              <div>
                <small>ESTIMATED PROJECT DURATION</small>
                <strong>{project.estimatedDays}</strong>
                <p>Based on the proposed project workflow</p>
              </div>
            </div>
          </div>

          <div className="tm-project-timeline">
            {project.workflow.map((step, index) => (
              <article className="tm-project-timeline-item" key={step.title}>
                <div className="tm-timeline-marker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="tm-timeline-content">
                  <div className="tm-timeline-top">
                    <div>
                      <span className="tm-timeline-step">
                        STEP {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3>{step.title}</h3>
                    </div>

                    <span className="tm-timeline-duration">
                      <Clock3 size={15} />
                      {step.duration}
                    </span>
                  </div>

                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="tm-project-timeline-note">
            <ShieldCheck size={20} />
            <p>
              <strong>Time estimate:</strong> These are indicative working
              durations. The actual schedule may change depending on damage
              severity, parts availability, customer approval, workshop
              workload and paint or coating curing requirements.
            </p>
          </div>
        </div>
      </section>

      {/* WORK BREAKDOWN */}

      <section className="tm-project-work-section">
        <div className="tm-project-container tm-project-work-grid">
          <div className="tm-project-work-intro">
            <span className="tm-project-kicker">
              <span /> WORK BREAKDOWN
            </span>

            <h2>
              THE WORK
              <br />
              <span>BEHIND THE FINISH.</span>
            </h2>

            <p>
              Every vehicle project starts with understanding its condition
              and identifying the right approach. The work involved depends
              on the vehicle and its specific requirements.
            </p>

            <div className="tm-project-work-icon">
              <Wrench size={30} />
            </div>
          </div>

          <div className="tm-project-work-list">
            {project.workItems.map((item, index) => (
              <div className="tm-project-work-item" key={item}>
                <span className="tm-work-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p>{item}</p>

                <CheckCircle2 size={19} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY CHECK */}

      <section className="tm-project-quality-section">
        <div className="tm-project-container">
          <div className="tm-project-quality-card">
            <div className="tm-quality-icon">
              <ShieldCheck size={34} />
            </div>

            <div className="tm-quality-copy">
              <span className="tm-project-kicker">
                THE FINAL CHECK
              </span>

              <h2>
                FINISHING MATTERS.
                <span> SO DOES EVERY DETAIL.</span>
              </h2>

              <p>
                Before delivery, the proposed inspection checklist covers
                the completed work, visible finish, fitment and overall
                vehicle presentation.
              </p>
            </div>

            <div className="tm-quality-checks">
              <span>
                <CheckCircle2 size={17} />
                Workmanship review
              </span>

              <span>
                <CheckCircle2 size={17} />
                Exterior finish check
              </span>

              <span>
                <CheckCircle2 size={17} />
                Fitment and alignment
              </span>

              <span>
                <CheckCircle2 size={17} />
                Final vehicle inspection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED PROJECTS */}

      <section className="tm-project-related-section">
        <div className="tm-project-container">
          <div className="tm-project-related-heading">
            <div>
              <span className="tm-project-kicker">
                <span /> MORE FROM OUR WORK
              </span>

              <h2>
                EXPLORE MORE
                <span> PROJECTS.</span>
              </h2>
            </div>

            <p>
              Discover more repair, restoration and customisation
              projects from our workshop.
            </p>
          </div>

          <div className="tm-project-related-grid">
            {relatedProjects.slice(0, 3).map((item) => (
              <Link
                href={`/projects/${item.slug}`}
                className="tm-related-card"
                key={item.slug}
              >
                <div className="tm-related-image">
                  <img src={item.afterImage} alt={item.vehicle} />

                  <span>{item.number}</span>

                  <div className="tm-related-arrow">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="tm-related-content">
                  <small>{item.brand}</small>
                  <h3>{item.vehicle}</h3>
                  <p>{item.service}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT NAVIGATION */}

      <section className="tm-project-navigation-section">
        <div className="tm-project-container">
          <Link
            href={`/projects/${previousProject.slug}`}
            className="tm-project-nav-link"
          >
            <ArrowLeft size={18} />
            <span>
              <small>PREVIOUS PROJECT</small>
              <strong>{previousProject.vehicle}</strong>
            </span>
          </Link>

          <Link
            href={`/projects/${nextProject.slug}`}
            className="tm-project-nav-link tm-project-nav-next"
          >
            <span>
              <small>NEXT PROJECT</small>
              <strong>{nextProject.vehicle}</strong>
            </span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* CTA */}

      <section className="tm-project-cta-section">
        <div className="tm-project-container">
          <div className="tm-project-cta">
            <div className="tm-project-cta-content">
              <span className="tm-project-kicker">
                <span /> HAVE A PROJECT IN MIND?
              </span>

              <h2>
                LET&apos;S TALK
                <br />
                <span>ABOUT YOUR CAR.</span>
              </h2>

              <p>
                Contact our team to discuss accident repair, restoration,
                detailing or customisation requirements for your vehicle.
              </p>

              <div className="tm-project-cta-trust">
                <Sparkles size={17} />
                YOUR VEHICLE. OUR ATTENTION TO DETAIL.
              </div>
            </div>

            <div className="tm-project-cta-actions">
              <a href="tel:+919130129205">
                CALL OUR TEAM
                <ArrowUpRight size={17} />
              </a>

              <a
                href={`https://wa.me/919130129205?text=${encodeURIComponent(
                  `Hello, I am interested in the ${project.title} project for my vehicle.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                WHATSAPP ENQUIRY
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          <div className="tm-project-bottom-row">
            <Link href="/" className="tm-project-return">
              <ArrowLeft size={16} />
              RETURN TO TULJA MOTORS
            </Link>

            <div className="tm-project-location">
              <MapPin size={16} />
              NH 48 · Top Sambhapur · Kolhapur, Maharashtra
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}