import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as faceapi from 'face-api.js';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('DailyLook');

    async ngOnInit(): Promise<void> {
        await this.loadModels();
    }

    async loadModels(): Promise<void> {
        const models = [
            { loader: faceapi.loadTinyFaceDetectorModel, name: 'Tiny Face Detector' },
            // { loader: faceapi.loadSsdMobilenetv1Model, name: 'SSD Mobilenetv1' },
            // { loader: faceapi.loadFaceExpressionModel, name: 'Face Expression' },
            // { loader: faceapi.loadAgeGenderModel, name: 'Age and Gender' },
            // { loader: faceapi.loadFaceLandmarkModel, name: 'Face Landmark' },
            // { loader: faceapi.loadFaceRecognitionModel, name: 'Face Recognition' }
        ];

        for (const model of models) {
            try {
                await model.loader('/assets/models');
            } catch (error) {
                console.error(`Error loading ${model.name} Model:`, error);
            }
        }
    }
}
