// lib/notifications/audioManager.ts - VERSIÓN LIMPIA

import { NotificationPriority } from './types';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private isBrowser: boolean = false;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    
    if (this.isBrowser) {
      this.initAudioContext();
      this.loadSavedSettings();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (this.isBrowser) {
      try {
        localStorage.setItem('notifications-audio-enabled', enabled.toString());
      } catch (error) {
        // Silently fail if localStorage not available
      }
    }
  }

  getEnabled(): boolean {
    return this.isBrowser && this.isEnabled;
  }

  async playNotificationSound(priority: NotificationPriority): Promise<void> {
    if (!this.isBrowser || !this.isEnabled || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      switch (priority) {
        case 'urgent':
          await this.playUrgentSound();
          break;
        case 'high':
          await this.playHighPrioritySound();
          break;
        case 'medium':
          await this.playMediumPrioritySound();
          break;
        case 'low':
          await this.playLowPrioritySound();
          break;
      }
    } catch (error) {
      // Silently fail - audio is not critical functionality
    }
  }

  async playTestSound(): Promise<void> {
    await this.playMediumPrioritySound();
  }

  async requestAudioPermission(): Promise<boolean> {
    if (!this.isBrowser || !this.audioContext) return false;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private loadSavedSettings(): void {
    if (!this.isBrowser) return;
    
    try {
      const saved = localStorage.getItem('notifications-audio-enabled');
      this.isEnabled = saved !== null ? saved === 'true' : this.isEnabled;
    } catch (error) {
      // Use default settings if localStorage fails
    }
  }

  private initAudioContext(): void {
    if (!this.isBrowser) return;
    
    try {
      if ('AudioContext' in window) {
        this.audioContext = new AudioContext();
      } else if ('webkitAudioContext' in (window as any)) {
        this.audioContext = new (window as any).webkitAudioContext();
      }
    } catch (error) {
      // Audio not supported - will fail silently on playback attempts
    }
  }

  private async playUrgentSound(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);

    setTimeout(() => this.playHighPrioritySound(), 400);
    setTimeout(() => this.playHighPrioritySound(), 800);
  }

  private async playHighPrioritySound(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  private async playMediumPrioritySound(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(450, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  private async playLowPrioritySound(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.25);
  }
}

export const audioManager = new AudioManager();
