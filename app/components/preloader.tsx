
"use client";

import { useEffect, useState } from "react";
import "./preloader.css";

const TICKS = Array.from({ length: 11 }, (_, i) => -90 + i * 18);
const ARC_LEN = Math.PI * 80;
const STAGES = ["REPAIR", "RESTORE", "CUSTOMISE"];

export default function Preloader({
  duration = 2600,
}: {
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let finished = false;
    let hideTimer: ReturnType<typeof setTimeout>;
    let goneTimer: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setProgress(eased * 100);

      if (t >= 1 && !finished) {
        finished = true;

        hideTimer = setTimeout(() => setHide(true), 350);
        goneTimer = setTimeout(() => setGone(true), 1000);

        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(goneTimer);
    };
  }, [duration]);

  if (gone) return null;

  const stage = progress < 34 ? 0 : progress < 67 ? 1 : 2;

  return (
    <div className={`pl-wrap ${hide ? "pl-hide" : ""}`}>
      <div className="pl-ambient pl-ambient-left" />
      <div className="pl-ambient pl-ambient-right" />

      <div className="pl-content">
        <div className="pl-top-label">
          <span className="pl-live-dot" />
          AUTOMOTIVE CARE & RESTORATION
        </div>

        <div className="pl-gauge-container">
          <div className="pl-gauge-glow" />

          <svg className="pl-gauge" viewBox="0 0 200 125" fill="none">
            <defs>
              <linearGradient id="plArcGradient" x1="20" y1="100" x2="180" y2="100">
                <stop offset="0%" stopColor="#086565" />
                <stop offset="55%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#E10600" />
              </linearGradient>

              <filter id="plGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M20 100 A80 80 0 0 1 180 100"
              stroke="#343942"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M20 100 A80 80 0 0 1 180 100"
              stroke="url(#plArcGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ARC_LEN}
              strokeDashoffset={ARC_LEN * (1 - progress / 100)}
              filter="url(#plGlow)"
            />

            {TICKS.map((a, i) => (
              <line
                key={a}
                x1="100"
                y1="24"
                x2="100"
                y2={i % 5 === 0 ? "35" : "31"}
                stroke="#ffffff"
                strokeWidth={i % 5 === 0 ? "2" : "1"}
                opacity={i % 5 === 0 ? ".8" : ".35"}
                transform={`rotate(${a} 100 100)`}
              />
            ))}

            <g
              style={{
                transform: `rotate(${-90 + progress * 1.8}deg)`,
                transformOrigin: "100px 100px",
              }}
            >
              <polygon
                points="98,100 102,100 100,34"
                fill="#E10600"
                filter="url(#plGlow)"
              />
            </g>

            <circle cx="100" cy="100" r="8" fill="#ffffff" />
            <circle cx="100" cy="100" r="4" fill="#0A0D12" />

            <text
              x="100"
              y="122"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="800"
              fontFamily="Arial, sans-serif"
            >
              {Math.round(progress)}%
            </text>
          </svg>
        </div>

        <div className="pl-brand">
          <span className="pl-tulja">TULJA</span>
          <span className="pl-x">×</span>
          <span className="pl-sharvari">
            SHAR<span>V</span>ARI
          </span>
        </div>

        <div className="pl-sub">MOTORS</div>

        <div className="pl-stage-wrap">
          <span className="pl-stage" key={stage}>
            {STAGES[stage]}
          </span>
        </div>

        <div className="pl-loading-line">
          <div
            className="pl-loading-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="pl-bottom">
          <span>PRECISION</span>
          <span className="pl-bottom-separator">/</span>
          <span>PERFORMANCE</span>
          <span className="pl-bottom-separator">/</span>
          <span>PERFECTION</span>
        </div>
      </div>
    </div>
  );
}
