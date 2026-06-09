export const commandMessages = {
  APPLY_FLUID: "수액 투여가 적용되었습니다.",
  APPLY_BLEEDING: "출혈 상태가 적용되었습니다.",
  APPLY_VASODILATION: "혈관 확장이 적용되었습니다.",
  APPLY_VASOCONSTRICTION: "혈관 수축이 적용되었습니다.",
  APPLY_OXYGEN: "산소 공급이 적용되었습니다.",
  APPLY_HYPOXIA: "산소 부족 상태가 적용되었습니다.",
  APPLY_HYPERVENTILATION: "과호흡 상태가 적용되었습니다.",
  APPLY_HYPOVENTILATION: "저호흡 상태가 적용되었습니다.",
  APPLY_COLD: "저체온 상태가 적용되었습니다.",
  APPLY_HEAT: "고체온 상태가 적용되었습니다.",
  APPLY_ACTIVITY: "활동 증가가 적용되었습니다.",
  APPLY_REST: "휴식 상태가 적용되었습니다.",
  APPLY_METABOLISM_UP: "대사 증가가 적용되었습니다.",
  APPLY_METABOLISM_DOWN: "대사 감소가 적용되었습니다.",
  APPLY_STRESS: "스트레스 상태가 적용되었습니다.",
  APPLY_RELAXATION: "이완 상태가 적용되었습니다.",
};

export function parseCommandInput(input) {
  const [rawCommand, rawLevel] = input.trim().split(/\s+/);
  const commandName = rawCommand?.toUpperCase() || "";

  if (!rawLevel) {
    return { commandName, level: 1 };
  }

  const level = Number(rawLevel);
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return {
      commandName,
      level: 1,
      error: "레벨은 1~3 사이의 숫자로 입력해 주세요.",
    };
  }

  return { commandName, level };
}
