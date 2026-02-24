const upload = document.getElementById('upload');
const mainRow = document.getElementById('mainRow');
const grid = document.getElementById('grid');
const mainSection = document.getElementById('mainSection');
const gridSection = document.getElementById('gridSection');

let originalImage = null;

const algorithms = {
    'Floyd-Steinberg': floydSteinberg,
    'Atkinson': atkinson,
    'Bayer 4x4': bayer4x4,
    'Bayer 8x8': bayer8x8
};

const palettes = {
    '1-bit BW': [[0,0,0], [255,255,255]],
    '3-bit RGB': [[0,0,0], [255,0,0], [0,255,0], [255,255,0], [0,0,255], [255,0,255], [0,255,255], [255,255,255]],
    'Red-White': [[139,0,0], [255,255,255]],
    'Blue-Amber': [[0,0,139], [255,191,0]],
    'Cyanotype': [[0,0,0], [0,64,128], [0,96,192], [255,255,255]],
    'GameBoy': [[15,56,15], [48,98,48], [139,172,15], [155,188,15]],
    'CGA': [[0,0,0], [0,170,170], [170,0,170], [170,170,170]],
    'Amber': [[255,176,0], [0,0,0]],
    'Green Phosphor': [[20,20,20], [51,255,51]]
};

const PRELOADED_IMAGE_URL = './boccher.jpg';

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        originalImage = img;
        processImage();
    };
    img.src = src;
}

// Load preloaded image on page load
window.addEventListener('load', () => {
    loadImage(PRELOADED_IMAGE_URL);
});

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        loadImage(event.target.result);
    };
    reader.readAsDataURL(file);
});

function processImage() {
    if (!originalImage) return;
    
    const w = 200;
    const h = Math.round(originalImage.height * (w / originalImage.width));
    
    mainRow.innerHTML = '';
    const bwPalette = [[0,0,0], [255,255,255]];
    
    Object.entries(algorithms).forEach(([algoName, algoFunc]) => {
        const item = document.createElement('div');
        item.className = 'main-item';
        
        const label = document.createElement('div');
        label.className = 'main-item-label';
        label.textContent = algoName;
        item.appendChild(label);
        
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const cx = c.getContext('2d');
        cx.drawImage(originalImage, 0, 0, w, h);
        
        const data = cx.getImageData(0, 0, w, h);
        const result = algoFunc(data, bwPalette);
        cx.putImageData(result, 0, 0);
        
        item.appendChild(c);
        mainRow.appendChild(item);
    });
    
    mainSection.style.display = 'block';
    
    const gridW = 200;
    const gridH = Math.round(originalImage.height * (gridW / originalImage.width));
    
    grid.innerHTML = '';
    
    Object.entries(algorithms).forEach(([algoName, algoFunc]) => {
        Object.entries(palettes).forEach(([palName, palette]) => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Content wrapper (algo label + canvas)
            const content = document.createElement('div');
            content.className = 'cell-content';
            
            // Algo name at top
            const algoLabel = document.createElement('div');
            algoLabel.className = 'algo-label';
            algoLabel.textContent = algoName;
            content.appendChild(algoLabel);
            
            // Canvas
            const c = document.createElement('canvas');
            c.width = gridW;
            c.height = gridH;
            const cx = c.getContext('2d');
            cx.drawImage(originalImage, 0, 0, gridW, gridH);
            
            const data = cx.getImageData(0, 0, gridW, gridH);
            const result = algoFunc(data, palette);
            cx.putImageData(result, 0, 0);
            content.appendChild(c);
            
            cell.appendChild(content);
            
            // Palette name on right (vertical)
            const palLabel = document.createElement('div');
            palLabel.className = 'palette-label';
            palLabel.textContent = palName;
            cell.appendChild(palLabel);
            
            grid.appendChild(cell);
        });
    });
    
    gridSection.style.display = 'block';
}

function findClosestColor(r, g, b, palette) {
    let minDist = Infinity;
    let closest = palette[0];
    
    for (const color of palette) {
        const dr = r - color[0];
        const dg = g - color[1];
        const db = b - color[2];
        const dist = dr*dr + dg*dg + db*db;
        
        if (dist < minDist) {
            minDist = dist;
            closest = color;
        }
    }
    return closest;
}

function floydSteinberg(imgData, palette) {
    const data = new Uint8ClampedArray(imgData.data);
    const w = imgData.width;
    const h = imgData.height;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const oldR = data[i];
            const oldG = data[i+1];
            const oldB = data[i+2];
            
            const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB, palette);
            
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
            
            const errR = oldR - newR;
            const errG = oldG - newG;
            const errB = oldB - newB;
            
            if (x + 1 < w) {
                const j = i + 4;
                data[j] += errR * 7/16;
                data[j+1] += errG * 7/16;
                data[j+2] += errB * 7/16;
            }
            if (x > 0 && y + 1 < h) {
                const j = i + w * 4 - 4;
                data[j] += errR * 3/16;
                data[j+1] += errG * 3/16;
                data[j+2] += errB * 3/16;
            }
            if (y + 1 < h) {
                const j = i + w * 4;
                data[j] += errR * 5/16;
                data[j+1] += errG * 5/16;
                data[j+2] += errB * 5/16;
            }
            if (x + 1 < w && y + 1 < h) {
                const j = i + w * 4 + 4;
                data[j] += errR * 1/16;
                data[j+1] += errG * 1/16;
                data[j+2] += errB * 1/16;
            }
        }
    }
    
    return new ImageData(data, w, h);
}

function atkinson(imgData, palette) {
    const data = new Uint8ClampedArray(imgData.data);
    const w = imgData.width;
    const h = imgData.height;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const oldR = data[i];
            const oldG = data[i+1];
            const oldB = data[i+2];
            
            const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB, palette);
            
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
            
            const errR = (oldR - newR) / 8;
            const errG = (oldG - newG) / 8;
            const errB = (oldB - newB) / 8;
            
            const offsets = [
                [1, 0], [2, 0],
                [-1, 1], [0, 1], [1, 1],
                [0, 2]
            ];
            
            for (const [dx, dy] of offsets) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < w && ny < h) {
                    const j = (ny * w + nx) * 4;
                    data[j] += errR;
                    data[j+1] += errG;
                    data[j+2] += errB;
                }
            }
        }
    }
    
    return new ImageData(data, w, h);
}

const bayer4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
].map(row => row.map(v => (v / 16 - 0.5) * 255)); // Pre-compute to [-127.5, 127.5] range

function bayer4x4(imgData, palette) {
    const data = new Uint8ClampedArray(imgData.data);
    const w = imgData.width;
    const h = imgData.height;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const threshold = bayer4[y % 4][x % 4];
            
            // Apply threshold modulation to each channel, then find closest color
            const r = Math.min(255, Math.max(0, data[i] + threshold));
            const g = Math.min(255, Math.max(0, data[i+1] + threshold));
            const b = Math.min(255, Math.max(0, data[i+2] + threshold));
            
            const [newR, newG, newB] = findClosestColor(r, g, b, palette);
            
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
        }
    }
    
    return new ImageData(data, w, h);
}

const bayer8 = [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21]
].map(row => row.map(v => (v / 64 - 0.5) * 255)); // Pre-compute to [-127.5, 127.5] range

function bayer8x8(imgData, palette) {
    const data = new Uint8ClampedArray(imgData.data);
    const w = imgData.width;
    const h = imgData.height;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const threshold = bayer8[y % 8][x % 8];
            
            // Apply threshold modulation to each channel, then find closest color
            const r = Math.min(255, Math.max(0, data[i] + threshold));
            const g = Math.min(255, Math.max(0, data[i+1] + threshold));
            const b = Math.min(255, Math.max(0, data[i+2] + threshold));
            
            const [newR, newG, newB] = findClosestColor(r, g, b, palette);
            
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
        }
    }
    
    return new ImageData(data, w, h);
}

// Removed: Noise, Threshold algorithms
