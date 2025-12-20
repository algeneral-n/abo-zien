/**
 * RARE 4N - Permission Manager
 * ???????? ???????????????? - ???????? ???????????????? ?????? ?????? ???????????? ?????? Cognitive Loop
 * ??? ???? ?????????? ?????????????? - ???? ?????? ?????? ??????????????????
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as Camera from 'expo-camera';

export type PermissionType = 'location' | 'audio' | 'notifications' | 'camera';

export interface PermissionStatus {
  type: PermissionType;
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private permissionCache: Map<PermissionType, PermissionStatus> = new Map();

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Check permission status (without requesting)
   */
  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    // Check cache first
    const cached = this.permissionCache.get(type);
    if (cached) {
      return cached;
    }

    let status: PermissionStatus;

    try {
      switch (type) {
        case 'location':
          const locationStatus = await Location.getForegroundPermissionsAsync();
          status = {
            type: 'location',
            granted: locationStatus.granted,
            canAskAgain: locationStatus.canAskAgain,
          };
          break;

        case 'audio':
          const audioStatus = await Audio.getPermissionsAsync();
          status = {
            type: 'audio',
            granted: audioStatus.granted,
            canAskAgain: audioStatus.canAskAgain,
          };
          break;

        case 'notifications':
          const notificationStatus = await Notifications.getPermissionsAsync();
          status = {
            type: 'notifications',
            granted: notificationStatus.granted,
            canAskAgain: notificationStatus.canAskAgain,
          };
          break;

        case 'camera':
          const cameraStatus = await Camera.getCameraPermissionsAsync();
          status = {
            type: 'camera',
            granted: cameraStatus.granted,
            canAskAgain: cameraStatus.canAskAgain,
          };
          break;

        default:
          status = {
            type,
            granted: false,
            canAskAgain: false,
            message: 'Unknown permission type',
          };
      }

      // Cache the result
      this.permissionCache.set(type, status);
      return status;
    } catch (error: any) {
      return {
        type,
        granted: false,
        canAskAgain: false,
        message: error.message,
      };
    }
  }

  /**
   * Request permission (only when needed, via Cognitive Loop decision)
   */
  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    // Clear cache for this permission
    this.permissionCache.delete(type);

    let status: PermissionStatus;

    try {
      switch (type) {
        case 'location':
          const locationResult = await Location.requestForegroundPermissionsAsync();
          status = {
            type: 'location',
            granted: locationResult.granted,
            canAskAgain: locationResult.canAskAgain,
          };
          break;

        case 'audio':
          const audioResult = await Audio.requestPermissionsAsync();
          status = {
            type: 'audio',
            granted: audioResult.granted,
            canAskAgain: audioResult.canAskAgain,
          };
          break;

        case 'notifications':
          // Notifications permission - optional, not installed
          status = {
            type: 'notifications',
            granted: false,
            canAskAgain: false,
            message: 'expo-notifications not installed',
          };
          break;

        case 'camera':
          const cameraResult = await Camera.requestCameraPermissionsAsync();
          status = {
            type: 'camera',
            granted: cameraResult.granted,
            canAskAgain: cameraResult.canAskAgain,
          };
          break;

        default:
          status = {
            type,
            granted: false,
            canAskAgain: false,
            message: 'Unknown permission type',
          };
      }

      // Cache the result
      this.permissionCache.set(type, status);
      return status;
    } catch (error: any) {
      return {
        type,
        granted: false,
        canAskAgain: false,
        message: error.message,
      };
    }
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }
}


