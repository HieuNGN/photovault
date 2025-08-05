#!/bin/bash
# fix-angular-naming.sh

echo "🚀 Starting comprehensive Angular naming convention fixes..."

# Create missing SCSS files
create_missing_files() {
    echo "📁 Creating missing SCSS files..."

    local scss_files=(
        "src/app/components/image-card/image-card.component.scss"
        "src/app/components/image-thumbnail/image-thumbnail.component.scss"
        "src/app/components/image-upload/image-upload.component.scss"
        "src/app/pages/archive/archive.component.scss"
        "src/app/pages/favorites/favorites.component.scss"
        "src/app/pages/home/home.component.scss"
        "src/app/pages/trash/trash.component.scss"
        "src/app/app.component.scss"
    )

    for file in "${scss_files[@]}"; do
        if [ ! -f "$file" ]; then
            mkdir -p "$(dirname "$file")"
            echo "/* Component styles */" > "$file"
            echo "✅ Created: $file"
        fi
    done
}

# Fix component files
fix_component_files() {
    echo "🔧 Fixing component files..."

    # Fix image-thumbnail component
    if [ -f "src/app/components/image-thumbnail/image-thumbnail.component.ts" ]; then
        sed -i 's/export class ImageThumbnail/export class ImageThumbnailComponent/g' \
            "src/app/components/image-thumbnail/image-thumbnail.component.ts"
        sed -i "s/styleUrl:/styleUrls:/g" \
            "src/app/components/image-thumbnail/image-thumbnail.component.ts"
        sed -i "s/'\.\/image-thumbnail\.component\.scss'/['\.\/image-thumbnail\.component\.scss']/g" \
            "src/app/components/image-thumbnail/image-thumbnail.component.ts"
        echo "✅ Fixed: image-thumbnail.component.ts"
    fi

    # Fix image-upload component
    if [ -f "src/app/components/image-upload/image-upload.component.ts" ]; then
        sed -i 's/export class ImageUpload/export class ImageUploadComponent/g' \
            "src/app/components/image-upload/image-upload.component.ts"
        sed -i "s/styleUrl:/styleUrls:/g" \
            "src/app/components/image-upload/image-upload.component.ts"
        sed -i "s/'\.\/image-upload\.component\.scss'/['\.\/image-upload\.component\.scss']/g" \
            "src/app/components/image-upload/image-upload.component.ts"
        echo "✅ Fixed: image-upload.component.ts"
    fi

    # Fix page components
    for component in "archive" "favorites" "trash"; do
        file="src/app/pages/$component/$component.component.ts"
        if [ -f "$file" ]; then
            # Capitalize first letter and add Component suffix
            class_name="$(tr '[:lower:]' '[:upper:]' <<< ${component:0:1})${component:1}Component"
            sed -i "s/export class ${component^}/export class $class_name/g" "$file"
            sed -i "s/styleUrl:/styleUrls:/g" "$file"
            sed -i "s/'\.\/.*\.scss'/['.\/$component.component.scss']/g" "$file"
            echo "✅ Fixed: $file"
        fi
    done

    # Fix app component (remove duplicate class)
    if [ -f "src/app/app.component.ts" ]; then
        # Remove the duplicate AppComponentComponent class
        sed -i '/export class AppComponentComponent/,/^}/d' "src/app/app.component.ts"
        sed -i "s/styleUrl:/styleUrls:/g" "src/app/app.component.ts"
        echo "✅ Fixed: app.component.ts"
    fi
}

# Fix test files
fix_test_files() {
    echo "🧪 Fixing test files..."

    # Define test file mappings
    declare -A test_mappings=(
        ["src/app/components/image-thumbnail/image-thumbnail.component.spec.ts"]="ImageThumbnailComponent"
        ["src/app/components/image-upload/image-upload.component.spec.ts"]="ImageUploadComponent"
        ["src/app/pages/archive/archive.component.spec.ts"]="ArchiveComponent"
        ["src/app/pages/favorites/favorites.component.spec.ts"]="FavoritesComponent"
        ["src/app/pages/trash/trash.component.spec.ts"]="TrashComponent"
    )

    for test_file in "${!test_mappings[@]}"; do
        if [ -f "$test_file" ]; then
            component_name="${test_mappings[$test_file]}"
            # Extract the original wrong name from the file
            wrong_name=$(grep -o "import { [^}]* }" "$test_file" | sed "s/import { \([^}]*\) }/\1/")

            # Fix import statement
            sed -i "s/import { .* } from/import { $component_name } from/g" "$test_file"
            sed -i "s/\.component';/.component';/g" "$test_file"

            # Fix component references
            sed -i "s/let component: [^;]*/let component: $component_name/g" "$test_file"
            sed -i "s/ComponentFixture<[^>]*>/ComponentFixture<$component_name>/g" "$test_file"
            sed -i "s/TestBed\.createComponent([^)]*)/TestBed.createComponent($component_name)/g" "$test_file"
            sed -i "s/imports: \[[^\]]*\]/imports: [$component_name]/g" "$test_file"

            echo "✅ Fixed: $test_file"
        fi
    done
}

# Fix service files
fix_services() {
    echo "🔧 Fixing service files..."

    if [ -f "src/app/services/auth.service.ts" ]; then
        sed -i 's/export class Auth/export class AuthService/g' "src/app/services/auth.service.ts"
        echo "✅ Fixed: auth.service.ts"
    fi

    # Fix service test files
    if [ -f "src/app/services/auth.service.spec.ts" ]; then
        sed -i "s/import { Auth }/import { AuthService }/g" "src/app/services/auth.service.spec.ts"
        sed -i "s/let service: Auth/let service: AuthService/g" "src/app/services/auth.service.spec.ts"
        sed -i "s/TestBed\.inject(Auth)/TestBed.inject(AuthService)/g" "src/app/services/auth.service.spec.ts"
        echo "✅ Fixed: auth.service.spec.ts"
    fi
}

# Fix main bootstrap files
fix_bootstrap_files() {
    echo "🚀 Fixing bootstrap files..."

    # Fix main.ts
    if [ -f "src/main.ts" ]; then
        sed -i "s/import { App }/import { AppComponent }/g" "src/main.ts"
        sed -i "s/bootstrapApplication(App,/bootstrapApplication(AppComponent,/g" "src/main.ts"
        echo "✅ Fixed: main.ts"
    fi

    # Fix main.server.ts
    if [ -f "src/main.server.ts" ]; then
        sed -i "s/import { App }/import { AppComponent }/g" "src/main.server.ts"
        sed -i "s/bootstrapApplication(App,/bootstrapApplication(AppComponent,/g" "src/main.server.ts"
        echo "✅ Fixed: main.server.ts"
    fi
}

# Update app.module.ts with correct component names
fix_app_module() {
    echo "📦 Fixing app.module.ts..."

    if [ -f "src/app/app.module.ts" ]; then
        # Add missing imports
        cat > "src/app/app.module.ts" << 'EOF'
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import components with correct names
import { ImageCardComponent } from './components/image-card/image-card.component';
import { ImageThumbnailComponent } from './components/image-thumbnail/image-thumbnail.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { HomeComponent } from './pages/home/home.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { TrashComponent } from './pages/trash/trash.component';

@NgModule({
  declarations: [
    AppComponent,
    ImageCardComponent,
    ImageThumbnailComponent,
    ImageUploadComponent,
    HomeComponent,
    ArchiveComponent,
    FavoritesComponent,
    TrashComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    // Material modules
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
EOF
        echo "✅ Fixed: app.module.ts"
    fi
}

# Update routing module
fix_routing() {
    echo "🛣️ Fixing routing..."

    if [ -f "src/app/app-routing.module.ts" ]; then
        cat > "src/app/app-routing.module.ts" << 'EOF'
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { TrashComponent } from './pages/trash/trash.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'trash', component: TrashComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
EOF
        echo "✅ Fixed: app-routing.module.ts"
    fi
}

# Run all fixes
main() {
    create_missing_files
    fix_component_files
    fix_test_files
    fix_services
    fix_bootstrap_files
    fix_app_module
    fix_routing

    echo ""
    echo "🎉 All naming convention fixes completed!"
    echo ""
    echo "📋 Summary of changes:"
    echo "  • Fixed component class names (added 'Component' suffix)"
    echo "  • Updated styleUrl to styleUrls arrays"
    echo "  • Created missing SCSS files"
    echo "  • Fixed all test file imports and references"
    echo "  • Updated service class names"
    echo "  • Fixed bootstrap file imports"
    echo "  • Updated app.module.ts with correct imports"
    echo "  • Fixed routing with proper component references"
    echo ""
    echo "🚦 Next steps:"
    echo "  1. Run: ng build --dry-run (to check for compilation errors)"
    echo "  2. Run: ng test (to verify tests pass)"
    echo "  3. Run: ng serve (to start development server)"
    echo ""
}

main
