const { randomUUID } = require('crypto');
const { createClient } = require('redis');
const logger = require('../utilities/logger.js');

const CHANNEL = 'syncstream:room-events';

/*
  Shares room broadcasts between server instances with Redis Pub/Sub.

  Each instance only holds its own users' connections. When one instance broadcasts to a room, it sends to
  its own users directly and publishes the event on a Redis channel. Every other instance is subscribed to
  that channel and delivers the event to its own users in that room. Each message carries the sender's
  instance ID, so an instance ignores its own messages instead of delivering them twice.

  Redis is optional: without REDIS_URL, or if Redis can't be reached at startup, broadcasts stay on this
  instance, which is all a single server needs.
*/
class RedisBroadcaster {
  constructor(io) {
    this.io = io;
    this.instanceId = randomUUID();
    this.publisher = null;
    this.subscriber = null;
  }

  get isShared() {
    return this.publisher !== null;
  }

  async start(url = process.env.REDIS_URL) {
    if (!url) {
      logger.info('"RedisBroadcaster.js","start","REDIS_URL not set: running as a single instance"');
      return false;
    }

    const publisher = createClient({ url });
    const subscriber = publisher.duplicate();
    // Without listeners, a dropped Redis connection would crash the process; log it and let the client reconnect.
    publisher.on('error', (err) => logger.error(`"RedisBroadcaster.js","publisher","${err.message}"`));
    subscriber.on('error', (err) => logger.error(`"RedisBroadcaster.js","subscriber","${err.message}"`));

    try {
      await Promise.all([publisher.connect(), subscriber.connect()]);
      await subscriber.subscribe(CHANNEL, (raw) => this.deliverFromOtherInstance(raw));
      this.publisher = publisher;
      this.subscriber = subscriber;
      logger.info('"RedisBroadcaster.js","start","Connected to Redis: room broadcasts are shared across instances"');
      return true;
    } catch (err) {
      logger.error(`"RedisBroadcaster.js","start","Could not connect to Redis, running as a single instance: ${err.message}"`);
      await Promise.allSettled([publisher.disconnect(), subscriber.disconnect()]);
      return false;
    }
  }

  /*
    Sends an event to everyone in a room, on every instance.
    exceptSocketId leaves out the sender's own socket, for events the sender already applied themselves.
  */
  toRoom(roomId, exceptSocketId = null) {
    return {
      emit: (event, payload) => {
        const local = exceptSocketId ? this.io.to(roomId).except(exceptSocketId) : this.io.to(roomId);
        local.emit(event, payload);
        this.publish(roomId, event, payload);
      },
    };
  }

  publish(roomId, event, payload) {
    if (!this.publisher) return;
    const message = JSON.stringify({ origin: this.instanceId, roomId, event, payload });
    this.publisher.publish(CHANNEL, message).catch((err) => {
      logger.error(`"RedisBroadcaster.js","publish","${err.message}"`);
    });
  }

  deliverFromOtherInstance(raw) {
    try {
      const { origin, roomId, event, payload } = JSON.parse(raw);
      if (origin === this.instanceId) return;
      // local: deliver only to this instance's users, never publish again.
      this.io.to(roomId).local.emit(event, payload);
    } catch (err) {
      logger.error(`"RedisBroadcaster.js","deliverFromOtherInstance","Bad message: ${err.message}"`);
    }
  }

  async stop() {
    await Promise.allSettled([this.subscriber?.quit(), this.publisher?.quit()]);
    this.publisher = null;
    this.subscriber = null;
  }
}

module.exports = RedisBroadcaster;
