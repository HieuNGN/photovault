import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ImageCardComponent
  ],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {
  images: Image[] = [];
  loading = true;
  error: string | null = null;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadArchivedImages();
  }

  loadArchivedImages(): void {
    // TODO: Implement archived images loading
    this.loading = false;
  }
}
