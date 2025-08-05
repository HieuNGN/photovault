import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageThumbnailComponent } from '../image-thumbnail/image-thumbnail.component';
import { Image } from '../../models/image';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ImageThumbnailComponent
  ],
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss']
})
export class ImageCardComponent {
  @Input() image!: Image;
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() toggleArchive = new EventEmitter<number>();
  @Output() downloadImage = new EventEmitter<{id: number, filename: string}>();
  @Output() deleteImage = new EventEmitter<number>();

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.image.id);
  }

  onToggleArchive(): void {
    this.toggleArchive.emit(this.image.id);
  }

  onDownload(): void {
    this.downloadImage.emit({
      id: this.image.id,
      filename: this.image.originalFilename
    });
  }

  onDelete(): void {
    this.deleteImage.emit(this.image.id);
  }
}
