import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-thumbnail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-thumbnail.component.html',
  styleUrls: ['./image-thumbnail.component.scss']
})
export class ImageThumbnailComponent {
  @Input() imageId!: number;
  @Input() alt: string = '';
  @Input() width: number = 150;
  @Input() height: number = 150;

  get thumbnailUrl(): string {
    return `http://localhost:8080/images/${this.imageId}/thumbnail?width=${this.width}&height=${this.height}`;
  }
}
