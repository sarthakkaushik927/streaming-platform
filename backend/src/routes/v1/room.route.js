const express = require('express');
const roomController = require('../../controllers/roomController.js');
const authMiddleware = require('../../middlewares/auth.js');
const { createRoomValidation } = require('../../validations/room.validation.js');
const { standardLimiter } = require('../../middlewares/rateLimiter.js');

const router = express.Router();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.param('roomId', (req, res, next, roomId) => {
  if (!UUID_PATTERN.test(roomId)) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }
  next();
});

router.use(standardLimiter);

router.post('/', authMiddleware, createRoomValidation, roomController.create);
router.get('/', authMiddleware, roomController.list);
router.get('/:roomId', authMiddleware, roomController.getDetails);
router.get('/:roomId/chat', authMiddleware, roomController.getChatHistory);
router.get('/:roomId/logs', authMiddleware, roomController.getPlaybackLogs);
router.delete('/:roomId', authMiddleware, roomController.remove);

module.exports = router;
