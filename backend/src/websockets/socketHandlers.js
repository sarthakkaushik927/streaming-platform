const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Room: DBRoom, Participant: DBParticipant, ChatMessage, PlaybackLog, RemovedParticipant } = require('../models');
const RoomManager = require('./RoomManager.js');
const { Participant, Role } = require('./Participant.js');
const logger = require('../utilities/logger.js');

const roomManager = RoomManager.getInstance();

const PlaybackAction = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  SEEK: 'SEEK',
  CHANGE_VIDEO: 'CHANGE_VIDEO'
};

const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED'
};

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const REMOVED_MESSAGE = 'You were removed from this room by the host.';
// The reason Socket.IO gives when a client disconnects on purpose, such as pressing Leave.
const INTENTIONAL_LEAVE = 'client namespace disconnect';
const RECONNECT_GRACE_MS = Number(process.env.RECONNECT_GRACE_MS) || 30000;

const isHostOrModerator = (participant) =>
  Boolean(participant) && (participant.role === Role.HOST || participant.role === Role.MODERATOR);

// Builds a pending request from client input, or returns null if the input is invalid.
const buildChangeRequest = ({ action, currentTime, videoId }, user) => {
  const request = {
    id: randomUUID(),
    requesterId: user.id,
    requesterName: user.username,
    action,
    createdAt: new Date().toISOString()
  };

  if (action === PlaybackAction.PLAY || action === PlaybackAction.PAUSE) return request;
  if (action === PlaybackAction.SEEK && Number.isFinite(currentTime) && currentTime >= 0) {
    return { ...request, currentTime };
  }
  if (action === PlaybackAction.CHANGE_VIDEO && typeof videoId === 'string' && YOUTUBE_ID_PATTERN.test(videoId)) {
    return { ...request, videoId };
  }
  return null;
};

/*
  broadcaster shares sync_state, chat and reactions across server instances (RedisBroadcaster).
  Membership and role events stay on the instance that owns the room's live state.
*/
const registerSocketHandlers = (io, broadcaster) => {
  // Single path for every playback change, whether made directly or approved from a request.
  const applyPlaybackChange = async (room, actor, { action, currentTime, videoId }, audience) => {
    const live = room.getLiveState();
    const nextVideoId = videoId || live.videoId;

    let nextTime = Number.isFinite(currentTime) ? currentTime : live.currentTime;
    let nextIsPlaying = live.isPlaying;
    if (action === PlaybackAction.PLAY) nextIsPlaying = true;
    if (action === PlaybackAction.PAUSE) nextIsPlaying = false;
    if (action === PlaybackAction.CHANGE_VIDEO) {
      nextTime = 0;
      nextIsPlaying = false;
    }

    room.updatePlayback(nextVideoId, nextTime, nextIsPlaying);

    audience.emit('sync_state', {
      isPlaying: nextIsPlaying,
      currentTime: nextTime,
      videoId: nextVideoId
    });

    await DBRoom.update(
      { currentPlaybackTime: nextTime, isPlaying: nextIsPlaying, currentVideoId: nextVideoId },
      { where: { id: room.id } }
    );

    await PlaybackLog.create({
      roomId: room.id,
      userId: actor.id,
      action,
      videoId: nextVideoId,
      actionTimestamp: nextTime
    });

    logger.info(`"socketHandlers.js","applyPlaybackChange","Room ${room.id}: ${action} at ${nextTime}s by ${actor.username}"`);
  };

  // Only the Host and Moderators see pending requests; everyone else gets an empty list.
  const syncChangeRequests = (room) => {
    const requests = room.getChangeRequests();
    for (const participant of room.participants.values()) {
      io.to(participant.socketId).emit('change_requests_updated', {
        requests: isHostOrModerator(participant) ? requests : []
      });
    }
  };

  const sendRequestStatus = (room, request, status) => {
    const requester = room.getParticipant(request.requesterId);
    if (!requester) return;
    io.to(requester.socketId).emit('change_request_status', {
      requestId: request.id,
      status,
      action: request.action,
      currentTime: request.currentTime,
      videoId: request.videoId
    });
  };

  // A user who can now control playback no longer needs their pending request.
  const cancelRequestsBy = (room, userId) => {
    room.removeChangeRequestsBy(userId).forEach((request) => {
      sendRequestStatus(room, request, RequestStatus.CANCELLED);
    });
  };

  /*
    Takes a user out of a room. If they held the host role, someone stands in.
    The room's saved host (the real host) does not change here, so the real host gets the role back
    when they return. A stand-in who leaves goes back to the role they had before standing in.
  */
  const removeFromRoom = async (room, user) => {
    const roomId = room.id;
    const wasHost = String(room.hostId) === String(user.id);
    const leavingStandIn = room.isStandIn(user.id) ? room.standIn : null;
    room.removeParticipant(user.id);
    const newHostId = room.hostId;

    if (leavingStandIn) {
      await DBParticipant.update({ role: leavingStandIn.previousRole }, { where: { roomId, userId: user.id } });
    }

    if (wasHost && newHostId && room.getParticipant(newHostId)) {
      await DBParticipant.update({ role: Role.HOST }, { where: { roomId, userId: newHostId } });

      logger.info(`"socketHandlers.js","disconnecting","User ID ${newHostId} stands in as host of room ${roomId} while ${user.username} is away"`);

      io.to(roomId).emit('role_assigned', {
        userId: newHostId,
        role: Role.HOST,
        participants: Array.from(room.participants.values())
      });

      cancelRequestsBy(room, newHostId);
    }

    await DBParticipant.update({ status: 'DISCONNECTED' }, { where: { roomId, userId: user.id } });

    logger.info(`"socketHandlers.js","disconnect","User ${user.username} left room ${roomId}"`);

    io.to(roomId).emit('participants_updated', {
      participants: Array.from(room.participants.values())
    });

    syncChangeRequests(room);
  };

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required.'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication failed. User not found.'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      logger.error(`"socketHandlers.js","io.use()","Socket authentication error: ${err.message}"`);
      return next(new Error('Unauthorized socket connection.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`"socketHandlers.js","connection","User connected to WebSocket: ${user.username} (${user.id})"`);

    // Event: Join Room
    socket.on('join_room', async ({ roomId }) => {
      try {
        let room = roomManager.getRoom(roomId);
        
        // If room is not initialized in-memory, fetch from PostgreSQL
        if (!room) {
          const dbRoom = await DBRoom.findByPk(roomId);
          if (!dbRoom) {
            socket.emit('error_event', { message: 'Watch room does not exist.' });
            return;
          }
          room = roomManager.createRoom(roomId, dbRoom.hostId, dbRoom.currentVideoId);
          room.playbackState.currentTime = dbRoom.currentPlaybackTime;
          room.playbackState.isPlaying = dbRoom.isPlaying;
        }

        const wasRemoved = await RemovedParticipant.findOne({ where: { roomId, userId: user.id } });
        if (wasRemoved) {
          socket.emit('kicked', { message: REMOVED_MESSAGE });
          return;
        }

        socket.join(roomId);
        socket.roomId = roomId;

        // Determine or assign participant role
        let role = Role.PARTICIPANT;
        let returnedStandIn = null;
        if (room.isOwner(user.id)) {
          // The real host is back: they take the role back from whoever was standing in.
          role = Role.HOST;
          returnedStandIn = room.returnHostToOwner();
          if (returnedStandIn) {
            await DBParticipant.update({ role: returnedStandIn.role }, { where: { roomId, userId: returnedStandIn.userId } });
            cancelRequestsBy(room, user.id);
          }
        } else if (String(room.hostId) === String(user.id)) {
          // A stand-in host reconnecting while the real host is still away.
          role = Role.HOST;
        } else {
          // Check if there is an existing role in the database
          const existingParticipant = await DBParticipant.findOne({
            where: { roomId, userId: user.id }
          });
          if (existingParticipant) {
            // Only the real host or the current stand-in can be host; an old saved HOST row is out of date.
            role = existingParticipant.role === Role.HOST ? Role.PARTICIPANT : existingParticipant.role;
          } else {
            // Persist new participant. A page load can send two joins at once, so ignore a duplicate row.
            await DBParticipant.bulkCreate(
              [{ roomId, userId: user.id, role: Role.PARTICIPANT, status: 'ACTIVE' }],
              { ignoreDuplicates: true }
            );
          }
        }

        const participant = new Participant(user.id, socket.id, user.username, role);
        room.addParticipant(participant);

        // Notify DB that participant is ACTIVE
        await DBParticipant.update(
          { status: 'ACTIVE', role },
          { where: { roomId, userId: user.id } }
        );

        logger.info(`"socketHandlers.js","join_room","User ${user.username} joined room ${roomId} as ${role}"`);

        if (returnedStandIn) {
          logger.info(`"socketHandlers.js","join_room","Room ${roomId}: host ${user.username} returned; User ID ${returnedStandIn.userId} is ${returnedStandIn.role} again"`);
          io.to(roomId).emit('role_assigned', {
            userId: user.id,
            role: Role.HOST,
            participants: Array.from(room.participants.values())
          });
        }

        // Send initial state back to user
        socket.emit('user_joined', {
          userId: user.id,
          role,
          playbackState: room.getLiveState(),
          participants: Array.from(room.participants.values())
        });

        // Broadcast updated participants list to everyone in room
        io.to(roomId).emit('participants_updated', {
          participants: Array.from(room.participants.values())
        });

        syncChangeRequests(room);
      } catch (error) {
        logger.error(`"socketHandlers.js","join_room","Error: ${error.message}"`);
        socket.emit('error_event', { message: 'Failed to join room.' });
      }
    });

    // Event: Play/Pause synchronization
    socket.on('play_state_change', async ({ isPlaying, currentTime, videoId }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        const room = roomManager.getRoom(roomId);
        if (!room) return;

        if (!isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only Host or Moderator can change playback.' });
          return;
        }

        const action = isPlaying ? PlaybackAction.PLAY : PlaybackAction.PAUSE;
        await applyPlaybackChange(room, user, { action, currentTime, videoId }, broadcaster.toRoom(roomId, socket.id));
      } catch (error) {
        logger.error(`"socketHandlers.js","play_state_change","Error: ${error.message}"`);
      }
    });

    // Event: Seek synchronization
    socket.on('seek', async ({ currentTime, videoId }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        const room = roomManager.getRoom(roomId);
        if (!room) return;

        if (!isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only Host or Moderator can seek.' });
          return;
        }

        await applyPlaybackChange(room, user, { action: PlaybackAction.SEEK, currentTime, videoId }, broadcaster.toRoom(roomId, socket.id));
      } catch (error) {
        logger.error(`"socketHandlers.js","seek","Error: ${error.message}"`);
      }
    });

    // Event: Change YouTube Video
    socket.on('change_video', async ({ videoId }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        const room = roomManager.getRoom(roomId);
        if (!room) return;

        if (!isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only Host or Moderator can change videos.' });
          return;
        }

        await applyPlaybackChange(room, user, { action: PlaybackAction.CHANGE_VIDEO, videoId }, broadcaster.toRoom(roomId));
      } catch (error) {
        logger.error(`"socketHandlers.js","change_video","Error: ${error.message}"`);
      }
    });

    // Event: Participant asks the Host or a Moderator to approve a playback change
    socket.on('request_change', (payload) => {
      try {
        const room = roomManager.getRoom(socket.roomId);
        if (!room) return;

        const participant = room.getParticipant(user.id);
        if (!participant) return;

        if (isHostOrModerator(participant)) {
          socket.emit('error_event', { message: 'You can already control playback directly.' });
          return;
        }

        const request = buildChangeRequest(payload || {}, user);
        if (!request) {
          socket.emit('error_event', { message: 'That change request is not valid.' });
          return;
        }

        room.addChangeRequest(request);
        sendRequestStatus(room, request, RequestStatus.PENDING);
        syncChangeRequests(room);

        logger.info(`"socketHandlers.js","request_change","Room ${room.id}: ${user.username} requested ${request.action}"`);
      } catch (error) {
        logger.error(`"socketHandlers.js","request_change","Error: ${error.message}"`);
      }
    });

    // Event: Host or Moderator approves or declines a pending request
    socket.on('review_change', async ({ requestId, approved }) => {
      try {
        const room = roomManager.getRoom(socket.roomId);
        if (!room) return;

        if (!isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only Host or Moderator can review requests.' });
          return;
        }

        const request = room.takeChangeRequest(requestId);
        if (!request) {
          socket.emit('error_event', { message: 'That request has already been handled.' });
          return;
        }

        sendRequestStatus(room, request, approved === true ? RequestStatus.APPROVED : RequestStatus.DECLINED);
        syncChangeRequests(room);

        if (approved === true) {
          await applyPlaybackChange(room, user, request, broadcaster.toRoom(room.id));
        }

        logger.info(`"socketHandlers.js","review_change","Room ${room.id}: ${user.username} ${approved === true ? 'approved' : 'declined'} ${request.action} from ${request.requesterName}"`);
      } catch (error) {
        logger.error(`"socketHandlers.js","review_change","Error: ${error.message}"`);
      }
    });

    // Event: Assign Role (Host or Moderator)
    socket.on('assign_role', async ({ targetUserId, newRole }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        const room = roomManager.getRoom(roomId);
        if (!room || !isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only the Host or a Moderator can assign roles.' });
          return;
        }

        if (targetUserId === user.id) {
          socket.emit('error_event', { message: 'You cannot change your own role.' });
          return;
        }

        const targetParticipant = room.getParticipant(targetUserId);
        if (!targetParticipant) {
          socket.emit('error_event', { message: 'Participant not found in active session.' });
          return;
        }

        if (targetParticipant.role === Role.HOST) {
          socket.emit('error_event', { message: 'The Host cannot be demoted.' });
          return;
        }

        if (newRole === Role.HOST) {
          socket.emit('error_event', { message: 'To transfer ownership, please perform a Host Transfer.' });
          return;
        }

        if (newRole !== Role.MODERATOR && newRole !== Role.PARTICIPANT) {
          socket.emit('error_event', { message: 'That role is not valid.' });
          return;
        }

        targetParticipant.updateRole(newRole);

        // Persist role in DB
        await DBParticipant.update(
          { role: newRole },
          { where: { roomId, userId: targetUserId } }
        );

        logger.info(`"socketHandlers.js","assign_role","Room ${roomId}: Host assigned ${newRole} to User ID ${targetUserId}"`);

        // Emit update to everyone
        io.to(roomId).emit('role_assigned', {
          userId: targetUserId,
          role: newRole,
          participants: Array.from(room.participants.values())
        });

        if (isHostOrModerator(targetParticipant)) cancelRequestsBy(room, targetUserId);
        syncChangeRequests(room);
      } catch (error) {
        logger.error(`"socketHandlers.js","assign_role","Error: ${error.message}"`);
      }
    });

    // Event: Transfer Host (Host only)
    socket.on('transfer_host', async ({ targetUserId }) => {
      try {
        // Debug: log immediately to ensure event reached the backend
        logger.info(`"socketHandlers.js","transfer_host","DEBUG Event Received! targetUserId=${targetUserId} socket.roomId=${socket.roomId} socket.id=${socket.id}"`);

        const roomId = socket.roomId;
        if (!roomId) {
          logger.warn(`"socketHandlers.js","transfer_host","WARNING: socket.roomId is undefined! The user hasn't joined a room yet."`);
          socket.emit('error_event', { message: 'You must be in a room to do this.' });
          return;
        }

        const room = roomManager.getRoom(roomId);

        logger.info(`"socketHandlers.js","transfer_host","DEBUG roomId=${roomId} room.hostId=${room?.hostId} (type:${typeof room?.hostId}) user.id=${user.id} (type:${typeof user.id}) targetUserId=${targetUserId} (type:${typeof targetUserId})"`);

        // Normalize to string for safe comparison (Sequelize may return int vs string)
        if (!room || String(room.hostId) !== String(user.id)) {
          socket.emit('error_event', { message: 'Permission Denied: Only the current Host can transfer ownership.' });
          return;
        }

        if (String(targetUserId) === String(user.id)) {
          socket.emit('error_event', { message: 'You cannot transfer host ownership to yourself.' });
          return;
        }

        // Normalize targetUserId to match the Map key type
        const normalizedTargetId = [...room.participants.keys()].find(
          (key) => String(key) === String(targetUserId)
        );

        if (!normalizedTargetId) {
          socket.emit('error_event', { message: 'Participant not found in active session.' });
          return;
        }

        const targetParticipant = room.getParticipant(normalizedTargetId);
        if (!targetParticipant) {
          socket.emit('error_event', { message: 'Participant not found in active session.' });
          return;
        }

        // Demote current host → PARTICIPANT in-memory
        const normalizedCurrentId = [...room.participants.keys()].find(
          (key) => String(key) === String(user.id)
        );
        const currentHost = normalizedCurrentId ? room.getParticipant(normalizedCurrentId) : null;
        if (currentHost) currentHost.updateRole(Role.PARTICIPANT);

        // Promote target → HOST in-memory. A transfer makes them the real host, so they get it back after leaving too.
        targetParticipant.updateRole(Role.HOST);
        room.transferHost(normalizedTargetId);

        // Persist both role changes and new hostId to DB
        await DBRoom.update(
          { hostId: normalizedTargetId },
          { where: { id: roomId } }
        );
        await DBParticipant.update(
          { role: Role.PARTICIPANT },
          { where: { roomId, userId: user.id } }
        );
        await DBParticipant.update(
          { role: Role.HOST },
          { where: { roomId, userId: normalizedTargetId } }
        );

        logger.info(`"socketHandlers.js","transfer_host","Room ${roomId}: Host transferred from User ${user.username} (${user.id}) to User ID ${normalizedTargetId}"`);

        // Broadcast the host change to everyone in the room
        io.to(roomId).emit('host_transferred', {
          newHostId: normalizedTargetId,
          previousHostId: user.id,
          participants: Array.from(room.participants.values())
        });

        cancelRequestsBy(room, normalizedTargetId);
        syncChangeRequests(room);
      } catch (error) {
        logger.error(`"socketHandlers.js","transfer_host","Error: ${error.message}"`);
      }
    });

    // Event: Remove Participant (Host or Moderator)
    socket.on('remove_participant', async ({ targetUserId }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        const room = roomManager.getRoom(roomId);
        if (!room || !isHostOrModerator(room.getParticipant(user.id))) {
          socket.emit('error_event', { message: 'Permission Denied: Only the Host or a Moderator can remove participants.' });
          return;
        }

        if (targetUserId === user.id) {
          socket.emit('error_event', { message: 'You cannot remove yourself. Leave the room instead.' });
          return;
        }

        const targetParticipant = room.getParticipant(targetUserId);
        if (!targetParticipant) return;

        if (targetParticipant.role === Role.HOST) {
          socket.emit('error_event', { message: 'The Host cannot be removed.' });
          return;
        }

        room.removeParticipant(targetUserId);

        // Persist the removal so the user can't rejoin, including after a server restart
        await RemovedParticipant.findOrCreate({ where: { roomId, userId: targetUserId } });
        await DBParticipant.update(
          { status: 'DISCONNECTED' },
          { where: { roomId, userId: targetUserId } }
        );

        // Notify client and take their socket out of the room so it can't send further events
        io.to(targetParticipant.socketId).emit('kicked', { message: REMOVED_MESSAGE });
        const targetSocket = io.sockets.sockets.get(targetParticipant.socketId);
        if (targetSocket) {
          targetSocket.leave(roomId);
          targetSocket.roomId = null;
        }

        logger.info(`"socketHandlers.js","remove_participant","Room ${roomId}: Host kicked User ID ${targetUserId}"`);

        // Broadcast new participant list
        io.to(roomId).emit('participant_removed', {
          userId: targetUserId,
          participants: Array.from(room.participants.values())
        });

        syncChangeRequests(room);
      } catch (error) {
        logger.error(`"socketHandlers.js","remove_participant","Error: ${error.message}"`);
      }
    });

    // Event: Reaction (Ephemeral)
    socket.on('reaction', ({ emoji, userId, username }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;
        const reactionPayload = {
          emoji,
          userId,
          username,
          roomId
        };
        broadcaster.toRoom(roomId).emit('reaction', reactionPayload);
      } catch (error) {
        logger.error(`"socketHandlers.js","reaction","Error: ${error.message}"`);
      }
    });

    // Event: Chat message
    socket.on('send_chat', async ({ message }) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        // Save message to PostgreSQL
        const chatRecord = await ChatMessage.create({
          roomId,
          userId: user.id,
          message
        });

        const chatPayload = {
          id: chatRecord.id,
          message: chatRecord.message,
          created_at: chatRecord.created_at,
          user: {
            id: user.id,
            username: user.username
          }
        };

        // Broadcast chat event to all clients in the room
        broadcaster.toRoom(roomId).emit('chat_message', chatPayload);
      } catch (error) {
        logger.error(`"socketHandlers.js","send_chat","Error: ${error.message}"`);
      }
    });

    // Event: Disconnecting (Lifecycle cleanup)
    socket.on('disconnecting', (reason) => {
      for (const roomId of socket.rooms) {
        // Exclude the user's private socket room ID
        if (roomId === socket.id) continue;

        const room = roomManager.getRoom(roomId);
        if (!room) continue;

        // The user may already be back on a newer connection, so only their current one counts.
        const isCurrentConnection = () => room.getParticipant(user.id)?.socketId === socket.id;
        if (!isCurrentConnection()) continue;

        const remove = () => removeFromRoom(room, user).catch((error) => {
          logger.error(`"socketHandlers.js","disconnecting","Error: ${error.message}"`);
        });

        if (reason === INTENTIONAL_LEAVE) {
          remove();
          continue;
        }

        // Connection lost: keep their place and role while they have time to reconnect.
        setTimeout(() => {
          if (isCurrentConnection()) remove();
        }, RECONNECT_GRACE_MS).unref();
      }
    });
  });
};

module.exports = registerSocketHandlers;
