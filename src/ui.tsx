import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./ui.css";
import BottomSection from "./components/BottomSection";
import FirstTab from "./components/FirstTab";
import SecondTab from "./components/SecondTab";
import Tabs from "./components/Tabs";
import { useFigmaTheme } from "./hooks/useFigmaTheme";

declare function require(path: string): any;

function App() {
  const [currentTab, setCurrentTab] = React.useState("1");
  const { theme, isDark } = useFigmaTheme();

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
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const getTab = (input) => {
    setCurrentTab(input);
  };

  const onFillByName = (profDomain) => {
    parent.postMessage(
      { pluginMessage: { type: "fill-by-name", data: { profDomain } } },
      "*"
    );
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
          data: { chkData, noOfUsers, profDomain },
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
          data: { chkData, noOfUsers, profDomain },
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
          data: { chkData, noOfUsers, profDomain },
        },
      },
      "*"
    );
  };

  return (
    <main>
      <Tabs tabID={getTab} />

      {currentTab === "1" ? (
        <FirstTab onClick={onGenerate} onFillByName={onFillByName} />
      ) : (
        <SecondTab
          onClick={onCreateTable}
          onExportJSON={onExportJSON}
          onExportCSV={onExportCSV}
        />
      )}

      <BottomSection />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-page")).render(<App />);
