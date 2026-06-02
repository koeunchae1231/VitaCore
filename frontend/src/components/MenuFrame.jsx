// frontend/src/components/MenuFrame.jsx

/**
 * MenuFrame
 *
 * 역할:
 * - PDF 3, 8페이지처럼 메뉴 선택 화면 공통 구조 담당
 * - 왼쪽: VITACORE 브랜드 영역
 * - 오른쪽: 메뉴 버튼 목록
 *
 * 수정 포인트:
 * - title을 바꾸면 왼쪽 브랜드 글자가 바뀜
 * - subtitle을 바꾸면 브랜드 아래 설명 문구가 바뀜
 * - items 배열을 바꾸면 오른쪽 메뉴 버튼이 바뀜
 */

import PageHeader from "./PageHeader";

export default function MenuFrame({
  title = "VITACORE",
  pageTitle,
  subtitle,
  items = [],
  brandIcon,
}) {
  return (
    <div className="app-background">
      <main className="app-frame">
        <div className="app-content general-page menu-page">
          <PageHeader title={pageTitle} />
          <div className="menu-frame">
          {/* 
            왼쪽 브랜드 영역
            - PDF의 VITACORE 로고/타이틀 자리
          */}
          <section className="menu-brand">
            {brandIcon && (
              <div className="menu-brand-icon-shell">
                <img
                  className="menu-brand-icon"
                  src={brandIcon}
                  alt="VitaCore icon"
                />
              </div>
            )}
            
            {subtitle && <p className="menu-brand-subtitle">{subtitle}</p>}
          </section>

          {/* 
            오른쪽 메뉴 영역
            - SIGN UP / SIGN IN / WHAT IS VITACORE?
            - CHARACTER LIST / NEW CHARACTER / ACCOUNT SETTING
          */}
          <nav className="menu-actions" aria-label="Main menu">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`btn btn-block ${item.className || ""}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
