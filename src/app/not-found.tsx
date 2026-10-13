"use client";

import Link from "next/link";
import { useState } from "react";

export default function NotFound() {
    const [open, setOpen] = useState(false);

    return (
        <main className="nf">
            <div className="digits" aria-hidden="true">
                <span>4</span>

                <button
                    type="button"
                    className={`plate ${open ? "open" : ""}`}
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close the lid" : "Open the lid"}
                >
                    <svg viewBox="0 0 200 200" className="svg">
                        <ellipse cx="100" cy="160" rx="92" ry="14" fill="#E8F1E4" />
                        <ellipse cx="100" cy="156" rx="70" ry="8" fill="#C9DCC3" />
                        <g className="lid">
                            <path
                                d="M24 150 C24 78 58 46 100 46 C142 46 176 78 176 150 Z"
                                fill="#F5B82E"
                            />
                            <path
                                d="M44 140 C46 98 66 74 90 66"
                                stroke="#FFF1C2"
                                strokeWidth="7"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <circle cx="100" cy="38" r="10" fill="#D8432B" />
                            <rect x="16" y="148" width="168" height="8" rx="4" fill="#D99A12" />
                        </g>
                    </svg>
                </button>

                <span>4</span>
            </div>

            <h1>Page not found</h1>
            <p className="msg">
                {open
                    ? "Empty plate. Just like this page."
                    : "Tap the lid to see what\u2019s inside."}
            </p>
            <p className="sub">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <Link href="/" className="home">
                Go to home
            </Link>

            <style jsx>{`
        .nf {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          text-align: center;
          background: #12372a;
          color: #e8f1e4;
          font-family: ui-rounded, "Segoe UI", system-ui, sans-serif;
        }
        .digits {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .digits span {
          font-size: clamp(6rem, 22vw, 12rem);
          font-weight: 900;
          color: #f5b82e;
        }
        .plate {
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          width: clamp(6rem, 22vw, 12rem);
          border-radius: 50%;
        }
        .plate:focus-visible,
        .nf :global(.home):focus-visible {
          outline: 3px solid #f5b82e;
          outline-offset: 4px;
        }
        .svg {
          width: 100%;
          overflow: visible;
        }
        .lid {
          transform-origin: 24px 150px;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .plate:hover .lid {
          transform: translateY(-6px) rotate(-3deg);
        }
        .plate.open .lid,
        .plate.open:hover .lid {
          transform: translate(28px, -50px) rotate(-26deg);
        }
        h1 {
          margin: 12px 0 0;
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 800;
        }
        .msg {
          margin: 0;
          min-height: 1.5em;
          color: #f5b82e;
          font-weight: 600;
        }
        .sub {
          margin: 0 0 16px;
          max-width: 40ch;
          opacity: 0.85;
          line-height: 1.5;
        }
        .nf :global(.home) {
          padding: 13px 28px;
          border-radius: 999px;
          background: #d8432b;
          color: #fff;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s ease;
        }
        .nf :global(.home):hover {
          transform: translateY(-2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .lid,
          .nf :global(.home) {
            transition: none;
          }
        }
      `}</style>
        </main>
    );
}