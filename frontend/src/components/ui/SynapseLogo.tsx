import React from "react";
import synapseLogoImg from "../../assets/synapse-logo.jpg";

interface SynapseLogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
}

/**
 * SYNAPSE Bespoke Brand Emblem — Interlocking multi-hue neural ribbons
 * orbiting a radiant central synaptic spark.
 */
export const SynapseLogo: React.FC<SynapseLogoProps> = ({
  size = 36,
  showWordmark = true,
  subtitle,
}) => {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          overflow: "hidden",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090910",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 4px 16px rgba(124, 92, 255, 0.28)",
          flexShrink: 0,
        }}
      >
        <img
          src={synapseLogoImg}
          alt="Synapse Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.22)",
            display: "block",
          }}
        />
      </span>

      {showWordmark && (
        <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: Math.max(16, Math.round(size * 0.5)),
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            Synapse
          </span>
          {subtitle && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#F9A8D4", letterSpacing: "0.06em" }}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
};
