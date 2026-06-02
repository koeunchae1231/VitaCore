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
              <h1 className="auth-description-title">What is VitaCore?</h1>
              <p className="auth-description-text">
                VitaCore는 바이탈 데이터와 캐릭터 상태를 연결해 생리적 변화를
                시각적으로 보여주는 교육용 시뮬레이터입니다.
                <br />
                <br />
                심박, 혈압, 호흡, 체온, 산소포화도의 변화를 명령어로 적용하고
                캐릭터 이미지와 이벤트 로그로 상태를 확인할 수 있습니다.
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
