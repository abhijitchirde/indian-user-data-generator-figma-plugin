import * as React from "react";

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Props {
  /** "button-group" (first tab) or "checkbox-group" (table tab) */
  groupClass: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  /** When set, "N selected" is shown next to the chevron */
  selectedCount?: number;
  children: React.ReactNode;
}

/** One collapsible group of buttons or checkboxes */
const Accordion = ({ groupClass, title, isOpen, onToggle, selectedCount, children }: Props) => {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={`${groupClass} accordion`}>
      <div
        className="accordion-header"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={onKeyDown}
      >
        <p className="group-label">{title}</p>
        {selectedCount === undefined ? (
          <span className="accordion-chevron">
            <ChevronIcon isOpen={isOpen} />
          </span>
        ) : (
          <div className="accordion-right">
            <p className="selection-count">{selectedCount} selected</p>
            <span className="accordion-chevron">
              <ChevronIcon isOpen={isOpen} />
            </span>
          </div>
        )}
      </div>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

export default Accordion;
