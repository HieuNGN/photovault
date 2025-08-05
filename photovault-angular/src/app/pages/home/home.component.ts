import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ImageCardComponent,
    ImageUploadComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  images: Image[] = [];
  loading = true;
  error: string | null = null;
  backendConnected = false;

  private destroy$ = new Subject<void>();

  constructor(
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.testBackendConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  testBackendConnection(): void {
    console.log('Testing backend connection...');
    this.imageService.testConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Backend connection successful:', response);
          this.backendConnected = true;
          this.loadImages();
        },
        error: (error) => {
          console.error('Backend connection failed:', error);
          this.error = 'Cannot connect to backend server. Please make sure it\'s running on localhost:8080';
          this.loading = false;
          this.backendConnected = false;
        }
      });
  }

  loadImages(): void {
    this.loading = true;
    this.error = null;

    this.imageService.getAllImages(0, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Images loaded:', response);
          this.images = response.content || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load images:', error);
          this.error = typeof error === 'string' ? error : 'Failed to load images';
          this.loading = false;
        }
      });
  }

  onFilesSelected(files: FileList): void {
    if (files.length === 0) return;

    console.log('Files selected for upload:', files);
    this.uploadFiles(files);
  }

  private uploadFiles(files: FileList): void {
    const file = files[0]; // Start with single file upload
    this.imageService.uploadImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          this.snackBar.open('Image uploaded successfully!', 'Close', { duration: 3000 });
          this.loadImages();
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.snackBar.open(`Upload failed: ${error}`, 'Close', { duration: 5000 });
        }
      });
  }

  onToggleFavorite(imageId: number): void {
    this.imageService.toggleFavorite(imageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Favorite status updated', 'Close', { duration: 2000 });
          this.loadImages();
        },
        error: (error) => {
          this.snackBar.open(`Failed to update favorite: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onToggleArchive(imageId: number): void {
    this.imageService.toggleArchive(imageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Archive status updated', 'Close', { duration: 2000 });
          this.loadImages();
        },
        error: (error) => {
          this.snackBar.open(`Failed to update archive: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onDownloadImage(data: {id: number, filename: string}): void {
    this.imageService.downloadImage(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.filename;
          link.click();
          window.URL.revokeObjectURL(url);
          this.snackBar.open('Download started', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open(`Download failed: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onDeleteImage(imageId: number): void {
    if (confirm('Are you sure you want to move this image to trash?')) {
      this.imageService.moveToTrash(imageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Image moved to trash', 'Close', { duration: 2000 });
            this.loadImages();
          },
          error: (error) => {
            this.snackBar.open(`Failed to delete image: ${error}`, 'Close', { duration: 3000 });
          }
        });
    }
  }

  retryConnection(): void {
    this.testBackendConnection();
  }
}
