export type ProjectWorkflowStep = {
  title: string;
  duration: string;
  description: string;
};

export type BeforeAfterProject = {
  number: string;
  slug: string;
  brand: string;
  vehicle: string;
  title: string;
  service: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  projectType: string;
  timeline: string;
  estimatedDays: string;
  status: string;
  workItems: string[];
  workflow: ProjectWorkflowStep[];
};

export const beforeAfterProjects: BeforeAfterProject[] = [
  {
    number: "01",
    slug: "scorpio-restoration",
    brand: "TULJA MOTORS",
    vehicle: "MAHINDRA SCORPIO",
    title: "SCORPIO RESTORATION",
    service: "ACCIDENT REPAIR & RESTORATION",
    beforeImage: "/images/before-after/car-1-before.jpeg",
    afterImage: "/images/before-after/car-1-after.jpeg",
    description:
      "A vehicle restoration project focused on accident damage assessment, body repair, panel alignment and exterior finishing.",
    projectType: "Accident Repair & Restoration",
    timeline: "Estimated 7–12 working days",
    estimatedDays: "7–12 DAYS",
    status: "Completed",
    workItems: [
      "Initial vehicle condition inspection",
      "Accident damage assessment",
      "Body panel repair and alignment",
      "Denting and surface preparation",
      "Paint finishing and exterior detailing",
      "Final quality inspection",
    ],
    workflow: [
      {
        title: "Vehicle inspection",
        duration: "0.5–1 day",
        description:
          "Inspect the vehicle body, identify visible damage and assess areas that may need additional repair.",
      },
      {
        title: "Damage assessment and planning",
        duration: "0.5–1 day",
        description:
          "Prepare a repair plan based on the vehicle condition, panel damage and availability of required parts.",
      },
      {
        title: "Body repair and alignment",
        duration: "2–4 days",
        description:
          "Carry out the required denting, panel correction and alignment work.",
      },
      {
        title: "Surface preparation and painting",
        duration: "2–3 days",
        description:
          "Prepare repaired surfaces and complete the required primer, paint and finishing process.",
      },
      {
        title: "Final inspection",
        duration: "1–2 days",
        description:
          "Review the repaired areas, paint finish, panel gaps and overall vehicle appearance before delivery.",
      },
    ],
  },
  {
    number: "02",
    slug: "maruti-alto-repair",
    brand: "TULJA MOTORS",
    vehicle: "MARUTI SUZUKI ALTO",
    title: "ALTO BODY REPAIR",
    service: "DENTING, PAINTING & BODY WORK",
    beforeImage: "/images/before-after/car-2-before.jpeg",
    afterImage: "/images/before-after/car-2-after.jpeg",
    description:
      "A body repair project showcasing dent removal, panel straightening, surface preparation and exterior paint finishing.",
    projectType: "Denting & Painting",
    timeline: "Estimated 4–6 working days",
    estimatedDays: "4–6 DAYS",
    status: "Completed",
    workItems: [
      "Vehicle body inspection",
      "Dent identification and removal",
      "Panel straightening",
      "Surface sanding and preparation",
      "Exterior painting",
      "Final finishing and polishing",
    ],
    workflow: [
      {
        title: "Vehicle inspection",
        duration: "0.5 day",
        description:
          "Inspect the damaged body panels, paint condition and surrounding areas to understand the repair requirements.",
      },
      {
        title: "Denting and panel repair",
        duration: "1 day",
        description:
          "Correct dents, restore the panel shape and check alignment with adjacent body panels.",
      },
      {
        title: "Surface preparation",
        duration: "1 day",
        description:
          "Complete sanding, filling where required and primer preparation to create a suitable painting surface.",
      },
      {
        title: "Painting and finishing",
        duration: "1–2 days",
        description:
          "Match the paint colour, complete the paint application and allow suitable curing time.",
      },
      {
        title: "Final quality check",
        duration: "0.5–1 day",
        description:
          "Inspect the paint finish, panel alignment, door operation and overall appearance before delivery.",
      },
    ],
  },
  {
    number: "03",
    slug: "nexa-baleno-customisation",
    brand: "SHARVARI MOTORS",
    vehicle: "NEXA BALENO",
    title: "BALENO CUSTOMISATION",
    service: "EXTERIOR STYLING & MODIFICATION",
    beforeImage: "/images/before-after/car-3-before.jpeg",
    afterImage: "/images/before-after/car-3-after.jpeg",
    description:
      "An exterior customisation project focused on styling enhancements, accessory fitting and vehicle personalisation.",
    projectType: "Exterior Customisation",
    timeline: "Estimated 2–5 working days",
    estimatedDays: "2–5 DAYS",
    status: "Completed",
    workItems: [
      "Vehicle styling inspection",
      "Customisation planning",
      "Exterior accessory fitting",
      "Body styling enhancements",
      "Final alignment and finishing",
      "Quality inspection",
    ],
    workflow: [
      {
        title: "Vehicle assessment",
        duration: "0.5 day",
        description:
          "Review the vehicle's exterior condition and identify the areas selected for customisation.",
      },
      {
        title: "Styling and design planning",
        duration: "0.5–1 day",
        description:
          "Finalise the accessory selection, fitment requirements and styling approach with the customer.",
      },
      {
        title: "Accessory installation",
        duration: "1–2 days",
        description:
          "Install the selected exterior accessories and complete the planned styling enhancements.",
      },
      {
        title: "Finishing and inspection",
        duration: "0.5–1 day",
        description:
          "Check fitment, alignment, finish and overall appearance of the customised vehicle.",
      },
    ],
  },
  {
    number: "04",
    slug: "kia-seltos-detailing",
    brand: "SHARVARI MOTORS",
    vehicle: "KIA SELTOS",
    title: "SELTOS DETAILING",
    service: "PAINT CORRECTION & COATING",
    beforeImage: "/images/before-after/car-4-before.jpeg",
    afterImage: "/images/before-after/car-4-after.jpeg",
    description:
      "A vehicle detailing project featuring exterior cleaning, paint condition assessment, paint correction and protective coating.",
    projectType: "Paint Correction & Coating",
    timeline: "Estimated 2–4 working days",
    estimatedDays: "2–4 DAYS",
    status: "Completed",
    workItems: [
      "Paint condition inspection",
      "Exterior wash and decontamination",
      "Paint correction",
      "Surface preparation",
      "Protective coating application",
      "Final gloss inspection",
    ],
    workflow: [
      {
        title: "Paint inspection",
        duration: "0.5 day",
        description:
          "Check paint condition, visible swirl marks, scratches and surface imperfections.",
      },
      {
        title: "Exterior cleaning",
        duration: "0.5 day",
        description:
          "Clean the exterior and remove surface contaminants before paint correction.",
      },
      {
        title: "Paint correction",
        duration: "0.5–1 day",
        description:
          "Use suitable correction methods to improve the appearance of the paint surface.",
      },
      {
        title: "Protective treatment",
        duration: "0.5–1 day",
        description:
          "Prepare the surface and apply the selected protective coating according to product instructions.",
      },
      {
        title: "Final inspection",
        duration: "0.5 day",
        description:
          "Review the finish, coverage and appearance under suitable lighting.",
      },
    ],
  },
  {
    number: "05",
    slug: "mahindra-thar-interior",
    brand: "SHARVARI MOTORS",
    vehicle: "MAHINDRA THAR",
    title: "THAR INTERIOR UPGRADE",
    service: "INTERIOR MODIFICATION",
    beforeImage: "/images/before-after/car-5-before.jpeg",
    afterImage: "/images/before-after/car-5-after.jpeg",
    description:
      "An interior upgrade project focused on cabin styling, upholstery enhancements and selected interior accessories.",
    projectType: "Interior Modification",
    timeline: "Estimated 3–6 working days",
    estimatedDays: "3–6 DAYS",
    status: "Completed",
    workItems: [
      "Interior condition inspection",
      "Custom interior planning",
      "Seat and upholstery upgrades",
      "Interior accessory installation",
      "Finishing and detailing",
      "Final quality check",
    ],
    workflow: [
      {
        title: "Interior assessment",
        duration: "0.5 day",
        description:
          "Inspect the seats, dashboard, trims and cabin condition to understand the upgrade requirements.",
      },
      {
        title: "Customisation planning",
        duration: "0.5–1 day",
        description:
          "Confirm the selected materials, colours, accessories and installation requirements.",
      },
      {
        title: "Interior upgrade work",
        duration: "1–3 days",
        description:
          "Complete the selected upholstery work, accessory installation and interior modifications.",
      },
      {
        title: "Cabin finishing",
        duration: "0.5 day",
        description:
          "Clean and finish the upgraded interior surfaces and check the fitment of installed components.",
      },
      {
        title: "Final inspection",
        duration: "0.5–1 day",
        description:
          "Check cabin appearance, seat operation, trim fitment and overall finish.",
      },
    ],
  },
  {
    number: "06",
    slug: "toyota-fortuner-restoration",
    brand: "TULJA MOTORS",
    vehicle: "TOYOTA FORTUNER",
    title: "FORTUNER PPF & POLISH",
    service: "CAR PPF & POLISH",
    beforeImage: "/images/before-after/car-6-before.jpeg",
    afterImage: "/images/before-after/car-6-after.jpeg",
    description:
      "An exterior protection project featuring paint preparation, polishing and protective film application.",
    projectType: "PPF & Paint Protection",
    timeline: "Estimated 3–6 working days",
    estimatedDays: "3–6 DAYS",
    status: "Completed",
    workItems: [
      "Paint surface inspection",
      "Exterior cleaning",
      "Paint correction and polishing",
      "PPF surface preparation",
      "Protective film application",
      "Final finishing inspection",
    ],
    workflow: [
      {
        title: "Paint surface inspection",
        duration: "0.5 day",
        description:
          "Inspect the paint condition and identify areas that need correction before protective film installation.",
      },
      {
        title: "Cleaning and preparation",
        duration: "0.5–1 day",
        description:
          "Wash and decontaminate the vehicle to prepare the surface for the selected treatment.",
      },
      {
        title: "Paint correction and polishing",
        duration: "0.5–1 day",
        description:
          "Improve the paint surface where required and prepare it for protective film application.",
      },
      {
        title: "PPF installation",
        duration: "1–2 days",
        description:
          "Apply the selected paint protection film to the agreed vehicle panels.",
      },
      {
        title: "Final inspection",
        duration: "0.5–1 day",
        description:
          "Check film alignment, edges, finish and the overall appearance of the protected panels.",
      },
    ],
  },
];