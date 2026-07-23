import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";

import { ActorApp } from "~/components/actor-app";
import "~/styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find the application root element.");
}

createRoot(rootElement).render(<ActorApp />);
