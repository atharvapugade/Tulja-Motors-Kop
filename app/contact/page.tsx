
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
} from "lucide-react";

import "../inner-pages.css";

const PHONE = "9130129205";
const WHATSAPP = "919130129205";
const EMAIL = "tuljamotors@gmail.com";

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
    <main className="inner-page contact-page">

      {/* CONTACT INTRO */}
      <section className="ip-section contact-main-section">
        <div className="ip-container">

          <div className="ip-heading contact-page-heading">
            <span className="ip-eyebrow">TULJA MOTORS × SHARVARI MOTORS</span>

            <h1>
              LET&apos;S TALK
              <span> ABOUT YOUR CAR.</span>
            </h1>

            <p>
              Have a repair, restoration or customisation requirement?
              Get in touch with our team. We&apos;re ready to help.
            </p>
          </div>

          {/* CONTACT DETAILS + FORM */}
          <div className="ip-contact-grid">

            {/* LEFT CONTACT DETAILS */}
            <div className="ip-contact-info">

              <div className="contact-info-heading">
                <span className="ip-eyebrow">CONTACT INFORMATION</span>
                <h2>
                  CONNECT WITH
                  <span> OUR TEAM.</span>
                </h2>
                <p>
                  Choose your preferred way to reach us.
                </p>
              </div>

              <a
                href={`tel:+91${PHONE}`}
                className="contact-method-card"
              >
                <span className="contact-method-icon">
                  <Phone size={22} />
                </span>

                <span className="contact-method-content">
                  <small>CALL OUR TEAM</small>
                  <strong>+91 {PHONE}</strong>
                </span>

                <ArrowUpRight size={19} className="contact-method-arrow" />
              </a>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  "Hello Tulja Motors, I would like to enquire about your services."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method-card whatsapp-method"
              >
                <span className="contact-method-icon">
                  <MessageCircle size={22} />
                </span>

                <span className="contact-method-content">
                  <small>WHATSAPP DIRECTLY</small>
                  <strong>Chat with us</strong>
                </span>

                <ArrowUpRight size={19} className="contact-method-arrow" />
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="contact-method-card"
              >
                <span className="contact-method-icon">
                  <Mail size={22} />
                </span>

                <span className="contact-method-content">
                  <small>EMAIL ADDRESS</small>
                  <strong>{EMAIL}</strong>
                </span>

                <ArrowUpRight size={19} className="contact-method-arrow" />
              </a>

              <div className="contact-method-card contact-address-card">
                <span className="contact-method-icon">
                  <MapPin size={22} />
                </span>

                <span className="contact-method-content">
                  <small>WORKSHOP ADDRESS</small>
                  <strong>
                    Pune–Bengaluru NH48, near Shetimal Petrol Pump,
                    Top Sambhapur, Kolhapur, Maharashtra 416122
                  </strong>
                </span>
              </div>

              <div className="contact-brand-note">
                <ShieldCheck size={21} />
                <div>
                  <strong>Tulja Motors × Sharvari Motors</strong>
                  <p>
                    Automotive repair, restoration and personalisation
                    for your vehicle.
                  </p>
                </div>
              </div>
            </div>

            {/* EMAIL ENQUIRY FORM */}
            <div className="ip-contact-form contact-email-panel">
              <div className="contact-form-heading">
                <span className="ip-eyebrow">SEND US A MESSAGE</span>
                <h2>EMAIL ENQUIRY</h2>
                <p>
                  Share your details and requirements. Our team will
                  get back to you.
                </p>
              </div>

              <form onSubmit={submitEnquiry}>
                <div className="ip-form-grid">
                  <div className="contact-form-field">
                    <label htmlFor="contact-name">Full Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="contact-form-field">
                    <label htmlFor="contact-phone">Phone Number *</label>
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

                  <div className="contact-form-field full-width">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      maxLength={150}
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-form-field full-width">
                    <label htmlFor="contact-service">Service Required *</label>
                    <select
                      id="contact-service"
                      name="service"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select a service
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
                </div>

                <div className="contact-form-field contact-message-field">
                  <label htmlFor="contact-message">
                    Tell Us About Your Requirement
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    maxLength={3000}
                    placeholder="Tell us about your vehicle, repair or customisation requirement..."
                  />
                </div>

                <button
                  type="submit"
                  className="contact-email-submit"
                  disabled={status === "sending"}
                >
                  {status === "sending"
                    ? "SENDING ENQUIRY..."
                    : "SEND EMAIL ENQUIRY"}

                  {status === "sending" ? (
                    <span className="contact-button-loader" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>

                {status !== "idle" && (
                  <div
                    className={`contact-form-feedback ${
                      status === "error" ? "is-error" : ""
                    }`}
                    role="status"
                  >
                    {status === "success" ? (
                      <CheckCircle2 size={19} />
                    ) : status === "error" ? (
                      <ShieldCheck size={19} />
                    ) : null}

                    <span>{formMessage}</span>
                  </div>
                )}

                <div className="contact-form-privacy">
                  <ShieldCheck size={16} />
                  <span>
                    Your information is used only to respond to your enquiry.
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* MAP */}
          <div className="contact-map-section">
            <div className="contact-map-heading">
              <div>
                <span className="ip-eyebrow">FIND OUR WORKSHOP</span>
                <h2>
                  VISIT <span>US.</span>
                </h2>
                <p>
                  Pune–Bengaluru National Highway, NH48,
                  near Shetimal Petrol Pump, Kolhapur.
                </p>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=16.783019595807485,74.28685209367279"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-directions-link"
              >
                GET DIRECTIONS
                <ArrowUpRight size={18} />
              </a>
            </div>

            <div className="ip-map contact-map">
              <iframe
                title="Tulja Motors location"
                src="https://www.google.com/maps?q=16.783019595807485,74.28685209367279&z=15&output=embed"
                width="100%"
                height="380"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
