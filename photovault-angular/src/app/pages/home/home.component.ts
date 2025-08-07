import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { LoginComponent } from '../../components/login/login.component';
import { ImageService } from '../../services/image.service';
import { AuthService } from '../../services/auth.service';
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
    ImageUploadComponent,
    LoginComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  images: Image[] = [];
  loading = true;
  error: string | null = null;
  backendConnected = false;
  connectionTesting = false;
  isAuthenticated = false;

  private destroy$ = new Subject<void>();

  constructor(
    private imageService: ImageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        setTimeout(() => {
          this.testBackendConnection();
        });
      } else {
        this.backendConnected = false;
        this.loading = false;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  testBackendConnection(): void {
    this.connectionTesting = true;
    this.error = null;
    this.cdr.detectChanges();

    console.log('🔄 Testing authenticated backend connection to localhost:8080...');

    this.imageService.testConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Backend connection successful:', response);
          this.backendConnected = true;
          this.connectionTesting = false;
          this.snackBar.open('Connected to PhotoVault backend!', 'Close', { duration: 2000 });
          this.loadImages();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Backend connection failed:', error);
          this.error = 'Cannot connect to PhotoVault backend. Please check your credentials.';
          this.loading = false;
          this.connectionTesting = false;
          this.backendConnected = false;
          this.cdr.detectChanges();
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.images = [];
    this.backendConnected = false;
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
  }
  loadImages(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    console.log('📸 Loading images from backend...');

    this.imageService.getAllImages(0, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('📸 Images loaded successfully:', response);
          this.images = response.content || [];
          this.loading = false;

          if (this.images.length === 0) {
            this.snackBar.open('No images found. Upload some images to get started!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open(`Loaded ${this.images.length} images`, 'Close', { duration: 2000 });
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Failed to load images:', error);
          this.error = typeof error === 'string' ? error : 'Failed to load images from backend';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onFilesSelected(files: FileList): void {
    if (files.length === 0) return;

    console.log('📤 Files selected for upload:', Array.from(files).map(f => f.name));
    this.uploadFiles(files);
  }

  private uploadFiles(files: FileList): void {
    if (files.length === 1) {
      // Single file upload
      const file = files[0];
      console.log('📤 Uploading single file:', file.name);

      this.imageService.uploadImage(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Upload successful:', response);
            this.snackBar.open(`✅ ${file.name} uploaded successfully!`, 'Close', { duration: 3000 });
            this.loadImages(); // Refresh the image list
          },
          error: (error) => {
            console.error('❌ Upload failed:', error);
            this.snackBar.open(`❌ Upload failed: ${error}`, 'Close', { duration: 5000 });
          }
        });
    } else {
      // Multiple files upload
      console.log('📤 Uploading multiple files:', Array.from(files).map(f => f.name));

      this.imageService.uploadMultipleImages(files)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Multiple upload successful:', response);
            this.snackBar.open(`✅ ${files.length} images uploaded successfully!`, 'Close', { duration: 3000 });
            this.loadImages(); // Refresh the image list
          },
          error: (error) => {
            console.error('❌ Multiple upload failed:', error);
            this.snackBar.open(`❌ Upload failed: ${error}`, 'Close', { duration: 5000 });
          }
        });
    }
  }

  onToggleFavorite(imageId: number): void {
    const image = this.images.find(img => img.id === imageId);
    const action = image?.isFavorite ? 'Removing from' : 'Adding to';

    console.log(`💖 ${action} favorites: image ID ${imageId}`);

    this.imageService.toggleFavorite(imageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('💖 Favorite status updated', 'Close', { duration: 2000 });
          this.loadImages(); // Refresh to get updated status
        },
        error: (error) => {
          this.snackBar.open(`❌ Failed to update favorite: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onToggleArchive(imageId: number): void {
    const image = this.images.find(img => img.id === imageId);
    const action = image?.isArchived ? 'Unarchiving' : 'Archiving';

    console.log(`📦 ${action} image ID ${imageId}`);

    this.imageService.toggleArchive(imageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('📦 Archive status updated', 'Close', { duration: 2000 });
          this.loadImages(); // Refresh to get updated status
        },
        error: (error) => {
          this.snackBar.open(`❌ Failed to update archive: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onDownloadImage(data: {id: number, filename: string}): void {
    console.log(`⬇️ Starting download: ${data.filename}`);

    this.imageService.downloadImage(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.snackBar.open(`⬇️ Download started: ${data.filename}`, 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('❌ Download failed:', error);
          this.snackBar.open(`❌ Download failed: ${error}`, 'Close', { duration: 3000 });
        }
      });
  }

  onDeleteImage(imageId: number): void {
    const image = this.images.find(img => img.id === imageId);

    if (confirm(`Are you sure you want to move "${image?.originalFilename}" to trash?`)) {
      console.log(`🗑️ Moving to trash: image ID ${imageId}`);

      this.imageService.moveToTrash(imageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('🗑️ Image moved to trash', 'Close', { duration: 2000 });
            this.loadImages(); // Refresh the list
          },
          error: (error) => {
            this.snackBar.open(`❌ Failed to delete image: ${error}`, 'Close', { duration: 3000 });
          }
        });
    }
  }

  retryConnection(): void {
    this.testBackendConnection();
  }

  refreshImages(): void {
    this.loadImages();
  }
}
