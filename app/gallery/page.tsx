
"use client";

import { useEffect, useState } from "react";
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

type GalleryPhoto = {
  image: string;
  caption: string;
};

type GalleryGroup = {
  title: string;
  description: string;
  photos: GalleryPhoto[];
};

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const tuljaGroups: GalleryGroup[] = [
  {
    title: "Accident Recovery & Body Repair",
    description:
      "Automotive accident repair references, damaged body panels and vehicle bodywork.",
    photos: [
      { image: photo("photo-1489824904134-891ab64532f1"), caption: "Vehicle bodywork" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Exterior inspection" },
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Vehicle restoration reference" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Exterior finish" },
      { image: photo("photo-1511919884226-fd3cad34687c"), caption: "Vehicle detailing" },
      { image: photo("photo-1533473359331-0135ef1b58bf"), caption: "SUV body styling" },
    ],
  },
  {
    title: "Denting, Painting & Finishing",
    description:
      "Paintwork, panel finishing and exterior appearance inspiration.",
    photos: [
      { image: photo("photo-1632823471565-1ecdf5c5f8c5"), caption: "Automotive paintwork" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Exterior finish" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Vehicle exterior" },
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Paint finish inspiration" },
      { image: photo("photo-1489824904134-891ab64532f1"), caption: "Body panel work" },
    ],
  },
  {
    title: "Workshop & Mechanical Bay",
    description:
      "Workshop environments, mechanical service and vehicle maintenance references.",
    photos: [
      { image: photo("photo-1486262715619-67b85e0b08d3"), caption: "Automotive workshop" },
      { image: photo("photo-1632823471565-1ecdf5c5f8c5"), caption: "Vehicle service" },
      { image: photo("photo-1489824904134-891ab64532f1"), caption: "Vehicle inspection" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Workshop vehicle" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Vehicle care" },
    ],
  },
  {
    title: "Car Restoration & Renovation",
    description:
      "Automotive restoration and refreshed exterior appearance inspiration.",
    photos: [
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Restoration inspiration" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Refreshed exterior" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Vehicle finish" },
      { image: photo("photo-1511919884226-fd3cad34687c"), caption: "Detailing finish" },
      { image: photo("photo-1489824904134-891ab64532f1"), caption: "Vehicle body" },
    ],
  },
];

const sharvariGroups: GalleryGroup[] = [
  {
    title: "Exterior Styling & Modification",
    description:
      "Exterior styling references, personalised vehicle looks and modification inspiration.",
    photos: [
      { image: photo("photo-1493238792000-8113da705763"), caption: "Exterior styling" },
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Sports styling" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Vehicle appearance" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Exterior detailing" },
      { image: photo("photo-1533473359331-0135ef1b58bf"), caption: "SUV styling" },
    ],
  },
  {
    title: "Premium Interior & Cabin Design",
    description:
      "Interior styling, cabin finishes and personalised comfort inspiration.",
    photos: [
      { image: photo("photo-1507136566006-cfc505b114fc"), caption: "Premium car interior" },
      { image: photo("photo-1511919884226-fd3cad34687c"), caption: "Cabin styling" },
      { image: photo("photo-1504215680853-026ed2a45def"), caption: "Interior atmosphere" },
      { image: photo("photo-1494976388531-d1058494cdd8"), caption: "Interior design" },
      { image: photo("photo-1507136566006-cfc505b114fc"), caption: "Cabin finish" },
    ],
  },
  {
    title: "Ceramic Coating & Paint Protection",
    description:
      "Gloss enhancement and paint protection visual references.",
    photos: [
      { image: photo("photo-1607860108855-64acf2078ed9"), caption: "Paint protection finish" },
      { image: photo("photo-1601362840469-51e4d8d58785"), caption: "Gloss detailing" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Paint finish" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Exterior gloss" },
    ],
  },
  {
    title: "Car Detailing & Finish",
    description:
      "Vehicle cleaning, detailing and refined exterior appearance inspiration.",
    photos: [
      { image: photo("photo-1601362840469-51e4d8d58785"), caption: "Car detailing" },
      { image: photo("photo-1607860108855-64acf2078ed9"), caption: "Paint finish" },
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Exterior finish" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Vehicle care" },
    ],
  },
  {
    title: "Ambient Lighting & Cabin Mood",
    description:
      "Interior ambient lighting and personalised cabin atmosphere ideas.",
    photos: [
      { image: photo("photo-1504215680853-026ed2a45def"), caption: "Interior lighting" },
      { image: photo("photo-1507136566006-cfc505b114fc"), caption: "Cabin ambience" },
      { image: photo("photo-1511919884226-fd3cad34687c"), caption: "Interior styling" },
    ],
  },
  {
    title: "Seat Upholstery & Floor Styling",
    description:
      "Seat cover, upholstery and floor mat styling inspiration.",
    photos: [
      { image: photo("photo-1511919884226-fd3cad34687c"), caption: "Seat styling" },
      { image: photo("photo-1507136566006-cfc505b114fc"), caption: "Interior upholstery" },
      { image: photo("photo-1494976388531-d1058494cdd8"), caption: "Cabin accessories" },
    ],
  },
];

const extraGroups: GalleryGroup[] = [
  {
    title: "Before & After Inspiration",
    description:
      "A collection of vehicle transformation references. Replace these with genuine before-and-after photographs of completed work.",
    photos: [
      { image: photo("photo-1489824904134-891ab64532f1"), caption: "Before and after reference" },
      { image: photo("photo-1503736334956-4f8f8e92946d"), caption: "Exterior transformation reference" },
      { image: photo("photo-1503376780353-7e6692767b70"), caption: "Vehicle finish reference" },
      { image: photo("photo-1492144534655-ae79c964c9d7"), caption: "Vehicle appearance reference" },
    ],
  },
  {
    title: "Indian Cars & SUV Gallery",
    description:
      "A visual collection inspired by vehicles commonly seen on Indian roads.",
    photos: [
      { image: photo("photo-1519641471654-76ce0107ad1b"), caption: "SUV inspiration" },
      { image: photo("photo-1533473359331-0135ef1b58bf"), caption: "SUV styling" },
      { image: photo("photo-1494976388531-d1058494cdd8"), caption: "Car styling" },
      { image: photo("photo-1549317661-bd32c8ce0db2"), caption: "Modern car design" },
      { image: photo("photo-1507136566006-cfc505b114fc"), caption: "Car interior" },
    ],
  },
];

type SelectedPhoto = {
  group: GalleryGroup;
  photoIndex: number;
};

function PhotoGroup({
  group,
  groupIndex,
  onOpen,
}: {
  group: GalleryGroup;
  groupIndex: number;
  onOpen: (group: GalleryGroup, photoIndex: number) => void;
}) {
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

      <div className="gallery-photo-grid">
        {group.photos.map((item, index) => (
          <button
            type="button"
            className={`gallery-photo-tile gallery-tile-${index % 5}`}
            key={`${group.title}-${index}`}
            onClick={() => onOpen(group, index)}
            aria-label={`Open ${item.caption}`}
          >
            <img src={item.image} alt={item.caption} loading="lazy" />
            <span className="gallery-photo-shade" />
            <span className="gallery-photo-caption">
              <span>{item.caption}</span>
              <ArrowUpRight size={19} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  const [selected, setSelected] = useState<SelectedPhoto | null>(null);

  const openPhoto = (group: GalleryGroup, photoIndex: number) => {
    setSelected({ group, photoIndex });
  };

  const closePhoto = () => setSelected(null);

  const changePhoto = (direction: number) => {
    setSelected((current) => {
      if (!current) return null;
      const total = current.group.photos.length;
      return {
        ...current,
        photoIndex: (current.photoIndex + direction + total) % total,
      };
    });
  };

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
      <header className="gallery-page-heading">
        <div>
          <span className="gallery-eyebrow">
            <span className="gallery-live-dot" />
            TULJA MOTORS × SHARVARI MOTORS
          </span>
          <h1>WORK <span>GALLERY.</span></h1>
          <p>
            A closer look at automotive repair, restoration, styling and
            detailing inspiration.
          </p>
        </div>
        <div className="gallery-heading-side">
          <Camera size={25} />
          <span>PHOTOGRAPHIC COLLECTIONS</span>
        </div>
      </header>

      <section className="gallery-brand-section" id="tulja-gallery">
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">01 / REPAIR & RESTORATION</span>
            <h2>TULJA MOTORS<span>.</span></h2>
            <p>Bodywork, accident repair, mechanical care and restoration.</p>
          </div>
          <Wrench size={30} />
        </div>

        {tuljaGroups.map((group, index) => (
          <PhotoGroup
            key={group.title}
            group={group}
            groupIndex={index}
            onOpen={openPhoto}
          />
        ))}
      </section>

      <section className="gallery-brand-section sharvari-brand-section">
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">02 / STYLE & PERSONALISATION</span>
            <h2>SHARVARI MOTORS<span>.</span></h2>
            <p>Interior design, exterior styling, protection and detailing.</p>
          </div>
          <Camera size={30} />
        </div>

        {sharvariGroups.map((group, index) => (
          <PhotoGroup
            key={group.title}
            group={group}
            groupIndex={index}
            onOpen={openPhoto}
          />
        ))}
      </section>

      <section className="gallery-brand-section gallery-extra-section">
        <div className="gallery-brand-heading">
          <div>
            <span className="gallery-eyebrow">03 / MORE AUTOMOTIVE STORIES</span>
            <h2>FEATURED <span>COLLECTIONS.</span></h2>
            <p>More automotive photographs and visual inspiration.</p>
          </div>
          <Images size={30} />
        </div>

        {extraGroups.map((group, index) => (
          <PhotoGroup
            key={group.title}
            group={group}
            groupIndex={index}
            onOpen={openPhoto}
          />
        ))}
      </section>

      <section className="gallery-bottom-cta">
        <div className="gallery-bottom-icon"><Wrench size={24} /></div>
        <div>
          <span className="gallery-eyebrow">HAVE A PROJECT IN MIND?</span>
          <h2>LET'S TALK ABOUT YOUR VEHICLE.</h2>
          <p>Connect with our team about your next automotive project.</p>
        </div>
        <a href="/contact">
          CONTACT OUR TEAM <ArrowUpRight size={18} />
        </a>
      </section>

      <div className="gallery-stock-note">
        <ShieldCheck size={18} />
        <p>
          Photography shown is illustrative stock imagery, not verified
          photographs of completed Tulja Motors or Sharvari Motors projects.
          Replace these images with your own workshop and customer photographs.
        </p>
      </div>

      {selected && (
        <div
          className="gallery-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePhoto();
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
              <span className="gallery-eyebrow">PHOTO COLLECTION</span>
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
                    className={selected.photoIndex === index ? "active" : ""}
                    onClick={() =>
                      setSelected((current) =>
                        current ? { ...current, photoIndex: index } : null
                      )
                    }
                    aria-label={`View photograph ${index + 1}`}
                  >
                    <img src={item.image} alt="" />
                  </button>
                ))}
              </div>

              <div className="gallery-modal-footer">
                <span><Images size={16} /> {selected.group.photos.length} PHOTOS</span>
                <a href="/contact">
                  ENQUIRE WITH OUR TEAM <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
