import { useEffect, useState } from "react";
import App from "./App";

function getCurrentRoute(): "/" | "/app" {
  return window.location.hash === "#/app" ? "/app" : "/";
}

function LandingPage() {
  return (
    <main className="landing-shell">
      <section className="landing-hero ui-panel ui-panel--elevated">
        <div className="landing-kicker">Codev MVP</div>
        <h1 className="landing-title">Interview practice with immediate AI feedback.</h1>
        <p className="landing-copy">
          Solve a focused JavaScript problem, run visible sample tests, and continue the loop with structured review,
          hints, and follow-up interview questions.
        </p>
        <div className="landing-actions">
          <a className="ui-button ui-button--primary landing-cta" href="#/app">
            Start practicing
          </a>
          <div className="landing-secondary">15 curated problems. Local-only session state. JavaScript only.</div>
        </div>
      </section>
    </main>
  );
}

function RootApp() {
  const [route, setRoute] = useState<"/" | "/app">(() => getCurrentRoute());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentRoute());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  if (route === "/app") {
    return <App />;
  }

  return <LandingPage />;
}

export default RootApp;
