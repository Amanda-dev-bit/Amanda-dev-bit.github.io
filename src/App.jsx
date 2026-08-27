import { useCallback, useState } from "react";

import Preloader from "./components/Preloader/Preloader.jsx";
import Cursor from "./components/Cursor/Cursor.jsx";
import ScrollProgress from "./components/ScrollProgress/ScrollProgress.jsx";
import Header from "./components/Header/Header.jsx";
import Hero from "./components/Hero/Hero.jsx";
import About from "./components/About/About.jsx";
import Craft from "./components/Craft/Craft.jsx";
import Work from "./components/Work/Work.jsx";
import Journey from "./components/Journey/Journey.jsx";
import Contact from "./components/Contact/Contact.jsx";
import Footer from "./components/Footer/Footer.jsx";

import { useTheme } from "./hooks";
import "./App.css";

export default function App() {
  const [ready, setReady] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const handleLoaded = useCallback(() => setReady(true), []);

  return (
    <>
      <Preloader onDone={handleLoaded} />
      <Cursor />
      <ScrollProgress />

      <div className="grain" aria-hidden="true" />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} inert={!ready} />

      <main
        id="main"
        className="main"
        data-ready={ready ? "true" : "false"}
        inert={!ready}
      >
        <Hero ready={ready} />
        <About />
        <Craft />
        <Work />
        <Journey />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
