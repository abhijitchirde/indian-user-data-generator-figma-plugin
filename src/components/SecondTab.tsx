import * as React from "react";
import {
  FieldGroup,
  FieldSelection,
  fieldsInGroup,
  GROUPS,
  selectionKey,
  tableSelection,
} from "../fieldMeta";
import { MAX_SEED_LENGTH, MAX_USERS_INPUT } from "../prefs";
import Accordion from "./Accordion";
import DataCheckbox from "./DataCheckbox";
import ProfessionSelectionForTable from "./ProfessionSelectionForTable";

type UserSetHandler = (selection: FieldSelection, users: number | string, profDomain: string) => void;

interface Props {
  onClick: UserSetHandler;
  onExportJSON: UserSetHandler;
  onExportCSV: UserSetHandler;
  onCopyJSON: UserSetHandler;
  onCopyTSV: UserSetHandler;
  // Remembered between sessions (owned by App)
  selection: FieldSelection;
  onSelectionChange: (selection: FieldSelection) => void;
  users: number | string;
  onUsersChange: (users: number | string) => void;
  domain: string;
  onDomainChange: (domain: string) => void;
  seed: string;
  onSeedChange: (seed: string) => void;
}

const SecondTab = ({
  onClick,
  onExportJSON,
  onExportCSV,
  onCopyJSON,
  onCopyTSV,
  selection,
  onSelectionChange,
  users,
  onUsersChange,
  domain,
  onDomainChange,
  seed,
  onSeedChange,
}: Props) => {
  const chkData = selection;
  const usersInput = users;
  const profDomain = domain;

  const [openGroup, setOpenGroup] = React.useState<FieldGroup | null>("personal");

  const inputChangeHandler = (e) => {
    onUsersChange(e.target.value);
  };

  // 10,000 is the export limit; the plugin enforces a lower limit for canvas tables
  const incrementUsers = () => {
    onUsersChange(Math.min(MAX_USERS_INPUT, Number(usersInput) + 1));
  };

  const decrementUsers = () => {
    onUsersChange(Math.max(1, Number(usersInput) - 1));
  };

  const setProfessionChecked = (checked: boolean) => {
    onSelectionChange({ ...chkData, ProfValue: checked });
  };

  const isAnyCheckboxSelected = React.useMemo(
    () => Object.values(chkData).some(Boolean),
    [chkData]
  );

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

  const resetSelections = () => onSelectionChange(tableSelection("none"));

  const selectAll = () => onSelectionChange(tableSelection("all"));

  const resetToDefault = () => {
    onSelectionChange(tableSelection("default"));
    onDomainChange("Random");
    onUsersChange(1);
  };

  const updateCheckbox = (e) => {
    onSelectionChange({ ...chkData, [e.target.id]: e.target.checked });
  };

  const toggleGroup = (group: FieldGroup) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  const selectedInGroup = (group: FieldGroup) =>
    fieldsInGroup(group, true).filter((field) => chkData[selectionKey(field.key)])
      .length;

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
            {GROUPS.map((group) => (
              <Accordion
                key={group.id}
                groupClass="checkbox-group"
                title={group.label}
                isOpen={openGroup === group.id}
                onToggle={() => toggleGroup(group.id)}
                selectedCount={selectedInGroup(group.id)}
              >
                <div className="checkboxes">
                  {group.id === "profession" ? (
                    <ProfessionSelectionForTable
                      checked={chkData.ProfValue === true}
                      onCheckedChange={setProfessionChecked}
                      domain={profDomain}
                      onDomainChange={onDomainChange}
                    />
                  ) : (
                    fieldsInGroup(group.id, true).map((field) => (
                      <DataCheckbox
                        key={field.key}
                        name={`${field.key}Chk`}
                        label={field.shortLabel}
                        checked={chkData[selectionKey(field.key)] === true}
                        id={selectionKey(field.key)}
                        onChange={updateCheckbox}
                      />
                    ))
                  )}
                </div>
              </Accordion>
            ))}
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

          <div className="input-div seed-row">
            <label className="input-label" htmlFor="seed">
              Seed
            </label>
            <input
              className="seed-input"
              type="text"
              id="seed"
              value={seed}
              maxLength={MAX_SEED_LENGTH}
              placeholder="Optional"
              title="Type any word or number to get the same users every time (table, JSON and CSV). Leave empty for new users each time."
              onChange={(e) => onSeedChange(e.target.value)}
            />
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

          <div className="copy-links">
            <span>Copy:</span>
            <button
              className="copy-link"
              onClick={() => isAnyCheckboxSelected && onCopyJSON(chkData, usersInput, profDomain)}
              disabled={!isAnyCheckboxSelected}
              title="Copy the users as JSON"
            >
              JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              className="copy-link"
              onClick={() => isAnyCheckboxSelected && onCopyTSV(chkData, usersInput, profDomain)}
              disabled={!isAnyCheckboxSelected}
              title="Copy as rows you can paste into Google Sheets or Excel"
            >
              For spreadsheets
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecondTab;
