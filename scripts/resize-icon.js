/**
 * Icon Padding Script for macOS
 *
 * This script adds proper macOS-style margins to app icons.
 * macOS icons should have ~10% transparent padding on each side
 * to appear consistent with other system icons in the dock.
 *
 * Usage:
 *   node scripts/resize-icon.js [input] [output] [padding-percent]
 *
 * Examples:
 *   node scripts/resize-icon.js                                    # Uses defaults
 *   node scripts/resize-icon.js apps/electron/src/assets/logo.png  # Custom input
 *   node scripts/resize-icon.js input.png output.png 15            # Custom padding
 *
 * Requirements:
 *   npm install sharp --save-dev (in apps/electron)
 *
 * Parameters:
 *   input          - Path to input PNG (default: apps/electron/src/assets/logo.png)
 *   output         - Path to output PNG (default: apps/electron/src/assets/logo-padded.png)
 *   padding-percent - Padding percentage per side (default: 10)
 */

const sharp = require('sharp')
const path = require('path')

const args = process.argv.slice(2)

const rootDir = path.join(__dirname, '..')
const inputPath = args[0] || path.join(rootDir, 'apps/electron/src/assets/logo.png')
const outputPath = args[1] || path.join(rootDir, 'apps/electron/src/assets/logo-padded.png')
const paddingPercent = parseInt(args[2], 10) || 10

async function addIconPadding() {
  try {
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata()
    const originalSize = metadata.width

    if (metadata.width !== metadata.height) {
      console.error('Error: Icon must be square (width === height)')
      process.exit(1)
    }

    // Calculate new sizes
    // padding on each side = paddingPercent% of original size
    const padding = Math.round(originalSize * (paddingPercent / 100))
    const newArtworkSize = originalSize - padding * 2

    console.log(`Input: ${inputPath}`)
    console.log(`Output: ${outputPath}`)
    console.log(`Original size: ${originalSize}x${originalSize}`)
    console.log(`Padding: ${padding}px per side (${paddingPercent}%)`)
    console.log(`Artwork size: ${newArtworkSize}x${newArtworkSize}`)

    // Resize and add transparent padding
    await sharp(inputPath)
      .resize(newArtworkSize, newArtworkSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(outputPath)

    console.log(`\nSuccess! Created ${outputPath} with macOS-style margins`)
  } catch (error) {
    console.error('Error processing icon:', error.message)
    process.exit(1)
  }
}

addIconPadding()
