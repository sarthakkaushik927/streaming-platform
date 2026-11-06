const { DataTypes } = require('sequelize');
const db = require('../config/sequelize.js');

// Users the host removed from a room. They can't rejoin that room.
const RemovedParticipant = db.define('removed_participants', {
  roomId: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'room_id'
  },
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'user_id'
  }
}, {
  tableName: 'removed_participants',
  timestamps: true,
  createdAt: 'removed_at',
  updatedAt: false
});

module.exports = RemovedParticipant;
