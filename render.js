// CET-L08 color map values (perceptually uniform)
const CET_L08_COLORS = [
    [27, 27, 27],      // Dark gray
    [43, 51, 148],     // Dark blue
    [49, 103, 219],    // Blue
    [65, 156, 241],    // Light blue
    [96, 198, 216],    // Cyan
    [139, 224, 183],   // Light cyan
    [188, 238, 153],   // Light green
    [236, 237, 137],   // Yellow
    [254, 219, 139],   // Light orange
    [252, 187, 145],   // Orange
    [242, 150, 152],   // Light red
    [221, 114, 158],   // Pink
    [188, 84, 157],    // Purple
    [147, 61, 143],    // Dark purple
    [98, 46, 115]      // Darker purple
];

function numberToColor(number) {
    // Convert number (0-100) to index in color map (0-8)
    const position = (number / 100) * (CET_L08_COLORS.length - 1);
    const index = Math.floor(position);
    const remainder = position - index;

    // If exactly on a color, return it
    if (remainder === 0) {
        const [r, g, b] = CET_L08_COLORS[index];
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Otherwise interpolate between two closest colors
    const color1 = CET_L08_COLORS[index];
    const color2 = CET_L08_COLORS[index + 1];
    
    const r = Math.round(color1[0] * (1 - remainder) + color2[0] * remainder);
    const g = Math.round(color1[1] * (1 - remainder) + color2[1] * remainder);
    const b = Math.round(color1[2] * (1 - remainder) + color2[2] * remainder);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function drawGrid(SQUARE_SIZE, GRID_WIDTH, GRID_HEIGHT, fitnessValues) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

    // Calculate the starting position to center the grid
    const startX = (canvas.width - (SQUARE_SIZE * GRID_WIDTH)) / 2;
    const startY = (canvas.height - (SQUARE_SIZE * GRID_HEIGHT)) / 2;

    // Draw the grid using the stored values
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const randomNumber = fitnessValues[row][col]; // Get the number from the grid

            let color;
            if (isLand(row,col)) {
                color = numberToColor(randomNumber); // Convert number to color
            } else {
                color = `rgb(150, 180, 255)`;
            }
            ctx.fillStyle = color; // Set the fill color based on the number
            const xMin = Math.floor((col - 0.5) * SQUARE_SIZE);
            const xMax = Math.ceil((col + 0.5) * SQUARE_SIZE);
            const yMin = Math.floor((row - 0.5) * SQUARE_SIZE);
            const yMax = Math.ceil((row + 0.5) * SQUARE_SIZE);
            ctx.fillRect(
                (xMax + xMin) / 2 + startX,
                (yMax + yMin) / 2 + startY,
                xMax - xMin,
                yMax - yMin
            );
        }
    }
}