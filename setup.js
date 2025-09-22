const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const MARGIN_X = 20;
const MARGIN_Y = 60;

const GRID_WIDTH = 320;
const GRID_HEIGHT = 180;

const defaultAttemptPerCell = 2.5;
const defaultDispersalAmount = 1.25;
const defaultMutationBias = -1.75;
const defaultMutationAmount = 2;

/*const GRID_WIDTH = 640;
const GRID_HEIGHT = 360;

const defaultAttemptPerCell = 5;
const defaultDispersalAmount = 2.5;
const defaultMutationBias = -2.65;
const defaultMutationAmount = 3;
*/

let attemptPerCell = defaultAttemptPerCell;
let dispersalAmount = defaultDispersalAmount;
let mutationBias = defaultMutationBias;
let mutationAmount = defaultMutationAmount;

let paused = true;
let stepCounter = 0;
let saveImages = false;
const landValues = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
const fitnessValues = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));

function isLand(y, x) {
    return landValues[y][x] > 0;
}

function loadMap() {
    const value = document.getElementById('mapSelect').value;
    if (value == 'none') {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                landValues[y][x] = 1;
            }
        }
        return;
    }
    let imagePath = '';
    if (value == 'world') {
        imagePath = 'https://i.imgur.com/tydUDiC.png';
    } else if (value == 'melanesia') {
        imagePath = 'https://i.imgur.com/PKquJbE.png';
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Set CORS attribute
        img.src = imagePath;

        img.onload = () => {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Get the pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixelValues = imageData.data;

            const width = imageData.width;
            const height = imageData.height;

            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const imageX = Math.floor(x * width / GRID_WIDTH);
                    const imageY = Math.floor(y * height / GRID_HEIGHT);
                     // Calculate the index for the red channel
                    const index = (imageY * width + imageX) * 4;
                    landValues[y][x] = (pixelValues[index] === 0);
                }
            }

            paused = false;
            setInterval(updateGrid, 30);
        };
    });
}

function computeSquareSize() {
    return Math.min((canvas.width - MARGIN_X) / GRID_WIDTH, (canvas.height - MARGIN_Y) / GRID_HEIGHT);
}

// Function to resize the canvas and adjust the grid
function resizeCanvas() {
    canvas.width = window.innerWidth - MARGIN_X;
    canvas.height = window.innerHeight - MARGIN_Y;

    const SQUARE_SIZE = computeSquareSize();
    drawGrid(SQUARE_SIZE, GRID_WIDTH, GRID_HEIGHT, fitnessValues);
}

function generateNormalRandom(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2); // Box-Muller transform
    return z0 * stdDev + mean; // Scale and shift
}

function updateGrid() {
    if (paused) {
        return;
    }
    mutateGrid();
    invadeNeighbors();
    const squareSize = computeSquareSize();
    drawGrid(squareSize, GRID_WIDTH, GRID_HEIGHT, fitnessValues);
    
    // Save image after drawing the grid.
    saveCanvasAsImage();
    stepCounter++;
}

function updateMap() {
    loadMap();
    reset();
}

// Function to update constants based on slider values
function updateFromSlider() {
    attemptPerCell = parseFloat(document.getElementById('attemptPerCell').value);
    dispersalAmount = parseFloat(document.getElementById('dispersalAmount').value);
    mutationBias = parseFloat(document.getElementById('mutationBias').value);
    mutationAmount = parseFloat(document.getElementById('mutationAmount').value);

    // Update text boxes.
    document.getElementById('attemptPerCellText').value = attemptPerCell;
    document.getElementById('dispersalAmountText').value = dispersalAmount;
    document.getElementById('mutationBiasText').value = mutationBias;
    document.getElementById('mutationAmountText').value = mutationAmount;
}

// Function to update constants based on text box values.
function updateFromTextBox() {
    attemptPerCell = parseFloat(document.getElementById('attemptPerCellText').value);
    dispersalAmount = parseFloat(document.getElementById('dispersalAmountText').value);
    mutationBias = parseFloat(document.getElementById('mutationBiasText').value);
    mutationAmount = parseFloat(document.getElementById('mutationAmountText').value);

    // Update sliders.
    document.getElementById('attemptPerCell').value = attemptPerCell;
    document.getElementById('dispersalAmount').value = dispersalAmount;
    document.getElementById('mutationBias').value = mutationBias;
    document.getElementById('mutationAmount').value = mutationAmount;
}

function setup() {
    loadMap();
    setInterval(updateGrid, 30);

    // Initial resize and draw.
    resizeCanvas();

    // Add event listener for window resize
    window.addEventListener('resize', resizeCanvas);

    document.getElementById('attemptPerCellText').value = defaultAttemptPerCell;
    document.getElementById('attemptPerCell').value = defaultAttemptPerCell;
    document.getElementById('dispersalAmountText').value = defaultDispersalAmount;
    document.getElementById('dispersalAmount').value = defaultDispersalAmount;
    document.getElementById('mutationBiasText').value = defaultMutationBias;
    document.getElementById('mutationBias').value = defaultMutationBias;
    document.getElementById('mutationAmountText').value = defaultMutationAmount;
    document.getElementById('mutationAmount').value = defaultMutationAmount;

    document.getElementById('mapSelect').addEventListener('change', updateMap);
}

function reset() {
    stepCounter = 0;
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            fitnessValues[row][col] = 0
        }
    }
}

function saveCanvasAsImage() {
    if (!saveImages) return;
    
    // Create a temporary link element to trigger download.
    const link = document.createElement('a');
    link.download = `evolution_step_${stepCounter.toString().padStart(6, '0')}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger the download.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleImageSaving() {
    saveImages = document.getElementById('saveImagesCheckbox').checked;
}
