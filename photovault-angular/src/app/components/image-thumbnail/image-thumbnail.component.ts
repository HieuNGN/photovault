import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-thumbnail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './image-thumbnail.component.html',
  styleUrls: ['./image-thumbnail.component.scss']
})
export class ImageThumbnailComponent {
  @Input() imageId!: number;
  @Input() alt: string = '';
  @Input() width: number = 200;
  @Input() height: number = 200;

  imageError = false;

  get thumbnailUrl(): string {
    return `http://localhost:8080/images/${this.imageId}/thumbnail?width=${this.width}&height=${this.height}`;
  }

  onImageError(): void {
    console.error(`Failed to load thumbnail for image ID: ${this.imageId}`);
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }
}
