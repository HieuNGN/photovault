import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageThumbnailComponent } from './image-thumbnail.component';

describe('ImageThumbnail', () => {
  let component: ImageThumbnailComponent;
  let fixture: ComponentFixture<ImageThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageThumbnailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
