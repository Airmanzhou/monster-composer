/**
 * Sound for the creature.
 *
 * The AudioContext is created lazily inside a user gesture - browsers refuse
 * to start audio before one. When Web Audio or speech synthesis is missing the
 * module degrades to silence instead of throwing.
 */

const PHRASES = [
  "grrr... oh",
  "krrr-ack",
  "eee... hmm",
  "ugh hrm",
  "woof... no",
  "mm-hmm",
];

export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;
  let webAudioAvailable = true;
  let speechAvailable =
    typeof window !== "undefined" && "speechSynthesis" in window;

  function ensure() {
    if (context) {
      if (context.state === "suspended") context.resume();
      return context;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      webAudioAvailable = false;
      return null;
    }
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0.85;
    master.connect(context.destination);
    return context;
  }

  /** A two-stage lub-dub heartbeat. */
  function beat(intensity) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const stage = (delay, from, to, gain) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(from, now + delay);
      osc.frequency.exponentialRampToValueAtTime(to, now + delay + 0.12);
      env.gain.setValueAtTime(0.0001, now + delay);
      env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + delay + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.16);
      osc.connect(env);
      env.connect(master);
      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    };

    stage(0, 66, 38, 0.5 * intensity);
    stage(0.13, 54, 32, 0.34 * intensity);
  }

  /** A filtered noise burst that swells and fades like a breath. */
  function breath(intensity) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const length = Math.floor(ctx.sampleRate * 0.9);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.8;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.16 * intensity), now + 0.25);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    source.connect(filter);
    filter.connect(env);
    env.connect(master);
    source.start(now);
  }

  /** A short guttural syllable through the platform speech synthesiser. */
  function speak(intensity) {
    if (muted || !speechAvailable) return;
    try {
      const utterance = new SpeechSynthesisUtterance(
        PHRASES[Math.floor(Math.random() * PHRASES.length)],
      );
      utterance.pitch = 0.4 + intensity * 0.8;
      utterance.rate = 0.7 + intensity * 0.5;
      utterance.volume = 0.35 + intensity * 0.4;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      speechAvailable = false;
    }
  }

  function setMuted(value) {
    muted = value;
    if (muted && speechAvailable) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        speechAvailable = false;
      }
    }
  }

  return {
    ensure,
    beat,
    breath,
    speak,
    setMuted,
    get muted() {
      return muted;
    },
    get webAudioAvailable() {
      return webAudioAvailable;
    },
    get speechAvailable() {
      return speechAvailable;
    },
  };
}
