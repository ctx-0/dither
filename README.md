# Dithering

*work in progress*


## Algorithms

- **Floyd-Steinberg** - Error diffusion with 7/16, 3/16, 5/16, 1/16 distribution
- **Atkinson** - Error diffusion; distributes 3/4 of error to 6 neighbors, preserves 1/4
- **Bayer 4x4** - Ordered dither using a 4×4 Bayer threshold matrix
- **Bayer 8x8** - Ordered dither using an 8×8 Bayer threshold matrix for smoother results
- **Noise** - Random threshold modulation (±64 range) per pixel
- **Threshold** - Direct nearest-color quantization without dithering

## Color Palettes

- **1-bit BW** (2 colors) - Black and white
- **3-bit RGB** (8 colors) - Classic RGB cube with all combinations
- **Red-White** (2 colors) - Dark red and white
- **Blue-Amber** (2 colors) - Dark blue and amber
- **Cyanotype** (4 colors) - Blue-toned photographic palette
- **GameBoy** (4 colors) - Original Game Boy green palette
- **CGA** (4 colors) - CGA Mode 5 palette (black, cyan, magenta, gray)
- **Amber** (2 colors) - Amber monochrome monitor
- **CMYK** (4 colors) - Cyan, magenta, yellow, black
- **Green Phosphor** (2 colors) - Classic phosphor green terminal/monitor

*Note: Color Distance Squared Euclidean*