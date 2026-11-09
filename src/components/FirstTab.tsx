import * as React from "react";
import DataButton from "./DataButton";

const FirstTab = ({ onClick, onFillByName }) => {
  const [selected, setSelected] = React.useState("Random");
  const [openAccordion, setOpenAccordion] = React.useState("Personal Details");

  const dropdownSelectionHandler = (e) => {
    setSelected(e.target.value);
  };

  const clickHandler = (e) => {
    const val = e.target.value;
    onClick(val, selected);
  };

  const toggleAccordion = (accordionName) => {
    setOpenAccordion(openAccordion === accordionName ? null : accordionName);
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

  return (
    <>
      <div className="tabcontent">
        <div className="tab-container">
          <div className="smart-fill">
            <button
              className="button-large smart-fill-button"
              onClick={() => onFillByName(selected)}
            >
              Fill by layer names
            </button>
            <p className="smart-fill-hint">
              Select a frame or cards. Text layers named "Email", "Phone",
              "PAN"… get one matching person per card.
            </p>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--figma-color-text-brand)",
              padding: "0 var(--figma-space-sm) 0.5rem",
              width: "100%",
            }}
          >
            Please select the text layers to add user data to and click below to
            generate.
          </p>
          <div className="buttons-list">
            <div className="button-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Personal Details")}
              >
                <p className="group-label">Personal Details</p>
                <span className="accordion-chevron">
                  <ChevronIcon isOpen={openAccordion === "Personal Details"} />
                </span>
              </div>
              {openAccordion === "Personal Details" && (
                <div className="accordion-content">
                  <div className="buttons-div">
                    <DataButton
                      name="First Name"
                      value="FirstName"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Last Name"
                      value="LastName"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Full Name"
                      value="FullName"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Birth Date"
                      value="DoB"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Email"
                      value="Email"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Mobile"
                      value="Mobile"
                      action={clickHandler}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="button-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Profession")}
              >
                <p className="group-label">Profession</p>
                <span className="accordion-chevron">
                  <ChevronIcon isOpen={openAccordion === "Profession"} />
                </span>
              </div>
              {openAccordion === "Profession" && (
                <div className="accordion-content">
                  <div className="buttons-div">
                    <label
                      className="dropdown-label"
                      htmlFor="profession-domain-1"
                    >
                      Domain
                    </label>
                    <select
                      className="dropdown-main"
                      id="profession-domain-1"
                      value={selected}
                      onChange={dropdownSelectionHandler}
                    >
                      <option id="ran" className="dropdown-item" value="Random">
                        Random
                      </option>
                      <option
                        id="tech"
                        className="dropdown-item"
                        value="Tech and IT"
                      >
                        Tech and IT
                      </option>
                      <option
                        id="eng"
                        className="dropdown-item"
                        value="Engineering"
                      >
                        Engineering
                      </option>
                      <option
                        id="man"
                        className="dropdown-item"
                        value="Management"
                      >
                        Management
                      </option>
                      <option
                        id="heal"
                        className="dropdown-item"
                        value="Healthcare"
                      >
                        Healthcare
                      </option>
                      <option
                        id="fin"
                        className="dropdown-item"
                        value="Finance"
                      >
                        Finance
                      </option>
                      <option
                        id="sci"
                        className="dropdown-item"
                        value="Science"
                      >
                        Science
                      </option>
                      <option
                        id="ed"
                        className="dropdown-item"
                        value="Education"
                      >
                        Education
                      </option>
                      <option
                        id="art"
                        className="dropdown-item"
                        value="Art and media"
                      >
                        Art and media
                      </option>
                      <option
                        id="hos"
                        className="dropdown-item"
                        value="Hospitality"
                      >
                        Hospitality
                      </option>
                      <option
                        id="con"
                        className="dropdown-item"
                        value="Construction"
                      >
                        Construction
                      </option>
                      <option
                        id="gov"
                        className="dropdown-item"
                        value="Govt and administration"
                      >
                        Govt and administration
                      </option>
                      <option
                        id="vol"
                        className="dropdown-item"
                        value="Volunteering"
                      >
                        Volunteering
                      </option>
                      <option id="oth" className="dropdown-item" value="Other">
                        Others
                      </option>
                    </select>
                    <button
                      className="button-pri"
                      id="Prof"
                      value="Prof"
                      onClick={clickHandler}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="button-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Location")}
              >
                <p className="group-label">Location</p>
                <span className="accordion-chevron">
                  <ChevronIcon isOpen={openAccordion === "Location"} />
                </span>
              </div>
              {openAccordion === "Location" && (
                <div className="accordion-content">
                  <div className="buttons-div">
                    <DataButton
                      name="Rural Addr."
                      value="RurAddress"
                      action={clickHandler}
                    />
                    <DataButton
                      name="City Addr."
                      value="UrbAddress"
                      action={clickHandler}
                    />
                    <DataButton
                      name="City"
                      value="City"
                      action={clickHandler}
                    />
                    <DataButton
                      name="State"
                      value="State"
                      action={clickHandler}
                    />
                    <DataButton
                      name="City & State"
                      value="CityState"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Post Code"
                      value="PIN"
                      action={clickHandler}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="button-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Personal IDs")}
              >
                <p className="group-label">Personal IDs</p>
                <span className="accordion-chevron">
                  <ChevronIcon isOpen={openAccordion === "Personal IDs"} />
                </span>
              </div>
              {openAccordion === "Personal IDs" && (
                <div className="accordion-content">
                  <div className="buttons-div">
                    <DataButton
                      name="Passport"
                      value="Pass"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Aadhar"
                      value="UID"
                      action={clickHandler}
                    />
                    <DataButton name="PAN" value="PAN" action={clickHandler} />
                    <DataButton
                      name="UPI (name)"
                      value="UPIn"
                      action={clickHandler}
                    />
                    <DataButton
                      name="UPI (mob)"
                      value="UPIm"
                      action={clickHandler}
                    />
                    <DataButton
                      name="Voter ID"
                      value="Voter"
                      action={clickHandler}
                    />
                    <DataButton name="DL" value="DL" action={clickHandler} />
                    <DataButton
                      name="Vehicle RC"
                      value="RC"
                      action={clickHandler}
                    />
                    <DataButton
                      name="RC (BH)"
                      value="RCBH"
                      action={clickHandler}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="button-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Business IDs")}
              >
                <p className="group-label">Business IDs</p>
                <span className="accordion-chevron">
                  <ChevronIcon isOpen={openAccordion === "Business IDs"} />
                </span>
              </div>
              {openAccordion === "Business IDs" && (
                <div className="accordion-content">
                  <div className="buttons-div">
                    <DataButton
                      name="PAN (Corp)"
                      value="PANi"
                      action={clickHandler}
                    />
                    <DataButton
                      name="GSTIN"
                      value="GSTIN"
                      action={clickHandler}
                    />
                    <DataButton name="CIN" value="CIN" action={clickHandler} />
                    <DataButton name="DIN" value="DIN" action={clickHandler} />
                    <DataButton
                      name="LLPIN"
                      value="LLPIN"
                      action={clickHandler}
                    />
                    <DataButton name="TAN" value="TAN" action={clickHandler} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="error-note">
          <p
            style={{
              textAlign: "center",
              fontSize: "var(--figma-font-size-xs)",
              color: "#6f6f70",
              fontWeight: "bold",
            }}
          >
            Using Figma Buzz?
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: "var(--figma-font-size-xs)",
              color: "#6f6f70",
              padding: "0 var(--figma-space-sm) 0.5rem",
              width: "100%",
            }}
          >
            Please click the "Open in a modal" icon above for a better
            experience.
          </p>
        </div>
      </div>
    </>
  );
};

export default FirstTab;
