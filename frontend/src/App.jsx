import { useState } from "react";
import "./index.css";
import NexusScene from "./components/NexusScene.jsx";

export default function App() {
  const [launched, setLaunched] = useState(false);

  const handleSelect = (key) => {
    console.log("open:", key);
    // window.location.href = `/${key}`;
  };

  return (
    <div className="screen">
      {!launched ? (
        <button className="glow-btn" onClick={() => setLaunched(true)}>
          Lanzamiento de Nexus
        </button>
      ) : (
        <NexusScene onSelect={handleSelect} />
      )}
    </div>
  );
}
