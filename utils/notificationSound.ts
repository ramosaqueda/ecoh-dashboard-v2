// utils/notificationSound.ts

class NotificationSoundManager {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private lastPlayTime: number = 0;
  private readonly MIN_INTERVAL = 1000; // Minimum 1 second between sounds

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    try {
      this.audio = new Audio('/sounds/notification.mp3');
      this.audio.preload = 'auto';
      this.audio.volume = 0.7; // 70% volume by default
      
      // Preload the audio file
      this.audio.load();
    } catch (error) {
      console.warn('Could not initialize notification sound:', error);
    }
  }

  public async playNotificationSound(): Promise<void> {
    if (!this.isEnabled || !this.audio) {
      return;
    }

    const now = Date.now();
    if (now - this.lastPlayTime < this.MIN_INTERVAL) {
      return; // Prevent sound spam
    }

    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      
      // Play the sound
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        this.lastPlayTime = now;
      }
    } catch (error) {
      // Handle autoplay restrictions gracefully
      console.warn('Could not play notification sound:', error);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification_sound_enabled', String(enabled));
    }
  }

  public isEnabledByUser(): boolean {
    if (typeof window === 'undefined') return true;
    
    const stored = localStorage.getItem('notification_sound_enabled');
    return stored === null ? true : stored === 'true';
  }

  public setVolume(volume: number): void {
    if (this.audio && volume >= 0 && volume <= 1) {
      this.audio.volume = volume;
      
      // Store preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('notification_sound_volume', String(volume));
      }
    }
  }

  public getVolume(): number {
    if (typeof window === 'undefined') return 0.7;
    
    const stored = localStorage.getItem('notification_sound_volume');
    return stored ? parseFloat(stored) : 0.7;
  }

  public initialize(): void {
    if (typeof window !== 'undefined') {
      // Restore user preferences
      this.isEnabled = this.isEnabledByUser();
      
      if (this.audio) {
        this.audio.volume = this.getVolume();
      }
    }
  }
}

// Create singleton instance
export const notificationSoundManager = new NotificationSoundManager();

// Convenience functions
export const playNotificationSound = () => notificationSoundManager.playNotificationSound();
export const setNotificationSoundEnabled = (enabled: boolean) => notificationSoundManager.setEnabled(enabled);
export const isNotificationSoundEnabled = () => notificationSoundManager.isEnabledByUser();
export const setNotificationVolume = (volume: number) => notificationSoundManager.setVolume(volume);
export const getNotificationVolume = () => notificationSoundManager.getVolume();

// Initialize when imported
if (typeof window !== 'undefined') {
  notificationSoundManager.initialize();
}
