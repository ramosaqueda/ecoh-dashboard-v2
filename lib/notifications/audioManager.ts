// /lib/notifications/audioManager.ts
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  async playNotificationSound() {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    try {
      // Crear un sonido simple usando Web Audio API
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configurar el sonido
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);

    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

export const audioManager = new AudioManager();
