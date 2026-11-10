"use client";

import { useState, type FormEvent } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowUpRight,
  Send,
  CheckCircle2,
  ShieldCheck,
  Clock3,
  Navigation,
  Building2,
} from "lucide-react";

import "../inner-pages.css";
import "./contact-page.css";

const PHONE = "9130129205";
const WHATSAPP = "919130129205";
const EMAIL = "tuljamotors@gmail.com";

const MAP_URL =
  "https://www.google.com/maps/dir/?api=1&destination=16.798993,74.284622";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=16.798993,74.284622&z=15&output=embed";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formMessage, setFormMessage] = useState("");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const enquiry = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service: String(data.get("service") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    setStatus("sending");
    setFormMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enquiry),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send your enquiry. Please try again."
        );
      }

      setStatus("success");
      setFormMessage(
        "Your enquiry has been sent successfully. Our team will contact you shortly."
      );

      form.reset();
    } catch (error) {
      console.error("Contact enquiry error:", error);

      setStatus("error");
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <main className="inner-page contact-page contact-light-page">
      <section className="contact-light-section">
        <div className="contact-light-container">
          {/* INTRODUCTION — NOT A HERO BANNER */}
          <div className="contact-intro">
            <div className="contact-intro-copy">
              <span className="contact-eyebrow">
                <span className="contact-eyebrow-dot" />
                TULJA MOTORS × SHARVARI MOTORS
              </span>

              <h1>
                LET&apos;S TALK
                <span> ABOUT YOUR CAR.</span>
              </h1>

              <p>
                Whether it&apos;s a repair, restoration or a fresh
                customisation, we&apos;re here to help you take the next step.
              </p>
            </div>

            <div className="contact-intro-side">
              <span className="contact-intro-side-label">HAVE A PROJECT?</span>
              <a href={`tel:+91${PHONE}`}>
                TALK TO OUR TEAM
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          {/* MAIN CONTACT LAYOUT */}
          <div className="contact-main-grid">
            {/* LEFT: CONTACT DETAILS */}
            <aside className="contact-details-panel">
              <div className="contact-panel-heading">
                <span className="contact-eyebrow">GET IN TOUCH</span>
                <h2>
                  WE&apos;RE
                  <span> HERE TO HELP.</span>
                </h2>
                <p>
                  Reach out through your preferred channel. Our team will be
                  happy to assist with your vehicle requirements.
                </p>
              </div>

              <div className="contact-detail-list">
                <a
                  href={`tel:+91${PHONE}`}
                  className="contact-detail-item"
                >
                  <span className="contact-detail-icon">
                    <Phone size={20} />
                  </span>

                  <span className="contact-detail-text">
                    <small>CALL OUR TEAM</small>
                    <strong>+91 {PHONE}</strong>
                    <span>Speak directly with us</span>
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="contact-detail-arrow"
                  />
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    "Hello Tulja Motors, I would like to enquire about your services."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-detail-item"
                >
                  <span className="contact-detail-icon contact-whatsapp-icon">
                    <MessageCircle size={20} />
                  </span>

                  <span className="contact-detail-text">
                    <small>WHATSAPP</small>
                    <strong>Chat with our team</strong>
                    <span>Send us your enquiry</span>
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="contact-detail-arrow"
                  />
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="contact-detail-item"
                >
                  <span className="contact-detail-icon">
                    <Mail size={20} />
                  </span>

                  <span className="contact-detail-text">
                    <small>EMAIL ADDRESS</small>
                    <strong>{EMAIL}</strong>
                    <span>Write to us anytime</span>
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="contact-detail-arrow"
                  />
                </a>

                <div className="contact-detail-item contact-address-item">
                  <span className="contact-detail-icon">
                    <MapPin size={20} />
                  </span>

                  <span className="contact-detail-text">
                    <small>WORKSHOP ADDRESS</small>
                    <strong>
                      Pune–Bengaluru NH48, near Shetimal Petrol Pump,
                      Top Sambhapur, Kolhapur, Maharashtra 416122
                    </strong>
                    <span>Visit our workshop</span>
                  </span>
                </div>
              </div>

              <div className="contact-brand-card">
                <div className="contact-brand-card-icon">
                  <Building2 size={21} />
                </div>

                <div>
                  <strong>Tulja Motors × Sharvari Motors</strong>
                  <p>
                    Complete automotive care, repair, restoration and
                    personalisation under one roof.
                  </p>
                </div>
              </div>
            </aside>

            {/* RIGHT: ENQUIRY FORM */}
            <section className="contact-form-panel">
              <div className="contact-form-top">
                <div>
                  <span className="contact-eyebrow">LET&apos;S GET STARTED</span>
                  <h2>Send an enquiry.</h2>
                  <p>
                    Fill in the details below and our team will get back to you.
                  </p>
                </div>

                <span className="contact-form-top-icon">
                  <Send size={22} />
                </span>
              </div>

              <form onSubmit={submitEnquiry} className="contact-clean-form">
                <div className="contact-fields-grid">
                  <div className="contact-field">
                    <label htmlFor="contact-name">
                      Full Name <span>*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-phone">
                      Phone Number <span>*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="contact-field contact-field-full">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      maxLength={150}
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-field contact-field-full">
                    <label htmlFor="contact-service">
                      Service Required <span>*</span>
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Choose the service you&apos;re interested in
                      </option>

                      <optgroup label="Tulja Motors">
                        <option>Accident Repair</option>
                        <option>Denting & Painting</option>
                        <option>Car Restoration</option>
                        <option>Mechanical Repairs</option>
                        <option>Insurance Assistance</option>
                        <option>Car Renovation</option>
                      </optgroup>

                      <optgroup label="Sharvari Motors">
                        <option>Exterior Modification</option>
                        <option>Interior Modification</option>
                        <option>Ceramic Coating</option>
                        <option>PPF Installation</option>
                        <option>Car Detailing</option>
                        <option>Ambient Lighting</option>
                        <option>Premium Seat Covers</option>
                        <option>7D Mats</option>
                      </optgroup>

                      <option>Other</option>
                    </select>
                  </div>

                  <div className="contact-field contact-field-full">
                    <label htmlFor="contact-message">
                      Tell Us About Your Requirement
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      maxLength={3000}
                      placeholder="Tell us about your car and what you are looking for..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={status === "sending"}
                >
                  <span>
                    {status === "sending"
                      ? "SENDING YOUR ENQUIRY"
                      : "SEND ENQUIRY"}
                  </span>

                  {status === "sending" ? (
                    <span className="contact-submit-loader" />
                  ) : (
                    <ArrowUpRight size={19} />
                  )}
                </button>

                {status !== "idle" && (
                  <div
                    className={`contact-form-feedback ${
                      status === "error" ? "is-error" : ""
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {status === "success" ? (
                      <CheckCircle2 size={19} />
                    ) : status === "error" ? (
                      <ShieldCheck size={19} />
                    ) : null}

                    <span>{formMessage}</span>
                  </div>
                )}

                <div className="contact-privacy-note">
                  <ShieldCheck size={16} />
                  <span>
                    Your information is kept private and used only to respond
                    to your enquiry.
                  </span>
                </div>
              </form>
            </section>
          </div>

          {/* WORKSHOP LOCATION */}
          <section className="contact-location-section">
            <div className="contact-location-heading">
              <div>
                <span className="contact-eyebrow">
                  <span className="contact-eyebrow-dot" />
                  COME SEE US
                </span>

                <h2>
                  FIND OUR
                  <span> WORKSHOP.</span>
                </h2>

                <p>
                  Visit Tulja Motors × Sharvari Motors at our workshop in
                  Kolhapur.
                </p>
              </div>

              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-directions-button"
              >
                <Navigation size={17} />
                GET DIRECTIONS
                <ArrowUpRight size={17} />
              </a>
            </div>

            <div className="contact-map-frame">
              <iframe
                title="Tulja Motors and Sharvari Motors workshop location"
                src={MAP_EMBED_URL}
                width="100%"
                height="430"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="contact-map-caption">
                <span className="contact-map-caption-icon">
                  <MapPin size={18} />
                </span>

                <span>
                  <strong>Tulja Motors × Sharvari Motors</strong>
                  <small>
                    NH48, Top Sambhapur, Kolhapur, Maharashtra 416122
                  </small>
                </span>

                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open workshop directions"
                >
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
          </section>

          {/* BOTTOM CONTACT STRIP */}
          <div className="contact-bottom-strip">
            <div>
              <Clock3 size={19} />
              <span>
                <strong>Need assistance?</strong>
                <small>Call or message our team directly.</small>
              </span>
            </div>

            <a href={`tel:+91${PHONE}`}>
              CALL NOW <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}