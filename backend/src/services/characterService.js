const dbQuery = require("../utils/dbQuery");
const createError = require("../utils/createError");
const { logSecurityEvent } = require("./securityEventService");

function parseCharacterId(idParam) {
  const characterId = Number(idParam);
  return Number.isInteger(characterId) && characterId > 0 ? characterId : null;
}

async function createCharacter({
  userId,
  name,
  age,
  gender,
  height,
  weight,
  ipAddress,
}) {
  const insertCharacterSql = `
    INSERT INTO characters (user_id, name, age, gender, height, weight)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await dbQuery(insertCharacterSql, [
    userId,
    name,
    age,
    gender,
    height,
    weight,
  ]);

  await logSecurityEvent({
    userId,
    eventType: "CHARACTER_CREATED",
    targetType: "character",
    targetId: result.insertId,
    description: `캐릭터 생성: ${name}`,
    ipAddress,
  });

  return {
    message: "캐릭터 생성에 성공했습니다.",
    characterId: result.insertId,
  };
}

async function getMyCharacters({ userId }) {
  const getCharactersSql = `
    SELECT id, name, age, gender, height, weight, created_at
    FROM characters
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  const results = await dbQuery(getCharactersSql, [userId]);

  return {
    message: "캐릭터 조회에 성공했습니다.",
    characters: results,
  };
}

async function getCharacterById({ userId, characterId }) {
  const parsedCharacterId = parseCharacterId(characterId);

  if (!parsedCharacterId) {
    throw createError("유효하지 않은 캐릭터 ID입니다.", 400);
  }

  const getCharacterSql = `
    SELECT id, name, age, gender, height, weight, created_at
    FROM characters
    WHERE id = ? AND user_id = ?
  `;

  const results = await dbQuery(getCharacterSql, [parsedCharacterId, userId]);

  if (results.length === 0) {
    throw createError("캐릭터를 찾을 수 없습니다.", 404);
  }

  return {
    message: "캐릭터 조회에 성공했습니다.",
    character: results[0],
  };
}

async function updateCharacter({
  userId,
  characterId,
  name,
  age,
  gender,
  height,
  weight,
  ipAddress,
}) {
  const parsedCharacterId = parseCharacterId(characterId);

  if (!parsedCharacterId) {
    throw createError("유효하지 않은 캐릭터 ID입니다.", 400);
  }

  const updateCharacterSql = `
    UPDATE characters
    SET name = ?, age = ?, gender = ?, height = ?, weight = ?
    WHERE id = ? AND user_id = ?
  `;

  const result = await dbQuery(updateCharacterSql, [
    name,
    age,
    gender,
    height,
    weight,
    parsedCharacterId,
    userId,
  ]);

  if (result.affectedRows === 0) {
    throw createError("수정할 캐릭터를 찾을 수 없습니다.", 404);
  }

  await logSecurityEvent({
    userId,
    eventType: "CHARACTER_UPDATED",
    targetType: "character",
    targetId: parsedCharacterId,
    description: `캐릭터 수정: ${name}`,
    ipAddress,
  });

  return {
    message: "캐릭터가 성공적으로 수정되었습니다.",
  };
}

async function deleteCharacter({ userId, characterId, ipAddress }) {
  const parsedCharacterId = parseCharacterId(characterId);

  if (!parsedCharacterId) {
    throw createError("유효하지 않은 캐릭터 ID입니다.", 400);
  }

  const findCharacterSql = `
    SELECT name
    FROM characters
    WHERE id = ? AND user_id = ?
  `;

  const found = await dbQuery(findCharacterSql, [parsedCharacterId, userId]);

  const deleteCharacterSql = `
    DELETE FROM characters
    WHERE id = ? AND user_id = ?
  `;

  const result = await dbQuery(deleteCharacterSql, [parsedCharacterId, userId]);

  if (result.affectedRows === 0) {
    throw createError("삭제할 캐릭터를 찾을 수 없습니다.", 404);
  }

  await logSecurityEvent({
    userId,
    eventType: "CHARACTER_DELETED",
    targetType: "character",
    targetId: parsedCharacterId,
    description: `캐릭터 삭제: ${found[0]?.name || parsedCharacterId}`,
    ipAddress,
  });

  return {
    message: "캐릭터가 성공적으로 삭제되었습니다.",
  };
}

module.exports = {
  createCharacter,
  getMyCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
};
