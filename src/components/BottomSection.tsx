import * as React from "react";
import ThemeToggle from "./ThemeToggle";

const BottomSection = () => {
  const onDisclaimer = () => {
    parent.postMessage({ pluginMessage: { type: "disclaimer" } }, "*");
  };
  return (
    <div className="bottom-wrapper">
      <div className="disclaimer-container">
        <button
          id="disclaimer"
          onClick={onDisclaimer}
          className="icon-button"
          title="Disclaimer"
          aria-label="Disclaimer"
        >
          ⚠️
        </button>
        <ThemeToggle />
      </div>

      <div className="credit-container">
        <p className="credit-text">
          <a href="https://abhijitchirde.com" target="_blank" rel="noreferrer">
            by Abhijit Chirde
          </a>
        </p>
      </div>
    </div>
  );
};

export default BottomSection;
