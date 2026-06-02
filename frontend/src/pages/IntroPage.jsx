import { useApp } from "../App";
import dissectionImage from "../assets/images/dissection.png";
import PageHeader from "../components/PageHeader";
import { routes } from "../router";

export default function IntroPage() {
  const { navigate } = useApp();

  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page auth-info-panel intro-page">
          <PageHeader title="WHAT IS VITACORE?" />

          <section className="auth-description-card intro-description-layout">
            <div className="intro-description-copy">
              <h1 className="auth-description-title">VITACORE는 무엇인가요?</h1>
              <p className="auth-description-text">
                증상이 없어도<br />
                신체 상태는 계속 변화합니다.
                <br />
                <br />
                바이탈 데이터를 기반으로<br />
                신체 상태를 편리하게 시각화하고,
                <br />
                <br />
                측정값을 넘어 생리학적인 변화를<br />
                캐릭터로 시뮬레이션합니다.
              </p>
            </div>
            <img
              className="intro-description-image"
              src={dissectionImage}
              alt="VitaCore anatomy illustration"
            />
          </section>

          <div className="btn-group intro-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate(routes.landing)}
            >
              BACK
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
