const createError = require("../utils/createError");

function validateCharacterInput(req, res, next) {
  try {
    let { name, age, gender, height, weight } = req.body;

    if (
      name === undefined ||
      age === undefined ||
      gender === undefined ||
      height === undefined ||
      weight === undefined
    ) {
      throw createError(
        "이름, 나이, 성별, 키, 몸무게를 모두 입력하세요.",
        400,
        { code: "INVALID_CHARACTER_INPUT" }
      );
    }

    if (typeof name !== "string" || !name.trim()) {
      throw createError("이름은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_CHARACTER_NAME",
      });
    }

    if (typeof gender !== "string" || !gender.trim()) {
      throw createError("성별은 비어 있을 수 없습니다.", 400, {
        code: "INVALID_CHARACTER_GENDER",
      });
    }

    name = name.trim();
    gender = gender.trim().toLowerCase();

    const numericAge = Number(age);
    const numericHeight = Number(height);
    const numericWeight = Number(weight);

    if (
      !Number.isFinite(numericAge) ||
      !Number.isFinite(numericHeight) ||
      !Number.isFinite(numericWeight)
    ) {
      throw createError("나이, 키, 몸무게는 숫자여야 합니다.", 400, {
        code: "INVALID_CHARACTER_NUMERIC_FIELDS",
      });
    }

    if (numericAge <= 0 || numericHeight <= 0 || numericWeight <= 0) {
      throw createError("나이, 키, 몸무게는 0보다 커야 합니다.", 400, {
        code: "INVALID_CHARACTER_RANGE",
      });
    }

    if (!Number.isInteger(numericAge)) {
      throw createError("나이는 정수여야 합니다.", 400, {
        code: "INVALID_CHARACTER_AGE",
      });
    }

    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender)) {
      throw createError("올바른 성별 값을 입력하세요.", 400, {
        code: "INVALID_CHARACTER_GENDER_VALUE",
      });
    }

    req.body.name = name;
    req.body.age = numericAge;
    req.body.gender = gender;
    req.body.height = numericHeight;
    req.body.weight = numericWeight;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = validateCharacterInput;
