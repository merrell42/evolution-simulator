function mutateGrid() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!isLand(y, x)) { continue; }
            const change = random(mutation * bias, mutation);
            fitness[y][x] = clamp(fitness[y][x] + change, 0, 100);
        }
    }
}

function invadeNeighbors() {
    for (let i = 0; i < attemptsPerCell * height * width; i++) {
        const [x0, y0] = randomUniform(height, width);
        const x1 = x0 + random(0, dispersal);
        const y1 = y0 + random(0, dispersal);
        if (fitness[y1][x1] < fitness[y0][x0] && isLand(y0, x0) && isLand(y1, x1)) {
            fitness[y1][x1] = fitness[y0][x0];
        }
    }
}

