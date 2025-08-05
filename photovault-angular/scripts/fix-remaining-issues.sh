#!/bin/bash
# fix-remaining-issues.sh

echo "🔧 Fixing remaining Angular issues..."

# Fix the styleUrls double array issue
fix_double_arrays() {
    echo "📐 Fixing double array styleUrls..."

    find src/app -name "*.component.ts" -type f -exec sed -i 's/styleUrls: \[\[\(.*\)\]\]/styleUrls: [\1]/g' {} \;

    echo "✅ Fixed styleUrls arrays"
}

# Fix component exports by regenerating them properly
regenerate_components() {
    echo "🔄 Regenerating component files with correct names..."

    # Image Thumbnail Component
    cat > "src/app/components/image-thumbnail/image-thumbnail.component.ts" << 'EOF'
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-thumbnail',
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

    # Image Upload Component
    cat > "src/app/components/image-upload/image-upload.component.ts" << 'EOF'
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-image-upload',
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

    # Archive Component
    cat > "src/app/pages/archive/archive.component.ts" << 'EOF'
import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-archive',
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

    # Favorites Component
    cat > "src/app/pages/favorites/favorites.component.ts" << 'EOF'
import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-favorites',
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

    # Trash Component
    cat > "src/app/pages/trash/trash.component.ts" << 'EOF'
import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image';

@Component({
  selector: 'app-trash',
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

    echo "✅ Regenerated component files"
}

# Create missing template files
create_templates() {
    echo "📄 Creating component templates..."

    # Image Thumbnail Template
    cat > "src/app/components/image-thumbnail/image-thumbnail.component.html" << 'EOF'
<img [src]="thumbnailUrl"
     [alt]="alt"
     [style.width.px]="width"
     [style.height.px]="height"
     style="object-fit: cover; border-radius: 4px;">
EOF

    # Image Upload Template
    cat > "src/app/components/image-upload/image-upload.component.html" << 'EOF'
<div class="upload-area"
     (dragover)="onDragOver($event)"
     (drop)="onDrop($event)">
  <input type="file"
         multiple
         accept="image/*"
         (change)="onFileSelected($event)"
         #fileInput>
  <div class="upload-content">
    <mat-icon>cloud_upload</mat-icon>
    <p>Drag and drop images here or click to select</p>
    <button mat-raised-button color="primary" (click)="fileInput.click()">
      Choose Files
    </button>
  </div>
</div>
EOF

    # Archive Template
    cat > "src/app/pages/archive/archive.component.html" << 'EOF'
<div class="container">
  <h1>Archived Images</h1>

  <div *ngIf="loading" class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading archived images...</p>
  </div>

  <div *ngIf="error" class="error">
    <p>{{error}}</p>
  </div>

  <div *ngIf="!loading && !error" class="image-grid">
    <app-image-card
      *ngFor="let image of images"
      [image]="image">
    </app-image-card>
  </div>
</div>
EOF

    # Favorites Template
    cat > "src/app/pages/favorites/favorites.component.html" << 'EOF'
<div class="container">
  <h1>Favorite Images</h1>

  <div *ngIf="loading" class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading favorite images...</p>
  </div>

  <div *ngIf="error" class="error">
    <p>{{error}}</p>
  </div>

  <div *ngIf="!loading && !error" class="image-grid">
    <app-image-card
      *ngFor="let image of images"
      [image]="image">
    </app-image-card>
  </div>
</div>
EOF

    # Trash Template
    cat > "src/app/pages/trash/trash.component.html" << 'EOF'
<div class="container">
  <h1>Trash</h1>

  <div *ngIf="loading" class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading trashed images...</p>
  </div>

  <div *ngIf="error" class="error">
    <p>{{error}}</p>
  </div>

  <div *ngIf="!loading && !error" class="image-grid">
    <app-image-card
      *ngFor="let image of images"
      [image]="image">
    </app-image-card>
  </div>
</div>
EOF

    echo "✅ Created component templates"
}

# Fix the Material theme SCSS issue
fix_material_theme() {
    echo "🎨 Fixing Material theme..."

    # Backup existing theme
    if [ -f "src/custom-theme.scss" ]; then
        cp "src/custom-theme.scss" "src/custom-theme.scss.backup"
    fi

    # Create clean theme file
    cat > "src/custom-theme.scss" << 'EOF'
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-warn: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  )
));

@include mat.all-component-themes($my-theme);

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

    echo "✅ Fixed Material theme"
}

# Update main.ts to use module-based bootstrap
fix_main_bootstrap() {
    echo "🚀 Fixing main.ts bootstrap..."

    cat > "src/main.ts" << 'EOF'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
EOF

    echo "✅ Fixed main.ts"
}

# Add SCSS styles to component files
add_component_styles() {
    echo "🎨 Adding component styles..."

    # Image Upload styles
    cat > "src/app/components/image-upload/image-upload.component.scss" << 'EOF'
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

input[type="file"] {
  display: none;
}
EOF

    echo "✅ Added component styles"
}

# Run all fixes
main() {
    fix_double_arrays
    regenerate_components
    create_templates
    fix_material_theme
    fix_main_bootstrap
    add_component_styles

    echo ""
    echo "🎉 All remaining issues fixed!"
    echo ""
    echo "📋 What was fixed:"
    echo "  • Fixed double array styleUrls issue"
    echo "  • Regenerated all component files with correct exports"
    echo "  • Created missing component templates"
    echo "  • Fixed Material theme SCSS structure"
    echo "  • Updated main.ts to use AppModule"
    echo "  • Added component-specific styles"
    echo ""
    echo "🚦 Now try:"
    echo "  ng serve"
    echo ""
}

main
