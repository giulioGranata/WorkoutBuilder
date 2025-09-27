import { createRoot } from "react-dom/client";
import App from "./src/App";
import { ThemeProvider } from "./src/hooks/useTheme";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
