import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ImageCardComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  images: Image[] = [];
  loading = true;
  error: string | null = null;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadFavoriteImages();
  }

  loadFavoriteImages(): void {
    // TODO: Implement favorite images loading
    this.loading = false;
  }
}
