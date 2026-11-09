import * as React from "react";
import { PROFESSION_DOMAINS } from "../fieldMeta";

interface Props {
  id: string;
  value: string;
  onChange: (domain: string) => void;
  disabled?: boolean;
}

/** "Domain" label + dropdown of profession domains (controlled) */
const ProfessionSelect = ({ id, value, onChange, disabled }: Props) => (
  <>
    <label className="dropdown-label" htmlFor={id}>
      Domain
    </label>
    <select
      className="dropdown-main"
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {PROFESSION_DOMAINS.map((domain) => (
        <option key={domain.value} className="dropdown-item" value={domain.value}>
          {domain.label}
        </option>
      ))}
    </select>
  </>
);

export default ProfessionSelect;
