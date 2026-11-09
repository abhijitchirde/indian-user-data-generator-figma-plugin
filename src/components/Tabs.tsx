import * as React from "react";
import type { TabId } from "../prefs";

const TABS: { id: TabId; title: string }[] = [
  { id: "1", title: "Add to text layers" },
  { id: "2", title: "Create user sets" },
];

interface Props {
  current: TabId;
  onChange: (tab: TabId) => void;
}

/** Tab bar (controlled: the open tab is remembered between sessions) */
const Tabs = ({ current, onChange }: Props) => (
  <div className="tab">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        id={tab.id}
        disabled={current === tab.id}
        onClick={() => onChange(tab.id)}
      >
        {tab.title}
      </button>
    ))}
  </div>
);

export default Tabs;
