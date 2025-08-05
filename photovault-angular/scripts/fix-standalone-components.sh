#!/bin/bash
# fix-standalone-components.sh

echo "🚀 Fixing standalone components setup..."

# First, let's install the missing dependency
install_dependencies() {
    echo "📦 Installing missing dependencies..."
    npm install @angular/platform-browser-dynamic --save
    echo "✅ Dependencies installed"
}

# Convert to standalone app (recommended for new Angular projects)
create_standalone_app() {
    echo "🔄 Converting to standalone app architecture..."

    # Update main.ts for standalone bootstrap
    cat > "src/main.ts" << 'EOF'
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      RouterModule.forRoot(routes),
      BrowserAnimationsModule,
      HttpClientModule
    )
  ]
}).catch((err: any) => console.error(err));
EOF

    # Create app.routes.ts
    cat > "src/app/app.routes.ts" << 'EOF'
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { TrashComponent } from './pages/trash/trash.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'trash', component: TrashComponent },
  { path: '**', redirectTo: '/home' }
];
EOF

    echo "✅ Created standalone app structure"
}

# Update AppComponent to be properly standalone
fix_app_component() {
    echo "🔧 Fixing AppComponent..."

    cat > "src/app/app.component.ts" << 'EOF'
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'photovault-angular';
}
EOF

    echo "✅ Fixed AppComponent"
}

# Update all components to be properly standalone
fix_all_components() {
    echo "🔧 Fixing all components to be standalone..."

    # ImageCardComponent
    cat > "src/app/components/image-card/image-card.component.ts" << 'EOF'
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
EOF

    # ImageThumbnailComponent
    cat > "src/app/components/image-thumbnail/image-thumbnail.component.ts" << 'EOF'
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
EOF

    # ImageUploadComponent
    cat > "src/app/components/image-upload/image-upload.component.ts" << 'EOF'
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Output() filesSelected = new EventEmitter<FileList>();

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.filesSelected.emit(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.filesSelected.emit(files);
    }
  }
}
EOF

    # HomeComponent
    cat > "src/app/pages/home/home.component.ts" << 'EOF'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ImageCardComponent,
    ImageUploadComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  images: Image[] = [];
  loading = true;
  error: string | null = null;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    // TODO: Implement image loading
    this.loading = false;
  }
}
EOF

    # FavoritesComponent
    cat > "src/app/pages/favorites/favorites.component.ts" << 'EOF'
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
EOF

    # ArchiveComponent
    cat > "src/app/pages/archive/archive.component.ts" << 'EOF'
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
EOF

    # TrashComponent
    cat > "src/app/pages/trash/trash.component.ts" << 'EOF'
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
EOF

    echo "✅ Fixed all components to be standalone"
}

# Fix Material theme with proper function calls
fix_material_theme_functions() {
    echo "🎨 Fixing Material theme functions..."

    cat > "src/custom-theme.scss" << 'EOF'
@use '@angular/material' as mat;

@include mat.core();

$photovault-primary: mat.m2-define-palette(mat.$m2-indigo-palette);
$photovault-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);
$photovault-warn: mat.m2-define-palette(mat.$m2-red-palette);

$photovault-theme: mat.m2-define-light-theme((
  color: (
    primary: $photovault-primary,
    accent: $photovault-accent,
    warn: $photovault-warn,
  ),
  typography: mat.m2-define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($photovault-theme);

/* Custom styles */
html, body {
  height: 100%;
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}

.spacer {
  flex: 1 1 auto;
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  gap: 20px;
}

.error {
  color: #f44336;
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 4px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  margin: 20px 0;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #3f51b5;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-card {
  max-width: 250px;
  margin: 10px;
}

.image-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
EOF

    echo "✅ Fixed Material theme functions"
}

# Remove the old NgModule files since we're going standalone
cleanup_old_files() {
    echo "🧹 Cleaning up old module files..."

    # Remove app.module.ts since we're using standalone
    if [ -f "src/app/app.module.ts" ]; then
        rm "src/app/app.module.ts"
        echo "✅ Removed old app.module.ts"
    fi

    # Remove app-routing.module.ts since we're using app.routes.ts
    if [ -f "src/app/app-routing.module.ts" ]; then
        rm "src/app/app-routing.module.ts"
        echo "✅ Removed old app-routing.module.ts"
    fi
}

# Run all fixes
main() {
    install_dependencies
    create_standalone_app
    fix_app_component
    fix_all_components
    fix_material_theme_functions
    cleanup_old_files

    echo ""
    echo "🎉 Standalone components setup completed!"
    echo ""
    echo "📋 What was done:"
    echo "  • Installed missing @angular/platform-browser-dynamic"
    echo "  • Converted to standalone app architecture (modern Angular)"
    echo "  • Updated all components to be standalone with proper imports"
    echo "  • Fixed Material theme with correct function names"
    echo "  • Cleaned up old NgModule files"
    echo "  • Created proper routing with app.routes.ts"
    echo ""
    echo "🚦 Your app is now using the modern Angular standalone approach!"
    echo ""
    echo "Next: ng serve"
    echo ""
}

main
