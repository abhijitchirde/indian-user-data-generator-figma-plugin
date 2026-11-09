import * as React from "react";
import DataCheckbox from "./DataCheckbox";
import ProfessionSelectionForTable from "./ProfessionSelectionForTable";

const SecondTab = ({ onClick, onExportJSON, onExportCSV }) => {
  const [chkData, setChkData] = React.useState({
    FirstNameValue: false,
    LastNameValue: false,
    FullNameValue: true,
    DoBValue: true,
    EmailValue: true,
    MobileValue: true,
    ProfValue: true,
    RurAddressValue: false,
    UrbAddressValue: true,
    CityValue: true,
    StateValue: true,
    PINValue: true,
    PassValue: false,
    UIDValue: true,
    PANValue: true,
    UPInValue: false,
    UPImValue: false,
    DLValue: false,
    RCValue: false,
    RCBHValue: false,
    VoterValue: false,
    CINValue: false,
    GSTINValue: true,
    DINValue: false,
    LLPINValue: false,
    PANiValue: false,
    TANValue: false,
  });

  const [usersInput, setUsersInput] = React.useState(1);

  const [profDomain, setProfDomain] = React.useState("Random");

  const [openAccordion, setOpenAccordion] = React.useState("Personal details");

  const inputChangeHandler = (e) => {
    setUsersInput(e.target.value);
  };

  const incrementUsers = () => {
    setUsersInput((prev) => {
      // 10,000 is the export limit; the plugin enforces a lower limit for canvas tables
      const newValue = Math.min(10000, Number(prev) + 1);
      return newValue;
    });
  };

  const decrementUsers = () => {
    setUsersInput((prev) => {
      const newValue = Math.max(1, Number(prev) - 1);
      return newValue;
    });
  };

  const updateDomain = (domain) => {
    setProfDomain(domain);
  };

  const isDomain = (value) => {
    setChkData((prev) => {
      return { ...prev, ["ProfValue"]: value };
    });
  };

  const clickHandler = () => {
    if (isAnyCheckboxSelected) {
      onClick(chkData, usersInput, profDomain);
    }
  };

  const jsonExportHandler = () => {
    if (isAnyCheckboxSelected) {
      onExportJSON(chkData, usersInput, profDomain);
    }
  };

  const csvExportHandler = () => {
    if (isAnyCheckboxSelected) {
      onExportCSV(chkData, usersInput, profDomain);
    }
  };

  const resetSelections = () => {
    setChkData({
      FirstNameValue: false,
      LastNameValue: false,
      FullNameValue: false,
      DoBValue: false,
      EmailValue: false,
      MobileValue: false,
      ProfValue: false,
      RurAddressValue: false,
      UrbAddressValue: false,
      CityValue: false,
      StateValue: false,
      PINValue: false,
      PassValue: false,
      UIDValue: false,
      PANValue: false,
      UPInValue: false,
      UPImValue: false,
      DLValue: false,
      RCValue: false,
      RCBHValue: false,
      VoterValue: false,
      CINValue: false,
      GSTINValue: false,
      DINValue: false,
      LLPINValue: false,
      PANiValue: false,
      TANValue: false,
    });
  };

  const resetToDefault = () => {
    setChkData({
      FirstNameValue: false,
      LastNameValue: false,
      FullNameValue: true,
      DoBValue: true,
      EmailValue: true,
      MobileValue: true,
      ProfValue: true,
      RurAddressValue: false,
      UrbAddressValue: true,
      CityValue: true,
      StateValue: true,
      PINValue: true,
      PassValue: false,
      UIDValue: true,
      PANValue: true,
      UPInValue: false,
      UPImValue: false,
      DLValue: false,
      RCValue: false,
      RCBHValue: false,
      VoterValue: false,
      CINValue: false,
      GSTINValue: true,
      DINValue: false,
      LLPINValue: false,
      PANiValue: false,
      TANValue: false,
    });
    setProfDomain("Random");
    setUsersInput(1);
  };

  const selectAll = () => {
    setChkData({
      FirstNameValue: true,
      LastNameValue: true,
      FullNameValue: true,
      DoBValue: true,
      EmailValue: true,
      MobileValue: true,
      ProfValue: true,
      RurAddressValue: true,
      UrbAddressValue: true,
      CityValue: true,
      StateValue: true,
      PINValue: true,
      PassValue: true,
      UIDValue: true,
      PANValue: true,
      UPInValue: true,
      UPImValue: true,
      DLValue: true,
      RCValue: true,
      RCBHValue: true,
      VoterValue: true,
      CINValue: true,
      GSTINValue: true,
      DINValue: true,
      LLPINValue: true,
      PANiValue: true,
      TANValue: true,
    });
  };

  const updateCheckbox = (e) => {
    const id = e.target.id;
    setChkData((prev) => {
      return { ...prev, [`${id}`]: e.target.checked };
    });
  };

  const toggleAccordion = (accordionName) => {
    setOpenAccordion(openAccordion === accordionName ? null : accordionName);
  };

  const countSelected = (keys) => {
    return keys.filter((key) => chkData[key]).length;
  };

  const isAnyCheckboxSelected = React.useMemo(() => {
    const allKeys = [
      "FirstNameValue",
      "LastNameValue",
      "FullNameValue",
      "DoBValue",
      "EmailValue",
      "MobileValue",
      "ProfValue",
      "RurAddressValue",
      "UrbAddressValue",
      "CityValue",
      "StateValue",
      "PINValue",
      "PassValue",
      "UIDValue",
      "PANValue",
      "UPInValue",
      "UPImValue",
      "DLValue",
      "RCValue",
      "RCBHValue",
      "VoterValue",
      "CINValue",
      "GSTINValue",
      "DINValue",
      "LLPINValue",
      "PANiValue",
      "TANValue",
    ];
    return countSelected(allKeys) > 0;
  }, [chkData]);

  const getSectionCount = (sectionName) => {
    switch (sectionName) {
      case "Personal details":
        return countSelected([
          "FirstNameValue",
          "LastNameValue",
          "FullNameValue",
          "DoBValue",
          "EmailValue",
          "MobileValue",
        ]);
      case "Profession":
        return countSelected(["ProfValue"]);
      case "Location":
        return countSelected([
          "RurAddressValue",
          "UrbAddressValue",
          "CityValue",
          "StateValue",
          "PINValue",
        ]);
      case "Personal IDs":
        return countSelected([
          "PassValue",
          "UIDValue",
          "PANValue",
          "UPInValue",
          "UPImValue",
          "VoterValue",
          "DLValue",
          "RCValue",
          "RCBHValue",
        ]);
      case "Business IDs":
        return countSelected([
          "PANiValue",
          "GSTINValue",
          "CINValue",
          "DINValue",
          "LLPINValue",
          "TANValue",
        ]);
      default:
        return 0;
    }
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
          <div className="reset-selections-container">
            <a
              href="#"
              className="reset-selections-link"
              onClick={(e) => {
                e.preventDefault();
                selectAll();
              }}
            >
              Select all
            </a>
            <a
              href="#"
              className="reset-selections-link"
              onClick={(e) => {
                e.preventDefault();
                resetSelections();
              }}
            >
              Deselect all
            </a>
            <a
              href="#"
              className="reset-selections-link"
              onClick={(e) => {
                e.preventDefault();
                resetToDefault();
              }}
            >
              Default
            </a>
          </div>
          <div className="checkboxes-list scrollable-content">
            <div className="checkbox-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Personal details")}
              >
                <p className="group-label">Personal Details</p>
                <div className="accordion-right">
                  <p className="selection-count">
                    {getSectionCount("Personal details")} selected
                  </p>
                  <span className="accordion-chevron">
                    <ChevronIcon
                      isOpen={openAccordion === "Personal details"}
                    />
                  </span>
                </div>
              </div>
              {openAccordion === "Personal details" && (
                <div className="accordion-content">
                  <div className="checkboxes">
                    <DataCheckbox
                      name="FirstNameChk"
                      label="First Name"
                      checked={chkData.FirstNameValue}
                      id="FirstNameValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="LastNameChk"
                      label="Last Name"
                      checked={chkData.LastNameValue}
                      id="LastNameValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="FullNameChk"
                      label="Full Name"
                      checked={chkData.FullNameValue}
                      id="FullNameValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="DoBChk"
                      label="Birth Date"
                      checked={chkData.DoBValue}
                      id="DoBValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="EmailChk"
                      label="Email"
                      checked={chkData.EmailValue}
                      id="EmailValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="MobileChk"
                      label="Mobile"
                      checked={chkData.MobileValue}
                      id="MobileValue"
                      onChange={updateCheckbox}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="checkbox-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Profession")}
              >
                <p className="group-label">Profession</p>
                <div className="accordion-right">
                  <p className="selection-count">
                    {getSectionCount("Profession")} selected
                  </p>
                  <span className="accordion-chevron">
                    <ChevronIcon isOpen={openAccordion === "Profession"} />
                  </span>
                </div>
              </div>
              {openAccordion === "Profession" && (
                <div className="accordion-content">
                  <div className="checkboxes">
                    <ProfessionSelectionForTable
                      getDomain={updateDomain}
                      isDomain={isDomain}
                      checked={chkData.ProfValue}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="checkbox-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Location")}
              >
                <p className="group-label">Location</p>
                <div className="accordion-right">
                  <p className="selection-count">
                    {getSectionCount("Location")} selected
                  </p>
                  <span className="accordion-chevron">
                    <ChevronIcon isOpen={openAccordion === "Location"} />
                  </span>
                </div>
              </div>
              {openAccordion === "Location" && (
                <div className="accordion-content">
                  <div className="checkboxes">
                    <DataCheckbox
                      name="RurAddressChk"
                      label="Rural Addr."
                      checked={chkData.RurAddressValue}
                      id="RurAddressValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="UrbAddressChk"
                      label="City Addr."
                      checked={chkData.UrbAddressValue}
                      id="UrbAddressValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="CityChk"
                      label="City"
                      checked={chkData.CityValue}
                      id="CityValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="StateChk"
                      label="State"
                      checked={chkData.StateValue}
                      id="StateValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="PINChk"
                      label="Post Code"
                      checked={chkData.PINValue}
                      id="PINValue"
                      onChange={updateCheckbox}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="checkbox-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Personal IDs")}
              >
                <p className="group-label">Personal IDs</p>
                <div className="accordion-right">
                  <p className="selection-count">
                    {getSectionCount("Personal IDs")} selected
                  </p>
                  <span className="accordion-chevron">
                    <ChevronIcon isOpen={openAccordion === "Personal IDs"} />
                  </span>
                </div>
              </div>
              {openAccordion === "Personal IDs" && (
                <div className="accordion-content">
                  <div className="checkboxes">
                    <DataCheckbox
                      name="PassChk"
                      label="Passport"
                      checked={chkData.PassValue}
                      id="PassValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="UIDChk"
                      label="Aadhar"
                      checked={chkData.UIDValue}
                      id="UIDValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="PANChk"
                      label="PAN"
                      checked={chkData.PANValue}
                      id="PANValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="UPInChk"
                      label="UPI (name)"
                      checked={chkData.UPInValue}
                      id="UPInValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="UPImChk"
                      label="UPI (mob)"
                      checked={chkData.UPImValue}
                      id="UPImValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="VoterChk"
                      label="Voter ID"
                      checked={chkData.VoterValue}
                      id="VoterValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="DLChk"
                      label="DL"
                      checked={chkData.DLValue}
                      id="DLValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="RCChk"
                      label="Vehicle RC"
                      checked={chkData.RCValue}
                      id="RCValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="RCBHChk"
                      label="RC (BH)"
                      checked={chkData.RCBHValue}
                      id="RCBHValue"
                      onChange={updateCheckbox}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="checkbox-group accordion">
              <div
                className="accordion-header"
                onClick={() => toggleAccordion("Business IDs")}
              >
                <p className="group-label">Business IDs</p>
                <div className="accordion-right">
                  <p className="selection-count">
                    {getSectionCount("Business IDs")} selected
                  </p>
                  <span className="accordion-chevron">
                    <ChevronIcon isOpen={openAccordion === "Business IDs"} />
                  </span>
                </div>
              </div>
              {openAccordion === "Business IDs" && (
                <div className="accordion-content">
                  <div className="checkboxes">
                    <DataCheckbox
                      name="PANi"
                      label="PAN (Corp)"
                      checked={chkData.PANiValue}
                      id="PANiValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="GSTINChk"
                      label="GSTIN"
                      checked={chkData.GSTINValue}
                      id="GSTINValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="CINChk"
                      label="CIN"
                      checked={chkData.CINValue}
                      id="CINValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="DINChk"
                      label="DIN"
                      checked={chkData.DINValue}
                      id="DINValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="LLPINChk"
                      label="LLPIN"
                      checked={chkData.LLPINValue}
                      id="LLPINValue"
                      onChange={updateCheckbox}
                    />
                    <DataCheckbox
                      name="TAN"
                      label="TAN"
                      checked={chkData.TANValue}
                      id="TANValue"
                      onChange={updateCheckbox}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed-bottom-section">
        <div className="separate-button-div text-center">
          <div className="input-div">
            <label className="input-label" htmlFor="noOfUsers">
              Number of users
            </label>
            <div className="user-input-wrapper">
              <button
                className="user-input-button"
                type="button"
                onClick={decrementUsers}
                aria-label="Decrease number of users"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6H10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <input
                className="user-input"
                type="number"
                name="noOfUsers"
                id="noOfUsers"
                value={usersInput}
                min={1}
                max={10000}
                step={1}
                onInput={inputChangeHandler}
              />
              <button
                className="user-input-button"
                type="button"
                onClick={incrementUsers}
                aria-label="Increase number of users"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 2V10M2 6H10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="buttons-container">
            <button
              className="button-large"
              onClick={clickHandler}
              disabled={!isAnyCheckboxSelected}
              title={
                !isAnyCheckboxSelected
                  ? "Please select data types above to generate"
                  : ""
              }
            >
              Add table to Figma
            </button>
            <button
              className="button-large button-json"
              onClick={jsonExportHandler}
              disabled={!isAnyCheckboxSelected}
              title={
                !isAnyCheckboxSelected
                  ? "Please select data types above to generate"
                  : ""
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  display: "inline-block",
                  marginRight: "6px",
                  verticalAlign: "middle",
                }}
              >
                <path
                  d="M7 9.5L4.5 7L5.2 6.3L6.25 7.35V2.5H7.75V7.35L8.8 6.3L9.5 7L7 9.5ZM3.5 11.5C3.225 11.5 2.9875 11.4 2.7875 11.2C2.5875 11 2.4875 10.7625 2.4875 10.4875V9H3.5V10.5H10.5V9H11.5V10.4875C11.5 10.7625 11.4 11 11.2 11.2C11 11.4 10.7625 11.5 10.4875 11.5H3.5Z"
                  fill="currentColor"
                />
              </svg>
              JSON
            </button>
            <button
              className="button-large button-json"
              onClick={csvExportHandler}
              disabled={!isAnyCheckboxSelected}
              title={
                !isAnyCheckboxSelected
                  ? "Please select data types above to generate"
                  : ""
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  display: "inline-block",
                  marginRight: "6px",
                  verticalAlign: "middle",
                }}
              >
                <path
                  d="M7 9.5L4.5 7L5.2 6.3L6.25 7.35V2.5H7.75V7.35L8.8 6.3L9.5 7L7 9.5ZM3.5 11.5C3.225 11.5 2.9875 11.4 2.7875 11.2C2.5875 11 2.4875 10.7625 2.4875 10.4875V9H3.5V10.5H10.5V9H11.5V10.4875C11.5 10.7625 11.4 11 11.2 11.2C11 11.4 10.7625 11.5 10.4875 11.5H3.5Z"
                  fill="currentColor"
                />
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecondTab;
