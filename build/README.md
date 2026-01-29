# Build Resources

## Required Files

Place the following files in this directory:

### 1. Application Icon
- **icon.png** (512x512 px minimum, PNG format)
  - Will be automatically converted to icon.ico with multiple sizes
  - OR directly provide **icon.ico** with embedded sizes: 256, 128, 64, 48, 32, 16

### 2. Installer Graphics (Optional - will use defaults if not provided)
- **installerSidebar.bmp** (164 x 314 pixels)
  - Sidebar image for NSIS installer
  
- **installerHeader.bmp** (150 x 57 pixels)
  - Header image for NSIS installer

## Current Status
✅ Folder created
⏳ Waiting for icon.png or icon.ico

## How to Add Files
1. Copy your logo file to this folder
2. Rename it to `icon.png` (or `icon.ico`)
3. Run `npm run build` to build the React app
4. Run `npm run build:electron` to create the installer

## Icon Requirements
- Format: PNG (will be converted) or ICO (multi-size)
- Minimum size: 512x512 px for PNG
- Square aspect ratio
- Transparent background recommended
