import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./ui.css";
import BottomSection from "./components/BottomSection";
import FirstTab from "./components/FirstTab";
import SecondTab from "./components/SecondTab";
import Tabs from "./components/Tabs";
import { usePrefs } from "./hooks/usePrefs";

declare function require(path: string): any;

/**
 * Copies text to the clipboard. Figma blocks navigator.clipboard inside plugin windows,
 * so a hidden textarea + execCommand("copy") comes first; the Clipboard API is the fallback.
 */
async function copyText(text: string): Promise<boolean> {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  if (ok) return true;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function App() {
  // Open tab, table fields, user count and domains, remembered between sessions
  const { prefs, update } = usePrefs();

  React.useEffect(() => {
    // Listen for JSON and CSV data from plugin
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === "json-export-ready") {
        const jsonData = event.data.pluginMessage.data;
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `indian-user-data-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (event.data.pluginMessage?.type === "csv-export-ready") {
        const csvData = event.data.pluginMessage.data;
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `indian-user-data-${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (event.data.pluginMessage?.type === "copy-ready") {
        const { text, message } = event.data.pluginMessage;
        copyText(text).then((ok) =>
          parent.postMessage({ pluginMessage: { type: "copy-done", ok, message } }, "*")
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const onFillByName = (profDomain) => {
    parent.postMessage(
      { pluginMessage: { type: "fill-by-name", data: { profDomain } } },
      "*"
    );
  };

  const onRegenerate = () => {
    parent.postMessage({ pluginMessage: { type: "regenerate-selection" } }, "*");
  };

  const onGenerate = (inputValue, profDomain) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-random",
          data: { inputValue, profDomain },
        },
      },
      "*"
    );
  };

  const onCreateTable = (chkData, users, profDomain) => {
    let noOfUsers = +users;
    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-table",
          data: { chkData, noOfUsers, profDomain, seed: prefs?.tableSeed },
        },
      },
      "*"
    );
  };

  const onExportJSON = (chkData, users, profDomain) => {
    let noOfUsers = +users;
    parent.postMessage(
      {
        pluginMessage: {
          type: "export-json",
          data: { chkData, noOfUsers, profDomain, seed: prefs?.tableSeed },
        },
      },
      "*"
    );
  };

  const onExportCSV = (chkData, users, profDomain) => {
    let noOfUsers = +users;
    parent.postMessage(
      {
        pluginMessage: {
          type: "export-csv",
          data: { chkData, noOfUsers, profDomain, seed: prefs?.tableSeed },
        },
      },
      "*"
    );
  };

  const onCopy = (format: "json" | "tsv") => (chkData, users, profDomain) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: format === "json" ? "copy-json" : "copy-tsv",
          data: { chkData, noOfUsers: +users, profDomain, seed: prefs?.tableSeed },
        },
      },
      "*"
    );
  };

  // Saved choices arrive within a few milliseconds; render once they're known
  if (!prefs) return <main />;

  return (
    <main>
      <Tabs current={prefs.tab} onChange={(tab) => update({ tab })} />

      {prefs.tab === "1" ? (
        <FirstTab
          onClick={onGenerate}
          onFillByName={onFillByName}
          onRegenerate={onRegenerate}
          domain={prefs.fillDomain}
          onDomainChange={(fillDomain) => update({ fillDomain })}
        />
      ) : (
        <SecondTab
          onClick={onCreateTable}
          onExportJSON={onExportJSON}
          onExportCSV={onExportCSV}
          onCopyJSON={onCopy("json")}
          onCopyTSV={onCopy("tsv")}
          selection={prefs.tableSelection}
          onSelectionChange={(tableSelection) => update({ tableSelection })}
          users={prefs.tableUsers}
          onUsersChange={(tableUsers) => update({ tableUsers })}
          domain={prefs.tableDomain}
          onDomainChange={(tableDomain) => update({ tableDomain })}
          seed={prefs.tableSeed}
          onSeedChange={(tableSeed) => update({ tableSeed })}
        />
      )}

      <BottomSection />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-page")).render(<App />);
