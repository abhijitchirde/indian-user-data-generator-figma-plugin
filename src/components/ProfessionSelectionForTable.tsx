import * as React from "react";
import ProfessionSelect from "./ProfessionSelect";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  domain: string;
  onDomainChange: (domain: string) => void;
}

/** Profession checkbox + domain dropdown for the table tab (fully controlled) */
const ProfessionSelectionForTable = ({
  checked,
  onCheckedChange,
  domain,
  onDomainChange,
}: Props) => (
  <>
    <div className="checkbox">
      <label>
        <input
          type="checkbox"
          value="ProfChk"
          name="ProfChk"
          checked={checked}
          onChange={() => onCheckedChange(!checked)}
        />
        <span>Profession</span>
      </label>
    </div>

    <ProfessionSelect
      id="profession-domain-2"
      value={domain}
      onChange={onDomainChange}
      disabled={!checked}
    />
  </>
);

export default ProfessionSelectionForTable;
