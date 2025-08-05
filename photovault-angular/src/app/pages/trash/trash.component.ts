import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ImageCardComponent
  ],
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss']
})
export class TrashComponent implements OnInit {
  images: Image[] = [];
  loading = true;
  error: string | null = null;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadTrashedImages();
  }

  loadTrashedImages(): void {
    // TODO: Implement trashed images loading
    this.loading = false;
  }
}
