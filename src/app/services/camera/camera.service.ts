import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CameraAccessResult {
    granted: boolean;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CameraService {

    async getCameraAccess(): Promise<CameraAccessResult> {
        if (Capacitor.getPlatform() === 'web') {
            return { granted: true };
        }

        try {
            const current = await Camera.checkPermissions();
            if (current.camera === 'granted') {
                return { granted: true };
            }

            const requested = await Camera.requestPermissions({ permissions: ['camera'] });
            if (requested.camera === 'granted') {
                return { granted: true };
            }

            return {
                granted: false,
                message: 'Camera permission was denied. Enable it in app settings and try again.'
            };
        } catch {
            return {
                granted: false,
                message: 'Could not check camera permission on this device.'
            };
        }
    }
}
