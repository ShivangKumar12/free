import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add link to Google Fonts for Space Grotesk, Orbitron, and Inter
const fontLinks = [
  document.createElement("link"),
  document.createElement("link"),
];

fontLinks[0].rel = "stylesheet";
fontLinks[0].href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap";

fontLinks[1].rel = "stylesheet";
fontLinks[1].href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";

// Append links to head
fontLinks.forEach((link) => document.head.appendChild(link));

// Add title
const titleElement = document.createElement("title");
titleElement.textContent = "3D Portfolio | Freelancer";
document.head.appendChild(titleElement);

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
