import { useEffect } from "react";

import { useApp } from "../App";
import dissectionImage from "../assets/images/dissection.png";
import { routes } from "../router";

export default function SplashPage() {
  const { navigate } = useApp();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate(routes.landing), 2800);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content splash-screen">
          <section className="splash-copy">
            <h1 className="splash-title">
              <span>VITA</span>
              <span>CORE</span>
            </h1>

            <p className="splash-subtitle">[ 생리 기반 교육용 시뮬레이터 ]</p>
          </section>

          <img
            className="splash-image"
            src={dissectionImage}
            alt="VitaCore anatomy illustration"
          />
        </div>
      </main>
    </div>
  );
}
