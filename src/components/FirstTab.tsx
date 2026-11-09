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
        <div className="tab-container first-tab">
          <div className="smart-fill">
            <button
              className="button-large smart-fill-button"
              onClick={() => onFillByName(selected)}
            >
              Fill by layer names
            </button>
            <p className="smart-fill-hint">
              Select a card or its text layers. Layers named "Name", "Email",
              "Phone"… get one matching person.
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
            Or select text layers and pick a data type below.
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

          <div className="regenerate-section">
            <button
              className="button-large button-json regenerate-button"
              onClick={onRegenerate}
              title="Replace the data in selected layers that this plugin filled before"
            >
              Regenerate selected data
            </button>
          </div>

          <p className="buzz-note">
            <strong>Using Figma Buzz?</strong> Open the plugin in a modal for
            more room.
          </p>
        </div>
      </div>
    </>
  );
};

export default FirstTab;
