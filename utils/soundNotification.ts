// utils/soundNotification.ts
export class SoundNotification {
  private audioContext: AudioContext | null = null;
  private isSupported: boolean = false;
  private isUserInteractionRequired: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'AudioContext' in window || 'webkitAudioContext' in window;
      console.log('🔊 [SOUND] Sistema de sonido disponible:', this.isSupported);
    }
  }

  // Inicializar el contexto de audio tras interacción del usuario
  async initializeAudioContext() {
    if (!this.isSupported || this.isInitialized) {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔊 [SOUND] AudioContext creado. Estado:', this.audioContext.state);
      
      // Intentar reanudar si está suspendido
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 [SOUND] AudioContext suspendido, intentando reanudar...');
        await this.audioContext.resume();
        console.log('🔊 [SOUND] AudioContext reanudado. Nuevo estado:', this.audioContext.state);
      }
      
      this.isUserInteractionRequired = false;
      this.isInitialized = true;
      console.log('✅ [SOUND] Sistema de sonido inicializado correctamente');
      
    } catch (error) {
      console.error('❌ [SOUND] Error inicializando AudioContext:', error);
      this.isSupported = false;
    }
  }

  // Sonido de notificación suave
  async playNotificationSound(type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    console.log(`🔊 [SOUND] Intentando reproducir sonido tipo: ${type}`);
    
    // Intentar inicializar si no está listo
    if (!this.isInitialized && this.isSupported) {
      console.log('🔊 [SOUND] Inicializando AudioContext...');
      await this.initializeAudioContext();
    }

    if (!this.audioContext || !this.isSupported || !this.isInitialized) {
      console.log('🔊 [SOUND] AudioContext no disponible, usando fallback');
      return this.playFallbackSound();
    }

    try {
      // Verificar y reanudar contexto
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 [SOUND] Reanudando AudioContext...');
        await this.audioContext.resume();
      }

      if (this.audioContext.state !== 'running') {
        console.log('🔊 [SOUND] AudioContext no está running:', this.audioContext.state);
        return this.playFallbackSound();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Frecuencias diferentes según el tipo
      const frequencies = {
        info: 800,
        success: 600,
        warning: 900,
        error: 400
      };

      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';

      // Envelope suave
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Un poco más fuerte
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      console.log('🔊 [SOUND] Reproduciendo sonido...', { frequency: frequencies[type], duration: 0.5 });
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);

      return new Promise(resolve => {
        oscillator.onended = () => {
          console.log('✅ [SOUND] Sonido completado');
          resolve(true);
        };
      });
    } catch (error) {
      console.error('❌ [SOUND] Error reproduciendo sonido:', error);
      return this.playFallbackSound();
    }
  }

  // Sonido de notificación urgente
  async playUrgentNotificationSound() {
    console.log('🚨 [SOUND] Reproduciendo sonido urgente...');
    
    if (!this.isInitialized && this.isSupported) {
      await this.initializeAudioContext();
    }

    if (!this.audioContext || !this.isSupported || !this.isInitialized) {
      console.log('🔊 [SOUND] Usando fallback para sonido urgente');
      return this.playMultipleFallbacks();
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.audioContext.state !== 'running') {
        return this.playMultipleFallbacks();
      }

      // Crear patrón urgente: dos tonos
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = this.audioContext.currentTime;
      
      // Patrón urgente: dos beeps
      playTone(1200, now, 0.12);
      playTone(900, now + 0.18, 0.12);
      
      console.log('🚨 [SOUND] Patrón urgente iniciado');
      
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('✅ [SOUND] Sonido urgente completado');
          resolve(true);
        }, 400);
      });
    } catch (error) {
      console.error('❌ [SOUND] Error en sonido urgente:', error);
      return this.playMultipleFallbacks();
    }
  }

  // Fallback simple
  private playFallbackSound() {
    console.log('🔊 [SOUND] Ejecutando fallback simple...');
    try {
      // Método 1: SpeechSynthesis con volumen mínimo
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0.001;
        utterance.rate = 10;
        utterance.pitch = 0.1;
        window.speechSynthesis.speak(utterance);
        console.log('✅ [SOUND] Fallback speechSynthesis ejecutado');
        return true;
      }
    } catch (error) {
      console.log('❌ [SOUND] Fallback simple falló:', error);
    }
    return false;
  }

  // Múltiples fallbacks para sonido urgente
  private async playMultipleFallbacks() {
    console.log('🚨 [SOUND] Ejecutando múltiples fallbacks para urgente...');
    
    try {
      // Fallback 1: Vibración si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
        console.log('📳 [SOUND] Vibración activada');
      }

      // Fallback 2: SpeechSynthesis doble
      if ('speechSynthesis' in window) {
        const utterance1 = new SpeechSynthesisUtterance('');
        utterance1.volume = 0.001;
        utterance1.rate = 10;
        utterance1.pitch = 0.1;
        window.speechSynthesis.speak(utterance1);
        
        setTimeout(() => {
          const utterance2 = new SpeechSynthesisUtterance('');
          utterance2.volume = 0.001;
          utterance2.rate = 10;
          utterance2.pitch = 0.2;
          window.speechSynthesis.speak(utterance2);
        }, 100);
        
        console.log('✅ [SOUND] Fallback doble ejecutado');
        return true;
      }
    } catch (error) {
      console.log('❌ [SOUND] Todos los fallbacks fallaron:', error);
    }
    
    return false;
  }

  // Test de sonido con logs detallados
  async testSound() {
    console.log('🧪 [SOUND] ===== INICIANDO TEST DE SONIDO =====');
    console.log('🔍 [SOUND] Estado actual:', {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      audioContextState: this.audioContext?.state,
      userAgent: navigator.userAgent.slice(0, 50)
    });

    // Forzar inicialización
    await this.initializeAudioContext();
    
    console.log('🔊 [SOUND] Intentando test...');
    const resultado = await this.playNotificationSound('info');
    
    console.log('✅ [SOUND] Test completado. Resultado:', resultado);
    return resultado;
  }

  // Liberar recursos
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
      console.log('🧹 [SOUND] AudioContext disposed');
    }
  }
}

// Instancia singleton mejorada
export const soundNotification = new SoundNotification();

// 🆕 Función helper para inicializar tras interacción del usuario
export const initializeSoundSystem = async () => {
  console.log('🎵 [SOUND] Inicializando sistema tras interacción del usuario...');
  await soundNotification.initializeAudioContext();
};
