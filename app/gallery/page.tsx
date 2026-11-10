"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Images,
  Wrench,
  ShieldCheck,
} from "lucide-react";

import "./gallery-3d.css";

/* =========================================================
   TYPES
========================================================= */

type GalleryPhoto = {
  image: string;
  caption: string;
  vehicle?: string;
  type?: string;
};

type GalleryGroup = {
  title: string;
  description: string;
  photos: GalleryPhoto[];
};

type SelectedPhoto = {
  group: GalleryGroup;
  photoIndex: number;
};

/* =========================================================
   IMAGE HELPER
========================================================= */

const photo = (id: string, width = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

/* =========================================================
   BEFORE & AFTER PROJECTS
========================================================= */

const beforeAfterProjects = [
  {
    number: "01",
    vehicle: "MAHINDRA SCORPIO",
    title: "SCORPIO RESTORATION",
    brand: "TULJA MOTORS",
    service: "ACCIDENT REPAIR & RESTORATION",
    beforeImage: "/images/before-after/car-1-before.jpeg",
    afterImage: "/images/before-after/car-1-after.jpeg",
  },
  {
    number: "02",
    vehicle: "MARUTI SUZUKI ALTO",
    title: "ALTO BODY REPAIR",
    brand: "TULJA MOTORS",
    service: "DENTING, PAINTING & BODY WORK",
    beforeImage: "/images/before-after/car-2-before.jpeg",
    afterImage: "/images/before-after/car-2-after.jpeg",
  },
  {
    number: "03",
    vehicle: "NEXA BALENO",
    title: "BALENO CUSTOMISATION",
    brand: "SHARVARI MOTORS",
    service: "EXTERIOR STYLING & MODIFICATION",
    beforeImage: "/images/before-after/car-3-before.jpeg",
    afterImage: "/images/before-after/car-3-after.jpeg",
  },
  {
    number: "04",
    vehicle: "KIA SELTOS",
    title: "SELTOS DETAILING",
    brand: "SHARVARI MOTORS",
    service: "PAINT CORRECTION & COATING",
    beforeImage: "/images/before-after/car-4-before.jpeg",
    afterImage: "/images/before-after/car-4-after.jpeg",
  },
  {
    number: "05",
    vehicle: "MAHINDRA THAR",
    title: "THAR INTERIOR UPGRADE",
    brand: "SHARVARI MOTORS",
    service: "INTERIOR MODIFICATION",
    beforeImage: "/images/before-after/car-5-before.jpeg",
    afterImage: "/images/before-after/car-5-after.jpeg",
  },
  {
    number: "06",
    vehicle: "TOYOTA FORTUNER",
    title: "FORTUNER PPF & POLISH",
    brand: "TULJA MOTORS",
    service: "PPF & PAINT PROTECTION",
    beforeImage: "/images/before-after/car-6-before.jpeg",
    afterImage: "/images/before-after/car-6-after.jpeg",
  },
];

/* =========================================================
   BEFORE & AFTER COLLECTION
========================================================= */

const beforeAfterGroup: GalleryGroup = {
  title: "Our Before & After Projects",
  description:
    "Real vehicle transformation photographs from our featured workshop projects.",
  photos: beforeAfterProjects.flatMap((project) => [
    {
      image: project.beforeImage,
      caption: `${project.vehicle} — Before`,
      vehicle: project.title,
      type: "BEFORE",
    },
    {
      image: project.afterImage,
      caption: `${project.vehicle} — After`,
      vehicle: project.title,
      type: "AFTER",
    },
  ]),
};

/* =========================================================
   TULJA MOTORS COLLECTION
========================================================= */

const tuljaGroups: GalleryGroup[] = [
  {
    title: "Indian Cars & SUV Collection",
    description:
      "A selection of popular Indian-market hatchbacks, sedans and SUVs.",
    photos: [
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Indian hatchback styling",
      },
      {
        image: photo("photo-1503376780353-7e6692767b70"),
        caption: "Premium sedan design",
      },
      {
        image: photo("photo-1533473359331-0135ef1b58bf"),
        caption: "SUV exterior inspiration",
      },
      {
        image: photo("photo-1519641471654-76ce0107ad1b"),
        caption: "Premium SUV collection",
      },
      {
        image: photo("photo-1549317661-bd32c8ce0db2"),
        caption: "Modern Indian car styling",
      },
      {
        image: photo("photo-1503736334956-4f8f8e92946d"),
        caption: "Automotive exterior design",
      },
    ],
  },
  {
    title: "Accident Repair & Body Work",
    description:
      "Vehicle body repair, panel restoration and accident repair inspiration.",
    photos: [
      {
        image: photo("photo-1489824904134-891ab64532f1"),
        caption: "Vehicle bodywork",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Exterior inspection",
      },
      {
        image: photo("photo-1503376780353-7e6692767b70"),
        caption: "Vehicle restoration",
      },
      {
        image: photo("photo-1511919884226-fd3cad34687c"),
        caption: "Automotive detailing",
      },
    ],
  },
  {
    title: "Denting, Painting & Finishing",
    description:
      "Paintwork, surface preparation and exterior finishing references.",
    photos: [
      {
        image: photo("photo-1632823471565-1ecdf5c5f8c5"),
        caption: "Automotive paintwork",
      },
      {
        image: photo("photo-1503736334956-4f8f8e92946d"),
        caption: "Exterior finish",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Vehicle exterior",
      },
      {
        image: photo("photo-1489824904134-891ab64532f1"),
        caption: "Body panel repair",
      },
    ],
  },
  {
    title: "Workshop & Mechanical Care",
    description:
      "Workshop environments, vehicle inspection and maintenance references.",
    photos: [
      {
        image: photo("photo-1486262715619-67b85e0b08d3"),
        caption: "Automotive workshop",
      },
      {
        image: photo("photo-1632823471565-1ecdf5c5f8c5"),
        caption: "Vehicle service",
      },
      {
        image: photo("photo-1489824904134-891ab64532f1"),
        caption: "Vehicle inspection",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Vehicle maintenance",
      },
    ],
  },
];

/* =========================================================
   SHARVARI MOTORS COLLECTION
========================================================= */

const sharvariGroups: GalleryGroup[] = [
  {
    title: "Indian Premium Cars & SUVs",
    description:
      "Automotive styling inspiration featuring popular Indian-market vehicles.",
    photos: [
      {
        image: photo("photo-1519641471654-76ce0107ad1b"),
        caption: "Mahindra SUV styling inspiration",
      },
      {
        image: photo("photo-1533473359331-0135ef1b58bf"),
        caption: "SUV exterior styling",
      },
      {
        image: photo("photo-1494976388531-d1058494cdd8"),
        caption: "Premium car styling",
      },
      {
        image: photo("photo-1549317661-bd32c8ce0db2"),
        caption: "Modern vehicle design",
      },
      {
        image: photo("photo-1503376780353-7e6692767b70"),
        caption: "Luxury vehicle finish",
      },
    ],
  },
  {
    title: "Exterior Styling & Modification",
    description:
      "Exterior accessories, styling enhancements and personalised vehicle looks.",
    photos: [
      {
        image: photo("photo-1493238792000-8113da705763"),
        caption: "Exterior styling",
      },
      {
        image: photo("photo-1503376780353-7e6692767b70"),
        caption: "Sports styling",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Vehicle appearance",
      },
      {
        image: photo("photo-1533473359331-0135ef1b58bf"),
        caption: "SUV styling",
      },
    ],
  },
  {
    title: "Premium Interior & Cabin Design",
    description:
      "Interior styling, upholstery, cabin finishes and comfort inspiration.",
    photos: [
      {
        image: photo("photo-1507136566006-cfc505b114fc"),
        caption: "Premium car interior",
      },
      {
        image: photo("photo-1511919884226-fd3cad34687c"),
        caption: "Cabin styling",
      },
      {
        image: photo("photo-1504215680853-026ed2a45def"),
        caption: "Interior atmosphere",
      },
      {
        image: photo("photo-1494976388531-d1058494cdd8"),
        caption: "Interior design",
      },
    ],
  },
  {
    title: "Ceramic Coating & Paint Protection",
    description:
      "Gloss enhancement, paint correction and protection inspiration.",
    photos: [
      {
        image: photo("photo-1607860108855-64acf2078ed9"),
        caption: "Paint protection",
      },
      {
        image: photo("photo-1601362840469-51e4d8d58785"),
        caption: "Gloss detailing",
      },
      {
        image: photo("photo-1503736334956-4f8f8e92946d"),
        caption: "Paint finish",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Exterior gloss",
      },
    ],
  },
  {
    title: "Car Detailing & Finish",
    description:
      "Vehicle cleaning, polishing and refined exterior appearance inspiration.",
    photos: [
      {
        image: photo("photo-1601362840469-51e4d8d58785"),
        caption: "Car detailing",
      },
      {
        image: photo("photo-1607860108855-64acf2078ed9"),
        caption: "Paint finish",
      },
      {
        image: photo("photo-1503376780353-7e6692767b70"),
        caption: "Exterior finish",
      },
      {
        image: photo("photo-1492144534655-ae79c964c9d7"),
        caption: "Vehicle care",
      },
    ],
  },
  {
    title: "Interior Styling & Accessories",
    description:
      "Cabin accessories, ambient lighting and personalised interior inspiration.",
    photos: [
      {
        image: photo("photo-1504215680853-026ed2a45def"),
        caption: "Interior lighting",
      },
      {
        image: photo("photo-1507136566006-cfc505b114fc"),
        caption: "Cabin ambience",
      },
      {
        image: photo("photo-1511919884226-fd3cad34687c"),
        caption: "Interior styling",
      },
    ],
  },
];

/* =========================================================
   COMBINED COLLECTIONS
   One collection per brand, not category-wise
========================================================= */

const tuljaCollection: GalleryGroup = {
  title: "Tulja Motors Collection",
  description:
    "Accident repair, denting, painting, vehicle restoration and mechanical care.",
  photos: tuljaGroups.flatMap((group) => group.photos),
};

const sharvariCollection: GalleryGroup = {
  title: "Sharvari Motors Collection",
  description:
    "Premium interior styling, exterior modifications, detailing and paint protection.",
  photos: sharvariGroups.flatMap((group) => group.photos),
};

/* =========================================================
   PHOTO GROUP — CONTINUOUS AUTO SCROLL
========================================================= */

function PhotoGroup({
  group,
  groupIndex,
  onOpen,
}: {
  group: GalleryGroup;
  groupIndex: number;
  onOpen: (group: GalleryGroup, photoIndex: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;

    if (!track || !group.photos.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    let frame = 0;
    let previousTime = 0;
    let loopWidth = 0;

    const setupTrack = () => {
      loopWidth = track.scrollWidth / 2;

      if (track.scrollLeft === 0 && loopWidth > 0) {
        track.scrollLeft = loopWidth;
      }
    };

    const animate = (time: number) => {
      if (!previousTime) previousTime = time;

      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      if (!pausedRef.current && loopWidth > 0) {
        track.scrollLeft -= 38 * delta;

        if (track.scrollLeft <= 0) {
          track.scrollLeft += loopWidth;
        }
      }

      frame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(setupTrack);
    resizeObserver.observe(track);

    setupTrack();
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [group.photos.length]);

  const renderPhotos = (duplicate = false) =>
    group.photos.map((item, index) => (
      <button
        type="button"
        className="gallery-photo-tile"
        key={`${group.title}-${duplicate ? "duplicate" : "original"}-${index}`}
        onClick={() => {
          if (!duplicate) onOpen(group, index);
        }}
        aria-label={`Open ${item.caption}`}
        tabIndex={duplicate ? -1 : 0}
      >
        <img
          src={item.image}
          alt={item.caption}
          loading="lazy"
          draggable={false}
        />

        <span className="gallery-photo-shade" />

        <span className="gallery-card-number">
          {item.type
            ? item.type
            : String(index + 1).padStart(2, "0")}
        </span>

        <span className="gallery-photo-caption">
          <span>{item.caption}</span>
          <ArrowUpRight size={18} />
        </span>
      </button>
    ));

  return (
    <section className="gallery-photo-group">
      <div className="gallery-group-heading">
        <div>
          <span className="gallery-eyebrow">
            COLLECTION / {String(groupIndex + 1).padStart(2, "0")}
          </span>

          <h3>{group.title}</h3>
          <p>{group.description}</p>
        </div>

        <span className="gallery-group-count">
          {String(group.photos.length).padStart(2, "0")} PHOTOS
        </span>
      </div>

      <div
        className="gallery-track-window"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocusCapture={() => {
          pausedRef.current = true;
        }}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget;

          if (
            !(nextTarget instanceof Node) ||
            !event.currentTarget.contains(nextTarget)
          ) {
            pausedRef.current = false;
          }
        }}
        onTouchStart={() => {
          pausedRef.current = true;
        }}
        onTouchEnd={() => {
          pausedRef.current = false;
        }}
        onTouchCancel={() => {
          pausedRef.current = false;
        }}
      >
        <div className="gallery-photo-grid" ref={trackRef}>
          {renderPhotos()}

          <div
            className="gallery-track-duplicate"
            aria-hidden="true"
          >
            {renderPhotos(true)}
          </div>
        </div>
      </div>

      <div className="gallery-scroll-hint">
        <span />
        AUTO SCROLLING
        <span />
      </div>
    </section>
  );
}

/* =========================================================
   MAIN GALLERY PAGE
========================================================= */

export default function GalleryPage() {
  const [selected, setSelected] = useState<SelectedPhoto | null>(null);

  const openPhoto = (group: GalleryGroup, photoIndex: number) => {
    setSelected({ group, photoIndex });
  };

  const closePhoto = () => {
    setSelected(null);
  };

  const changePhoto = (direction: number) => {
    setSelected((current) => {
      if (!current) return null;

      const total = current.group.photos.length;

      return {
        ...current,
        photoIndex:
          (current.photoIndex + direction + total) % total,
      };
    });
  };

  /* KEYBOARD CONTROLS + BODY SCROLL LOCK */

  useEffect(() => {
    if (!selected) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowRight") changePhoto(1);
      if (event.key === "ArrowLeft") changePhoto(-1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <main className="automotive-gallery">

      {/* =========================================
          01 — BEFORE & AFTER
      ========================================= */}

      <section
        className="gallery-brand-section"
        id="before-after-gallery"
      >
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">
              <span className="gallery-live-dot" />
              01 / VEHICLE TRANSFORMATIONS
            </span>

            <h2>
              BEFORE <span>&</span> AFTER.
            </h2>

            <p>
              Real vehicle transformations from our featured projects.
            </p>
          </div>

          <Images size={30} />
        </div>

        <PhotoGroup
          group={beforeAfterGroup}
          groupIndex={0}
          onOpen={openPhoto}
        />
      </section>

      {/* =========================================
          02 — TULJA MOTORS
      ========================================= */}

      <section
        className="gallery-brand-section"
        id="tulja-gallery"
      >
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">
              <span className="gallery-live-dot" />
              02 / REPAIR & RESTORATION
            </span>

            <h2>
              TULJA MOTORS<span>.</span>
            </h2>

            <p>
              Accident repair, bodywork, restoration and mechanical care.
            </p>
          </div>

          <Wrench size={30} />
        </div>

        <PhotoGroup
          group={tuljaCollection}
          groupIndex={1}
          onOpen={openPhoto}
        />
      </section>

      {/* =========================================
          03 — SHARVARI MOTORS
      ========================================= */}

      <section
        className="gallery-brand-section sharvari-brand-section"
        id="sharvari-gallery"
      >
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">
              <span className="gallery-live-dot" />
              03 / STYLE & PERSONALISATION
            </span>

            <h2>
              SHARVARI MOTORS<span>.</span>
            </h2>

            <p>
              Interior design, exterior styling, protection and detailing.
            </p>
          </div>

          <Camera size={30} />
        </div>

        <PhotoGroup
          group={sharvariCollection}
          groupIndex={2}
          onOpen={openPhoto}
        />
      </section>

      {/* =========================================
          CONTACT CTA
      ========================================= */}

      <section className="gallery-bottom-cta">
        <div className="gallery-bottom-icon">
          <Wrench size={24} />
        </div>

        <div>
          <span className="gallery-eyebrow">
            HAVE A PROJECT IN MIND?
          </span>

          <h2>LET'S TALK ABOUT YOUR VEHICLE.</h2>

          <p>
            Connect with our team about your next automotive project.
          </p>
        </div>

        <a href="/contact">
          CONTACT OUR TEAM
          <ArrowUpRight size={18} />
        </a>
      </section>

      {/* =========================================
          IMAGE NOTE
      ========================================= */}

      <div className="gallery-stock-note">
        <ShieldCheck size={18} />

        <p>
          Before and after project photographs are taken from the
          Tulja Motors and Sharvari Motors homepage project collection.
          Other vehicle photographs are illustrative automotive imagery.
        </p>
      </div>

      {/* =========================================
          IMAGE VIEWER / LIGHTBOX
      ========================================= */}

      {selected && (
        <div
          className="gallery-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePhoto();
            }
          }}
          role="presentation"
        >
          <section
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.group.title}
          >
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closePhoto}
              aria-label="Close gallery"
            >
              <X size={22} />
            </button>

            <div className="gallery-modal-main">
              <img
                src={selected.group.photos[selected.photoIndex].image}
                alt={selected.group.photos[selected.photoIndex].caption}
              />

              <button
                type="button"
                className="gallery-modal-arrow gallery-modal-prev"
                onClick={() => changePhoto(-1)}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={26} />
              </button>

              <button
                type="button"
                className="gallery-modal-arrow gallery-modal-next"
                onClick={() => changePhoto(1)}
                aria-label="Next photograph"
              >
                <ChevronRight size={26} />
              </button>

              <span className="gallery-modal-counter">
                {String(selected.photoIndex + 1).padStart(2, "0")} /{" "}
                {String(selected.group.photos.length).padStart(2, "0")}
              </span>
            </div>

            <div className="gallery-modal-content">
              <span className="gallery-eyebrow">
                PHOTO COLLECTION
              </span>

              <h2>{selected.group.title}</h2>

              <p>{selected.group.description}</p>

              <strong className="gallery-modal-caption">
                {selected.group.photos[selected.photoIndex].caption}
              </strong>

              <div className="gallery-modal-thumbnails">
                {selected.group.photos.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.image}-${index}`}
                    className={
                      selected.photoIndex === index ? "active" : ""
                    }
                    onClick={() =>
                      setSelected((current) =>
                        current
                          ? { ...current, photoIndex: index }
                          : null
                      )
                    }
                    aria-label={`View photograph ${index + 1}`}
                  >
                    <img src={item.image} alt="" />
                  </button>
                ))}
              </div>

              <div className="gallery-modal-footer">
                <span>
                  <Images size={16} />
                  {selected.group.photos.length} PHOTOS
                </span>

                <a href="/contact">
                  ENQUIRE WITH OUR TEAM
                  <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}