export class SoundManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    this.currentlyPlaying = {};
    this.buffers = {};
    this.isMuted = false;
  }

  /**
   * Load a sound file
   * @param {string} id - Unique identifier for the sound
   * @param {string} url - URL to the sound file
   * @param {boolean} loop - Whether the sound should loop
   * @param {number} volume - Initial volume (0.0 to 1.0)
   */
  loadSound(id, url, loop = false, volume = 1.0, playbackRate = 1.0) {
    this.sounds[id] = {
      url: url,
      loop: loop,
      volume: volume,
      playbackRate: playbackRate,
      playing: false,
      buffer: null,
      source: null,
      gainNode: null,
    };

    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.context.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        this.sounds[id].buffer = audioBuffer;
        this.buffers[id] = audioBuffer;

        if (this.sounds[id].pendingPlay) {
          this.play(id);
          this.sounds[id].pendingPlay = false;
        }
      })
      .catch((error) => {
        console.error(`Error loading sound ${id}:`, error);
      });

    return this;
  }

  play(id, restart = false) {
    if (this.isMuted) return;
    const sound = this.sounds[id];
    if (!sound) return;

    if (sound.playing && !restart) {
      return;
    }

    if (sound.playing && restart) {
      this.stop(id);
    }

    if (!sound.buffer) {
      sound.pendingPlay = true;
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = sound.buffer;
    source.loop = sound.loop;

    if (sound.playbackRate !== undefined) {
      source.playbackRate.value = sound.playbackRate;
    }

    const gainNode = this.context.createGain();
    gainNode.gain.value = sound.volume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);

    sound.source = source;
    sound.gainNode = gainNode;
    sound.playing = true;
    sound.startTime = this.context.currentTime;
    
    if (!sound.loop) {
      source.onended = () => {
        sound.playing = false;
        sound.source = null;
        sound.gainNode = null;
      };
    }

    this.currentlyPlaying[id] = sound;
  }

  stop(id) {
    const sound = this.sounds[id];
    if (!sound || !sound.playing || !sound.source) return;

    sound.source.stop(0);
    sound.playing = false;
    sound.source = null;
    sound.gainNode = null;
    delete this.currentlyPlaying[id];
  }

  setVolume(id, volume) {
    const sound = this.sounds[id];
    if (!sound) return;

    sound.volume = Math.max(0, Math.min(1, volume));

    if (sound.playing && sound.gainNode) {
      sound.gainNode.gain.value = sound.volume;
    }
  }

  fadeVolume(id, targetVolume, duration) {
    const sound = this.sounds[id];
    if (!sound || !sound.playing || !sound.gainNode) return;

    const currentTime = this.context.currentTime;

    sound.volume = targetVolume;
    sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, currentTime);
    sound.gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      currentTime + duration
    );
  }

  setPlaybackRate(id, rate) {
    const sound = this.sounds[id];
    if (!sound) return;

    const safeRate = Math.max(0.1, rate);
    sound.playbackRate = safeRate;

    if (sound.playing && sound.source) {
      sound.source.playbackRate.value = safeRate;
    }

    return this;
  }

  fadePlaybackRate(id, targetRate, duration) {
    const sound = this.sounds[id];
    if (!sound || !sound.playing || !sound.source) return;

    const safeRate = Math.max(0.1, targetRate);
    const currentTime = this.context.currentTime;

    sound.source.playbackRate.setValueAtTime(
      sound.source.playbackRate.value,
      currentTime
    );
    sound.source.playbackRate.linearRampToValueAtTime(
      safeRate,
      currentTime + duration
    );
  }


  /**
   * Get current playback position of a sound
   * @param {string} id - Sound identifier
   * @returns {number} - Current playback position in seconds
   */
  getCurrentTime(id) {
    const sound = this.sounds[id];
    if (!sound || !sound.buffer || !sound.playing) return 0;

    const elapsed = this.context.currentTime - sound.startTime;

    if (sound.loop && sound.buffer.duration > 0) {
      return elapsed % sound.buffer.duration;
    }

    return Math.min(elapsed, sound.buffer.duration);
  }

  /**
   * Set playback position of a sound
   * @param {string} id - Sound identifier
   * @param {number} position - Position in seconds to start playback from
   * @param {boolean} playIfStopped - Whether to start playback if sound is stopped
   */
  seekTo(id, position, playIfStopped = true) {
    const sound = this.sounds[id];
    if (!sound || !sound.buffer) return;

    const duration = sound.buffer.duration;
    position = Math.max(0, Math.min(position, duration));

    if (sound.playing && sound.source) {
      sound.source.stop(0);
      sound.playing = false;
    }

    if (playIfStopped || sound.playing) {
      const source = this.context.createBufferSource();
      source.buffer = sound.buffer;
      source.loop = sound.loop;

      if (sound.playbackRate !== undefined) {
        source.playbackRate.value = sound.playbackRate;
      }

      const gainNode = this.context.createGain();
      gainNode.gain.value = sound.volume;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);

      source.start(0, position);

      sound.source = source;
      sound.gainNode = gainNode;
      sound.playing = true;
      sound.startTime = this.context.currentTime - position;

      if (!sound.loop) {
        source.onended = () => {
          sound.playing = false;
          sound.source = null;
          sound.gainNode = null;
        };
      }

      this.currentlyPlaying[id] = sound;
    }
  }

  /**
   * Pause a sound (stop but remember position)
   * @param {string} id - Sound identifier
   */
  pause(id) {
    const sound = this.sounds[id];
    if (!sound || !sound.playing || !sound.source) return;

    sound.pausedAt = this.getCurrentTime(id);

    sound.source.stop(0);
    sound.playing = false;
    sound.source = null;
    sound.gainNode = null;
    delete this.currentlyPlaying[id];
  }

  /**
   * Resume a paused sound
   * @param {string} id - Sound identifier
   */
  resume(id) {
    const sound = this.sounds[id];
    if (!sound || sound.playing) return;

    if (sound.pausedAt !== undefined) {
      this.seekTo(id, sound.pausedAt);
      sound.pausedAt = undefined;
    } else {
      this.play(id);
    }
  }
}
