/**
 * Utility functions for playing sound effects
 * Single responsibility: Generate audio feedback for user actions
 */
export const soundEffects = {
  /**
   * Play success sound (two-tone chime)
   */
  playSuccess(): void {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // More pleasant success sound (two-tone chime)
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      // Second tone for chime effect
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        oscillator2.type = "sine";
        gainNode2.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15
        );
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.15);
      }, 100);
    } catch (err) {
      // Audio context might not be available, ignore
      console.warn("Could not play sound:", err);
    }
  },

  /**
   * Play error sound (lower, harsher tone)
   */
  playError(): void {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Lower, harsher tone for error
      oscillator.frequency.value = 400;
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.warn("Could not play error sound:", err);
    }
  },
};
