const fs = require('fs');
const path = require('path');

// Define the correct file mappings
const fileMappings = [
  // Models (remove .component)
  {
    from: 'src/app/models/image.component.ts',
    to: 'src/app/models/image.ts'
  },

  // Services (fix naming)
  {
    from: 'src/app/services/auth.component.ts',
    to: 'src/app/services/auth.service.ts'
  },

  // Config files (remove .component)
  {
    from: 'src/app/app.config.component.ts',
    to: 'src/app/app.config.ts'
  },
  {
    from: 'src/app/app.config.server.component.ts',
    to: 'src/app/app.config.server.ts'
  },
  {
    from: 'src/app/app.routes.component.ts',
    to: 'src/app/app.routes.ts'
  },
  {
    from: 'src/app/app.routes.server.component.ts',
    to: 'src/app/app.routes.server.ts'
  },

  // Modules (fix naming)
  {
    from: 'src/app/core/core-module.component.ts',
    to: 'src/app/core/core.module.ts'
  },
  {
    from: 'src/app/features/features-module.component.ts',
    to: 'src/app/features/features.module.ts'
  },
  {
    from: 'src/app/shared/shared-module.component.ts',
    to: 'src/app/shared/shared.module.ts'
  },

  // HTML files (add .component)
  {
    from: 'src/app/components/image-card/image-card.html',
    to: 'src/app/components/image-card/image-card.component.html'
  },
  {
    from: 'src/app/components/image-thumbnail/image-thumbnail.html',
    to: 'src/app/components/image-thumbnail/image-thumbnail.component.html'
  },
  {
    from: 'src/app/components/image-upload/image-upload.html',
    to: 'src/app/components/image-upload/image-upload.component.html'
  },
  {
    from: 'src/app/pages/archive/archive.html',
    to: 'src/app/pages/archive/archive.component.html'
  },
  {
    from: 'src/app/pages/favorites/favorites.html',
    to: 'src/app/pages/favorites/favorites.component.html'
  },
  {
    from: 'src/app/pages/home/home.html',
    to: 'src/app/pages/home/home.component.html'
  },
  {
    from: 'src/app/pages/trash/trash.html',
    to: 'src/app/pages/trash/trash.component.html'
  },
  {
    from: 'src/app/app.html',
    to: 'src/app/app.component.html'
  }
];

// Content replacements for fixing class names and references
const contentReplacements = [
  // Fix class names
  {
    file: 'src/app/components/image-thumbnail/image-thumbnail.component.ts',
    replacements: [
      { from: 'export class ImageThumbnail', to: 'export class ImageThumbnailComponent' },
      { from: "templateUrl: './image-thumbnail.html'", to: "templateUrl: './image-thumbnail.component.html'" },
      { from: "styleUrl: './image-thumbnail.css'", to: "styleUrls: ['./image-thumbnail.component.scss']" }
    ]
  },
  {
    file: 'src/app/components/image-upload/image-upload.component.ts',
    replacements: [
      { from: 'export class ImageUpload', to: 'export class ImageUploadComponent' },
      { from: "templateUrl: './image-upload.html'", to: "templateUrl: './image-upload.component.html'" },
      { from: "styleUrl: './image-upload.css'", to: "styleUrls: ['./image-upload.component.scss']" }
    ]
  },
  {
    file: 'src/app/pages/archive/archive.component.ts',
    replacements: [
      { from: 'export class Archive', to: 'export class ArchiveComponent' },
      { from: "templateUrl: './archive.html'", to: "templateUrl: './archive.component.html'" },
      { from: "styleUrl: './archive.css'", to: "styleUrls: ['./archive.component.scss']" }
    ]
  },
  {
    file: 'src/app/pages/favorites/favorites.component.ts',
    replacements: [
      { from: 'export class Favorites', to: 'export class FavoritesComponent' },
      { from: "templateUrl: './favorites.html'", to: "templateUrl: './favorites.component.html'" },
      { from: "styleUrl: './favorites.css'", to: "styleUrls: ['./favorites.component.scss']" }
    ]
  },
  {
    file: 'src/app/pages/home/home.component.ts',
    replacements: [
      { from: "templateUrl: './home.component.html'", to: "templateUrl: './home.component.html'" },
      { from: "styleUrls: ['./home.component.scss']", to: "styleUrls: ['./home.component.scss']" }
    ]
  },
  {
    file: 'src/app/pages/trash/trash.component.ts',
    replacements: [
      { from: 'export class Trash', to: 'export class TrashComponent' },
      { from: "templateUrl: './trash.html'", to: "templateUrl: './trash.component.html'" },
      { from: "styleUrl: './trash.css'", to: "styleUrls: ['./trash.component.scss']" }
    ]
  },
  {
    file: 'src/app/services/auth.service.ts',
    replacements: [
      { from: 'export class Auth', to: 'export class AuthService' }
    ]
  },
  {
    file: 'src/app/app.component.ts',
    replacements: [
      { from: 'export class App', to: 'export class AppComponent' },
      { from: "templateUrl: './app.component.html'", to: "templateUrl: './app.component.html'" },
      { from: "styleUrl: './app.css'", to: "styleUrls: ['./app.component.scss']" }
    ]
  }
];

// Test file updates
const testFileUpdates = [
  {
    file: 'src/app/components/image-card/image-card.spec.ts',
    replacements: [
      { from: "import { ImageCard } from './image-card';", to: "import { ImageCardComponent } from './image-card.component';" },
      { from: 'let component: ImageCard;', to: 'let component: ImageCardComponent;' },
      { from: 'let fixture: ComponentFixture<ImageCard>;', to: 'let fixture: ComponentFixture<ImageCardComponent>;' },
      { from: 'imports: [ImageCard]', to: 'imports: [ImageCardComponent]' },
      { from: 'fixture = TestBed.createComponent(ImageCard);', to: 'fixture = TestBed.createComponent(ImageCardComponent);' }
    ]
  },
  {
    file: 'src/app/components/image-thumbnail/image-thumbnail.spec.ts',
    replacements: [
      { from: "import { ImageThumbnail } from './image-thumbnail';", to: "import { ImageThumbnailComponent } from './image-thumbnail.component';" },
      { from: 'let component: ImageThumbnail;', to: 'let component: ImageThumbnailComponent;' },
      { from: 'let fixture: ComponentFixture<ImageThumbnail>;', to: 'let fixture: ComponentFixture<ImageThumbnailComponent>;' },
      { from: 'imports: [ImageThumbnail]', to: 'imports: [ImageThumbnailComponent]' },
      { from: 'fixture = TestBed.createComponent(ImageThumbnail);', to: 'fixture = TestBed.createComponent(ImageThumbnailComponent);' }
    ]
  },
  {
    file: 'src/app/components/image-upload/image-upload.spec.ts',
    replacements: [
      { from: "import { ImageUpload } from './image-upload';", to: "import { ImageUploadComponent } from './image-upload.component';" },
      { from: 'let component: ImageUpload;', to: 'let component: ImageUploadComponent;' },
      { from: 'let fixture: ComponentFixture<ImageUpload>;', to: 'let fixture: ComponentFixture<ImageUploadComponent>;' },
      { from: 'imports: [ImageUpload]', to: 'imports: [ImageUploadComponent]' },
      { from: 'fixture = TestBed.createComponent(ImageUpload);', to: 'fixture = TestBed.createComponent(ImageUploadComponent);' }
    ]
  }
  // Add similar patterns for other test files...
];

function renameFiles() {
  console.log('🔄 Starting file renames...\n');

  fileMappings.forEach(mapping => {
    if (fs.existsSync(mapping.from)) {
      // Create directory if it doesn't exist
      const dir = path.dirname(mapping.to);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.renameSync(mapping.from, mapping.to);
      console.log(`✅ Renamed: ${mapping.from} → ${mapping.to}`);
    } else {
      console.log(`⚠️  File not found: ${mapping.from}`);
    }
  });
}

function updateFileContents() {
  console.log('\n🔄 Updating file contents...\n');

  contentReplacements.forEach(fileUpdate => {
    if (fs.existsSync(fileUpdate.file)) {
      let content = fs.readFileSync(fileUpdate.file, 'utf8');
      let changed = false;

      fileUpdate.replacements.forEach(replacement => {
        if (content.includes(replacement.from)) {
          content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(fileUpdate.file, content);
        console.log(`✅ Updated content: ${fileUpdate.file}`);
      }
    } else {
      console.log(`⚠️  File not found: ${fileUpdate.file}`);
    }
  });
}

function updateTestFiles() {
  console.log('\n🔄 Updating test files...\n');

  testFileUpdates.forEach(fileUpdate => {
    if (fs.existsSync(fileUpdate.file)) {
      let content = fs.readFileSync(fileUpdate.file, 'utf8');
      let changed = false;

      fileUpdate.replacements.forEach(replacement => {
        if (content.includes(replacement.from)) {
          content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(fileUpdate.file, content);
        console.log(`✅ Updated test file: ${fileUpdate.file}`);
      }
    } else {
      console.log(`⚠️  Test file not found: ${fileUpdate.file}`);
    }
  });
}

function createMissingStyleFiles() {
  console.log('\n🔄 Creating missing SCSS files...\n');

  const scssFiles = [
    'src/app/components/image-thumbnail/image-thumbnail.component.scss',
    'src/app/components/image-upload/image-upload.component.scss',
    'src/app/pages/archive/archive.component.scss',
    'src/app/pages/favorites/favorites.component.scss',
    'src/app/pages/trash/trash.component.scss',
    'src/app/app.component.scss'
  ];

  scssFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, '/* Component styles */\n');
      console.log(`✅ Created: ${file}`);
    }
  });
}

function updateImportStatements() {
  console.log('\n🔄 Updating import statements...\n');

  // Update main.ts
  const mainFile = 'src/main.ts';
  if (fs.existsSync(mainFile)) {
    let content = fs.readFileSync(mainFile, 'utf8');
    content = content.replace("import { App } from './app/app';", "import { AppComponent } from './app/app.component';");
    content = content.replace('bootstrapApplication(App, appConfig)', 'bootstrapApplication(AppComponent, appConfig)');
    fs.writeFileSync(mainFile, content);
    console.log(`✅ Updated: ${mainFile}`);
  }

  // Update main.server.ts
  const mainServerFile = 'src/main.server.ts';
  if (fs.existsSync(mainServerFile)) {
    let content = fs.readFileSync(mainServerFile, 'utf8');
    content = content.replace("import { App } from './app/app';", "import { AppComponent } from './app/app.component';");
    content = content.replace('const bootstrap = () => bootstrapApplication(App, config);', 'const bootstrap = () => bootstrapApplication(AppComponent, config);');
    fs.writeFileSync(mainServerFile, content);
    console.log(`✅ Updated: ${mainServerFile}`);
  }
}

// Run all fixes
console.log('🚀 Starting Angular naming convention fixes...\n');

try {
  renameFiles();
  updateFileContents();
  updateTestFiles();
  createMissingStyleFiles();
  updateImportStatements();

  console.log('\n🎉 All naming convention fixes completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your app.module.ts declarations with the new component names');
  console.log('2. Update any routing files with the new component names');
  console.log('3. Run: ng build to check for any remaining issues');
  console.log('4. Run: ng test to verify tests still work');

} catch (error) {
  console.error('❌ Error during fixes:', error);
}
