/**
 * LandingPage
 *
 * 역할:
 * - VitaCore 메인 메뉴 화면
 * - SIGN UP / SIGN IN / INTRO 이동
 *
 * 수정 포인트:
 * - items 배열을 수정하면 메뉴 버튼이 바뀜
 */

import MenuFrame from "../components/MenuFrame";
import { routes } from "../router";
import { useApp } from "../App";

import heartIcon from "../assets/icons/heart.png";

export default function LandingPage() {
  const { navigate } = useApp();

  return (
    <MenuFrame
      title="VITACORE"
      brandIcon={heartIcon}
      items={[
        {
          label: "SIGN UP",
          onClick: () => navigate(routes.signup),
        },
        {
          label: "SIGN IN",
          onClick: () => navigate(routes.signin),
        },
        {
          label: "WHAT IS VITACORE?",
          onClick: () => navigate(routes.future),
        },
      ]}
    />
  );
}
