import * as React from "react";
import { fieldsInGroup, FieldGroup, GROUPS } from "../fieldMeta";
import Accordion from "./Accordion";
import DataButton from "./DataButton";
import ProfessionSelect from "./ProfessionSelect";

const FirstTab = ({ onClick, onFillByName, onRegenerate }) => {
  const [selected, setSelected] = React.useState("Random");
  const [openGroup, setOpenGroup] = React.useState<FieldGroup | null>("personal");

  const clickHandler = (e) => {
    onClick(e.currentTarget.value, selected);
  };

  const toggleGroup = (group: FieldGroup) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  return (
    <>
      <div className="tabcontent">
        <div className="tab-container">
          <div className="smart-fill">
            <div className="smart-fill-actions">
              <button
                className="button-large smart-fill-button"
                onClick={() => onFillByName(selected)}
              >
                Fill by layer names
              </button>
              <button
                className="button-large button-json smart-fill-regenerate"
                onClick={onRegenerate}
                title="Replace data in selected layers filled by this plugin"
              >
                Regenerate
              </button>
            </div>
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
            {GROUPS.map((group) => (
              <Accordion
                key={group.id}
                groupClass="button-group"
                title={group.label}
                isOpen={openGroup === group.id}
                onToggle={() => toggleGroup(group.id)}
              >
                <div className="buttons-div">
                  {group.id === "profession" ? (
                    <>
                      <ProfessionSelect
                        id="profession-domain-1"
                        value={selected}
                        onChange={setSelected}
                      />
                      <button
                        className="button-pri"
                        value="Prof"
                        onClick={clickHandler}
                      >
                        Add
                      </button>
                    </>
                  ) : (
                    fieldsInGroup(group.id).map((field) => (
                      <DataButton
                        key={field.key}
                        name={field.shortLabel}
                        value={field.key}
                        action={clickHandler}
                      />
                    ))
                  )}
                </div>
              </Accordion>
            ))}
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
