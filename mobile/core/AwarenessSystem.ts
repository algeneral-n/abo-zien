/**
 * RARE 4N - Awareness System (????????????)
 * ???????? ?????????? - Location, Time, Device, Ambient Sensing
 * ??? Cognitive Loop ??? Kernel ??? Awareness System
 */

import { RAREKernel } from './RAREKernel';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface AwarenessData {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  time: {
    hour: number;
    minute: number;
    day: number;
    month: number;
    year: number;
    isDay: boolean;
    isNight: boolean;
  };
  device: {
    batteryLevel: number;
    isCharging: boolean;
    networkType: string;
    isOnline: boolean;
  };
  ambient: {
    motion: boolean;
    light: number;
    temperature: number;
  };
}

export class AwarenessSystem {
  private static instance: AwarenessSystem;
  private kernel: RAREKernel | null = null;
  private initialized: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private currentData: AwarenessData;

  private constructor() {
    this.currentData = {
      location: null,
      time: this.getTimeData(),
      device: {
        batteryLevel: 100,
        isCharging: false,
        networkType: 'unknown',
        isOnline: true,
      },
      ambient: {
        motion: false,
        light: 0,
        temperature: 0,
      },
    };
  }

  static getInstance(): AwarenessSystem {
    if (!AwarenessSystem.instance) {
      AwarenessSystem.instance = new AwarenessSystem();
    }
    return AwarenessSystem.instance;
  }

  async init(kernel: RAREKernel): Promise<void> {
    if (this.initialized) return;

    this.kernel = kernel;
    this.initialized = true;

    // ??? ???? ???????? ???????????????? ?????? ?????????? - ???????????? ?????? ???????????? ??????
    // Location permission will be requested when needed (lazy loading)
    // This prevents requesting all permissions at once on app start

    // Start periodic updates (will request permission when needed)
    this.startUpdates();

    // ??? ?????????? ?????? Kernel
    this.kernel.emit({
      type: 'awareness:initialized',
      data: {},
      source: 'awareness',
    });
  }

  private startUpdates(): void {
    // ??? ???? ???????? ?????????????????? ???????????????? - ?????? ?????? ??????????
    // Update will be triggered by Cognitive Loop when needed
  }

  private async update(): Promise<void> {
    try {
      // Update time
      this.currentData.time = this.getTimeData();

      // Update location (if permission granted)
      await this.updateLocation();

      // Update device status
      await this.updateDeviceStatus();

      // Update ambient sensing
      await this.updateAmbientSensing();

      // ??? ?????????? ?????? Kernel
      if (this.kernel) {
        this.kernel.emit({
          type: 'awareness:update',
          data: this.currentData,
          source: 'awareness',
        });
      }
    } catch (error) {
      console.error('AwarenessSystem: Update error:', error);
    }
  }

  private getTimeData() {
    const now = new Date();
    const hour = now.getHours();
    return {
      hour,
      minute: now.getMinutes(),
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      isDay: hour >= 6 && hour < 18,
      isNight: hour >= 18 || hour < 6,
    };
  }

  private async updateLocation(): Promise<void> {
    // ??? ???? ???????? ???????????????? ???????????????? - ???????????? ?????? ?????? ???????????? ?????? Cognitive Loop
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        // ??? ?????????? ?????? Kernel ??? Cognitive Loop ?????????? ?????? ??????????
        if (this.kernel) {
          this.kernel.emit({
            type: 'user:input',
            data: {
              text: 'request location permission',
              type: 'permission',
              permission: 'location',
            },
            source: 'awareness',
          });
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentData.location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('AwarenessSystem: Location update error:', error);
    }
  }

  private async updateDeviceStatus(): Promise<void> {
    try {
      // Battery level (requires native module)
      // Network type (requires native module)
      // This is a simplified version
      this.currentData.device = {
        ...this.currentData.device,
        isOnline: true,
        networkType: 'wifi',
      };
    } catch (error) {
      console.error('AwarenessSystem: Device status update error:', error);
    }
  }

  private async updateAmbientSensing(): Promise<void> {
    try {
      // Motion, light, temperature (require native modules)
      // This is a simplified version
      this.currentData.ambient = {
        motion: false,
        light: 0.5,
        temperature: 25,
      };
    } catch (error) {
      console.error('AwarenessSystem: Ambient sensing update error:', error);
    }
  }

  getCurrentData(): AwarenessData {
    return { ...this.currentData };
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}









