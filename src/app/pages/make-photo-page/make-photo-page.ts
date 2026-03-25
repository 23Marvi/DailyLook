import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import * as faceapi from 'face-api.js';
import { FileService } from '../../services/file/file.service';

@Component({
    selector: 'app-make-photo-page',
    imports: [NgClass, SvgIconComponent],
    templateUrl: './make-photo-page.html',
    styleUrl: './make-photo-page.scss',
})
export class MakePhotoPage implements OnInit, AfterViewInit {
    @ViewChild("video", { static: false }) videoEl!: ElementRef<HTMLVideoElement>;

    imageBase64 = signal('');
    faceInEgg = signal(false);
    saving = signal(false);
    egg = signal({ width: 0, height: 0, x: 0, y: 0 });

    imageDate: Date | null = null;

    constructor(
        private fileService: FileService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.setEggSize();
    }

    async ngAfterViewInit(): Promise<void> {
        await this.startVideo();
    }

    setEggSize() {
        const ASPECT_RATIO = 0.75;
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        const maxHeight = screenHeight * 0.7;
        const maxWidth = screenWidth * 0.7;

        let height = maxHeight;
        let width = height * ASPECT_RATIO;

        if (width > maxWidth) {
            width = maxWidth;
            height = width / ASPECT_RATIO;
        }

        this.egg.set({
            width,
            height,
            x: (screenWidth - width) / 2,
            y: (screenHeight - height) / 2
        });
    }

    async startVideo(): Promise<void> {
        try {
            this.resetImage();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { frameRate: { ideal: 144, max: 144 } }
            });
            this.videoEl.nativeElement.srcObject = stream;
            this.videoEl.nativeElement.onloadedmetadata = () => {
                this.videoEl.nativeElement.play();
                this.onPlay();
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    async onPlay(): Promise<void> {
        if (!this.videoEl || this.videoEl.nativeElement.paused || this.videoEl.nativeElement.ended) return;

        try {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });
            const result = await faceapi.detectSingleFace(this.videoEl.nativeElement, options);
            if (result) {
                this.faceInEgg.set(this.faceIsInEgg(result));
                console.log('Is face in egg?', this.faceInEgg());
            } else {
                this.faceInEgg.set(false);
            }
        } catch (error) {
            console.error('Error detecting face:', error);
        }

        requestAnimationFrame(() => this.onPlay());
    }

    faceIsInEgg(face: faceapi.FaceDetection): boolean {
        const faceCenterX = face.box.x + face.box.width / 2;
        const faceCenterY = face.box.y + face.box.height / 2;

        return faceCenterX > this.egg().x && faceCenterX < this.egg().x + this.egg().width &&
            faceCenterY > this.egg().y && faceCenterY < this.egg().y + this.egg().height;
    }

    makePhoto(): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoEl.nativeElement.videoWidth;
        canvas.height = this.videoEl.nativeElement.videoHeight;
        const ctx = canvas.getContext('2d');

        ctx!.scale(-1, 1);
        ctx!.drawImage(this.videoEl.nativeElement, -canvas.width, 0, canvas.width, canvas.height);
        ctx!.setTransform(1, 0, 0, 1, 0, 0);

        this.stopVideo();
        this.imageBase64.set(canvas.toDataURL('image/png', 1.0));
        this.imageDate = new Date();
    }

    stopVideo(): void {
        this.videoEl.nativeElement.pause();
        const stream = this.videoEl.nativeElement.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }

    async savePhoto(): Promise<void> {
        if (!this.imageBase64() || !this.imageDate) return;

        try {
            this.saving.set(true);
            await this.fileService.saveFile(this.imageBase64(), this.imageDate);
            await this.router.navigate(['/photos']);
        } catch (error) {
            console.error('Error saving photo:', error);
        } finally {
            this.saving.set(false);
        }
    }

    resetImage(): void {
        this.imageBase64.set('');
        this.imageDate = null;
    }
}
