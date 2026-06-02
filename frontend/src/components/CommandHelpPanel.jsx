const COMMAND_GROUPS = [
  {
    title: "CIRCULATORY",
    subtitle: "순환계",
    commands: [
      { name: "APPLY_FLUID", description: "수액 투여" },
      { name: "APPLY_BLEEDING", description: "출혈" },
      { name: "APPLY_VASODILATION", description: "혈관 확장" },
      { name: "APPLY_VASOCONSTRICTION", description: "혈관 수축" },
    ],
  },
  {
    title: "RESPIRATORY",
    subtitle: "호흡계",
    commands: [
      { name: "APPLY_OXYGEN", description: "산소 공급" },
      { name: "APPLY_HYPOXIA", description: "산소 부족" },
      { name: "APPLY_HYPERVENTILATION", description: "과호흡" },
      { name: "APPLY_HYPOVENTILATION", description: "저호흡" },
    ],
  },
  {
    title: "ENVIRONMENT",
    subtitle: "환경",
    commands: [
      { name: "APPLY_COLD", description: "저체온" },
      { name: "APPLY_HEAT", description: "고체온" },
    ],
  },
  {
    title: "ACTIVITY & METABOLISM",
    subtitle: "활동 & 대사",
    commands: [
      { name: "APPLY_ACTIVITY", description: "활동 증가" },
      { name: "APPLY_REST", description: "휴식" },
      { name: "APPLY_METABOLISM_UP", description: "대사 증가" },
      { name: "APPLY_METABOLISM_DOWN", description: "대사 감소" },
    ],
  },
  {
    title: "CONDITION",
    subtitle: "상태",
    commands: [
      { name: "APPLY_STRESS", description: "스트레스" },
      { name: "APPLY_RELAXATION", description: "이완" },
    ],
  },
  {
    title: "CONTROL COMMAND",
    subtitle: "명령 제어",
    commands: [
      { name: "CLEAR_EVENTS", description: "현재 이벤트 제거" },
      { name: "CLEAR_EVENT_LOGS", description: "이벤트 로그 목록 제거" },
      { name: "RESET_STATE", description: "상태 초기화" },
    ],
  },
];

export default function CommandHelpPanel() {
  return (
    <section className="help-panel surface-light">
      <div className="help-command-list">
        {COMMAND_GROUPS.map((group) => (
          <article className="help-command-group" key={group.title}>
            <h2 className="help-command-title">
              {group.title} <span>({group.subtitle})</span>
            </h2>

            <ul className="help-command-items">
              {group.commands.map((command) => (
                <li key={command.name}>
                  <strong>{command.name}:</strong>
                  <span>{command.description}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
