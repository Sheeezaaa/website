// Web Audio API Sound Synthesizer for Authentic Quiz Sounds & Anti-Cheat Alarms
// Works 100% offline with zero external audio assets!

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// 1. Loud Warning Buzzer Alarm (Tab switch / cheating / infraction)
export const playAntiCheatBuzzer = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create 3 rapid sharp buzzer pulses
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Harsh buzzer sound
      osc.frequency.setValueAtTime(320, ctx.currentTime + i * 0.22);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + i * 0.22 + 0.18);

      gain.gain.setValueAtTime(0.65, ctx.currentTime + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.2);
    }
  } catch (err) {
    console.error('Buzzer sound error:', err);
  }
};

// 2. High-Urgency Disqualification Siren
export const playDisqualificationSiren = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    // Alternating two-tone siren
    for (let i = 0; i < 6; i++) {
      const time = ctx.currentTime + i * 0.15;
      const freq = i % 2 === 0 ? 880 : 587;
      osc.frequency.setValueAtTime(freq, time);
    }

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (err) {}
};

// 3. Quiz Buzzer Press (Round 4 Buzzer Sound)
export const playBuzzerPress = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch (err) {}
};

// 4. Positive Correct Answer Chime
export const playCorrectChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch (err) {}
};
