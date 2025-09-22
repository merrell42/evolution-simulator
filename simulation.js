function mutateGrid() {
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            if (!isLand(row, col)) {
                continue;
            }
            const currentValue = fitnessValues[row][col];
            const shift = generateNormalRandom(mutationAmount * mutationBias, mutationAmount);
            fitnessValues[row][col] = Math.max(0, Math.min(100, currentValue + shift));
        }
    }
}

function invadeNeighbors() {
    const attempts = attemptPerCell * GRID_HEIGHT * GRID_WIDTH;
    for (let i = 0; i < attempts; i++) {
        // Randomly pick a start location and a nearby end location.
        const startX = Math.floor(Math.random() * GRID_WIDTH);
        const startY = Math.floor(Math.random() * GRID_HEIGHT);
        
        const endX = Math.round(startX + generateNormalRandom(0, dispersalAmount));
        const endY = Math.round(startY + generateNormalRandom(0, dispersalAmount));

        // Check if end position is within the grid bounds.
        if (endX < 0 || endX >= GRID_WIDTH || endY < 0 || endY >= GRID_HEIGHT) {
            continue;
        }
        // Check if start and end position are on land.
        if (!isLand(startY, startX) || !isLand(endY, endX)) {
            continue;
        }

        // Invade if the start location has higher fitness.
        if (fitnessValues[startY][startX] > fitnessValues[endY][endX]) {
            fitnessValues[endY][endX] = fitnessValues[startY][startX];
        }
    }
}