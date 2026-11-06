const { Role } = require('./Participant.js');

/*
  Two ideas of "host" live here:
  - ownerId is the real host. It is saved on the room and only changes when the host role is transferred.
  - hostId is whoever holds the host role right now. While the real host is away, a stand-in covers
    (a moderator first, otherwise the first participant), and standIn remembers the role to give them back.
  When the real host returns, they take the role back and the stand-in returns to their old role.
*/
class Room {
  constructor(id, ownerId, initialVideoId = 'dQw4w9WgXcQ') {
    this.id = id;
    this.ownerId = ownerId;
    this.hostId = ownerId;
    this.standIn = null; // { userId, previousRole } while someone covers for the real host
    this.participants = new Map(); // Key: userId, Value: Participant
    this.changeRequests = new Map(); // Key: requestId, Value: pending playback change request
    this.createdAt = new Date();
    this.playbackState = {
      videoId: initialVideoId,
      currentTime: 0,
      isPlaying: false,
      lastUpdated: new Date()
    };
  }

  isOwner(userId) {
    return String(this.ownerId) === String(userId);
  }

  isStandIn(userId) {
    return Boolean(this.standIn) && String(this.standIn.userId) === String(userId);
  }

  addParticipant(p) {
    this.participants.set(p.id, p);
  }

  removeParticipant(userId) {
    const p = this.participants.get(userId);
    if (p) {
      this.participants.delete(userId);
      this.removeChangeRequestsBy(userId);
      if (String(this.hostId) === String(userId)) {
        if (this.isStandIn(userId)) this.standIn = null;
        if (this.participants.size > 0) this.reassignHost();
        else this.resetToOwner();
      }
    }
    return p || null;
  }

  // Someone covers while the real host is away: a moderator first, otherwise the first participant.
  reassignHost() {
    const participants = Array.from(this.participants.values());
    const next = participants.find((p) => p.role === Role.MODERATOR) || participants[0];
    if (!next) return;
    this.standIn = { userId: next.id, previousRole: next.role };
    this.hostId = next.id;
    next.updateRole(Role.HOST);
  }

  // An empty room waits for its real host.
  resetToOwner() {
    this.hostId = this.ownerId;
    this.standIn = null;
  }

  /*
    The real host is back. Returns the stand-in and the role they went back to, or null if nobody was covering,
    so the caller can save it.
  */
  returnHostToOwner() {
    const standIn = this.standIn;
    this.hostId = this.ownerId;
    this.standIn = null;
    if (!standIn) return null;
    const participant = this.participants.get(standIn.userId);
    if (participant) participant.updateRole(standIn.previousRole);
    return { userId: standIn.userId, role: standIn.previousRole };
  }

  // A deliberate handover: the new host becomes the real host, so the same rules protect them.
  transferHost(newHostId) {
    this.ownerId = newHostId;
    this.hostId = newHostId;
    this.standIn = null;
  }

  getParticipant(userId) {
    return this.participants.get(userId);
  }

  updatePlayback(videoId, currentTime, isPlaying) {
    this.playbackState.videoId = videoId;
    this.playbackState.currentTime = currentTime;
    this.playbackState.isPlaying = isPlaying;
    this.playbackState.lastUpdated = new Date();
  }

  // Playback state at this moment: while playing, the stored time is only correct as of lastUpdated.
  getLiveState() {
    const { isPlaying, currentTime, lastUpdated } = this.playbackState;
    const elapsedSeconds = isPlaying ? (Date.now() - lastUpdated.getTime()) / 1000 : 0;
    return { ...this.playbackState, currentTime: currentTime + elapsedSeconds };
  }

  // Each user has at most one pending request; a new one replaces the old one.
  addChangeRequest(request) {
    this.removeChangeRequestsBy(request.requesterId);
    this.changeRequests.set(request.id, request);
  }

  // Removes and returns a request, so two reviewers can't both act on it.
  takeChangeRequest(requestId) {
    const request = this.changeRequests.get(requestId);
    this.changeRequests.delete(requestId);
    return request || null;
  }

  removeChangeRequestsBy(userId) {
    const removed = this.getChangeRequests().filter((r) => r.requesterId === userId);
    removed.forEach((r) => this.changeRequests.delete(r.id));
    return removed;
  }

  getChangeRequests() {
    return Array.from(this.changeRequests.values());
  }
}

module.exports = Room;
