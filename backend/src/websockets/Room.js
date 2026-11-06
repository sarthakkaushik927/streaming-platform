const { Role } = require('./Participant.js');

class Room {
  constructor(id, hostId, initialVideoId = 'dQw4w9WgXcQ') {
    this.id = id;
    this.hostId = hostId;
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

  addParticipant(p) {
    this.participants.set(p.id, p);
  }

  removeParticipant(userId) {
    const p = this.participants.get(userId);
    if (p) {
      this.participants.delete(userId);
      this.removeChangeRequestsBy(userId);
      // Host reassignment trigger
      if (this.hostId === userId && this.participants.size > 0) {
        this.reassignHost();
      }
    }
    return p || null;
  }

  reassignHost() {
    // 1. Prioritize Moderators
    for (const p of this.participants.values()) {
      if (p.role === Role.MODERATOR) {
        this.hostId = p.id;
        p.updateRole(Role.HOST);
        return;
      }
    }
    // 2. Fallback to first participant
    const nextUser = this.participants.values().next().value;
    if (nextUser) {
      this.hostId = nextUser.id;
      nextUser.updateRole(Role.HOST);
    }
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
