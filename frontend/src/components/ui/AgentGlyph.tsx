import React from "react";

/**
 * Custom Swiss-Geometric Identity Symbols for each of SYNAPSE's 10 Specialist Agents.
 * Coherent, minimal, architectural vector marks — zero generic icon-pack repetition.
 */
export const AgentGlyph: React.FC<{ role: string; size?: number; active?: boolean }> = ({
  role,
  size = 28,
  active = false,
}) => {
  const stroke = active ? "#FF4D8D" : "currentColor";
  const r = (role || "").toLowerCase();

  const renderShape = () => {
    if (r.includes("supervisor")) {
      // Precision orchestrator crosshair + central node
      return (
        <>
          <circle cx="14" cy="14" r="9.5" stroke={stroke} strokeWidth="1.5" />
          <line x1="14" y1="1.5" x2="14" y2="7" stroke={stroke} strokeWidth="1.5" />
          <line x1="14" y1="21" x2="14" y2="26.5" stroke={stroke} strokeWidth="1.5" />
          <line x1="1.5" y1="14" x2="7" y2="14" stroke={stroke} strokeWidth="1.5" />
          <line x1="21" y1="14" x2="26.5" y2="14" stroke={stroke} strokeWidth="1.5" />
          <rect x="12" y="12" width="4" height="4" fill={active ? "#FF4D8D" : stroke} />
        </>
      );
    }
    if (r.includes("product")) {
      // Editorial grid / PRD specification frame
      return (
        <>
          <rect x="3" y="3" width="22" height="22" stroke={stroke} strokeWidth="1.5" />
          <line x1="3" y1="10" x2="25" y2="10" stroke={stroke} strokeWidth="1.5" />
          <line x1="12" y1="10" x2="12" y2="25" stroke={stroke} strokeWidth="1.5" />
          <rect x="6" y="5.5" width="6" height="2" fill={stroke} />
        </>
      );
    }
    if (r.includes("architect")) {
      // Isometric structural cube
      return (
        <>
          <polygon points="14,2.5 24.5,8.5 24.5,19.5 14,25.5 3.5,19.5 3.5,8.5" stroke={stroke} strokeWidth="1.5" fill="none" />
          <polyline points="3.5,8.5 14,14.5 24.5,8.5" stroke={stroke} strokeWidth="1.5" fill="none" />
          <line x1="14" y1="14.5" x2="14" y2="25.5" stroke={stroke} strokeWidth="1.5" />
        </>
      );
    }
    if (r.includes("backend")) {
      // Three-tier stacked server / database strata
      return (
        <>
          <rect x="3.5" y="4" width="21" height="5.5" stroke={stroke} strokeWidth="1.5" />
          <rect x="3.5" y="11.25" width="21" height="5.5" stroke={stroke} strokeWidth="1.5" />
          <rect x="3.5" y="18.5" width="21" height="5.5" stroke={stroke} strokeWidth="1.5" />
          <circle cx="7.5" cy="6.75" r="1.1" fill={stroke} />
          <circle cx="7.5" cy="14" r="1.1" fill={stroke} />
          <circle cx="7.5" cy="21.25" r="1.1" fill={active ? "#FF4D8D" : stroke} />
        </>
      );
    }
    if (r.includes("frontend")) {
      // Nested viewport frame & diagonal axis
      return (
        <>
          <rect x="3" y="4" width="22" height="20" stroke={stroke} strokeWidth="1.5" />
          <rect x="7" y="8" width="14" height="12" stroke={stroke} strokeWidth="1.3" />
          <line x1="7" y1="20" x2="21" y2="8" stroke={stroke} strokeWidth="1.3" />
        </>
      );
    }
    if (r.includes("review")) {
      // Dual opposing inspection brackets
      return (
        <>
          <polyline points="10,5 4,14 10,23" stroke={stroke} strokeWidth="1.6" fill="none" />
          <polyline points="18,5 24,14 18,23" stroke={stroke} strokeWidth="1.6" fill="none" />
          <line x1="16" y1="5" x2="12" y2="23" stroke={active ? "#FF4D8D" : stroke} strokeWidth="1.5" />
        </>
      );
    }
    if (r.includes("qa")) {
      // Precision verification diamond + check axis
      return (
        <>
          <polygon points="14,2.5 25.5,14 14,25.5 2.5,14" stroke={stroke} strokeWidth="1.5" fill="none" />
          <polyline points="9.5,14 13,17.5 19.5,10.5" stroke={active ? "#FF4D8D" : stroke} strokeWidth="1.7" fill="none" />
        </>
      );
    }
    if (r.includes("security")) {
      // Architectural octagonal shield + key core
      return (
        <>
          <polygon points="14,2.5 23.5,6.5 23.5,16 14,25.5 4.5,16 4.5,6.5" stroke={stroke} strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="12.5" r="2.6" stroke={active ? "#FF4D8D" : stroke} strokeWidth="1.5" />
          <line x1="14" y1="15.1" x2="14" y2="19.5" stroke={active ? "#FF4D8D" : stroke} strokeWidth="1.5" />
        </>
      );
    }
    if (r.includes("doc")) {
      // Editorial dossier ruled folio
      return (
        <>
          <polygon points="5,3 18,3 23,8 23,25 5,25" stroke={stroke} strokeWidth="1.5" fill="none" />
          <polyline points="18,3 18,8 23,8" stroke={stroke} strokeWidth="1.5" fill="none" />
          <line x1="8.5" y1="13" x2="19.5" y2="13" stroke={stroke} strokeWidth="1.4" />
          <line x1="8.5" y1="17" x2="19.5" y2="17" stroke={stroke} strokeWidth="1.4" />
          <line x1="8.5" y1="21" x2="14.5" y2="21" stroke={stroke} strokeWidth="1.4" />
        </>
      );
    }
    // Deployment / Default: Upward precision launch vector
    return (
      <>
        <polyline points="6,15 14,4 22,15" stroke={stroke} strokeWidth="1.6" fill="none" />
        <line x1="14" y1="4" x2="14" y2="23" stroke={active ? "#FF4D8D" : stroke} strokeWidth="1.6" />
        <line x1="5" y1="24" x2="23" y2="24" stroke={stroke} strokeWidth="1.5" />
      </>
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {renderShape()}
    </svg>
  );
};

export function getAgentCode(role: string, index: number): string {
  const map: Record<string, string> = {
    supervisor: "AG-01",
    product_manager: "AG-02",
    system_architect: "AG-03",
    backend_developer: "AG-04",
    frontend_developer: "AG-05",
    code_reviewer: "AG-06",
    qa_engineer: "AG-07",
    security_agent: "AG-08",
    documentation_agent: "AG-09",
    deployment_agent: "AG-10",
  };
  return map[role] || `AG-${String(index + 1).padStart(2, "0")}`;
}
