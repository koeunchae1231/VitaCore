const characterService = require("../services/characterService");

async function createCharacter(req, res, next) {
  try {
    const result = await characterService.createCharacter({
      userId: req.user.userId,
      ...req.body,
      ipAddress: req.ip,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyCharacters(req, res, next) {
  try {
    const result = await characterService.getMyCharacters({
      userId: req.user.userId,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getCharacterById(req, res, next) {
  try {
    const result = await characterService.getCharacterById({
      userId: req.user.userId,
      characterId: req.params.id,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateCharacter(req, res, next) {
  try {
    const result = await characterService.updateCharacter({
      userId: req.user.userId,
      characterId: req.params.id,
      ...req.body,
      ipAddress: req.ip,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteCharacter(req, res, next) {
  try {
    const result = await characterService.deleteCharacter({
      userId: req.user.userId,
      characterId: req.params.id,
      ipAddress: req.ip,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCharacter,
  getMyCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
};