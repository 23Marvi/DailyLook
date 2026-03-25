import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakePhotoPage } from './make-photo-page';

describe('MakePhotoPage', () => {
    let component: MakePhotoPage;
    let fixture: ComponentFixture<MakePhotoPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MakePhotoPage],
        }).compileComponents();

        fixture = TestBed.createComponent(MakePhotoPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
