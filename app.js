// Fetching results from the API
async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        // Display last draw results
        showLastDraw(data);

        // Analyze the draws
        analyzeDraws(data);

    } catch (error) {
        console.error('Failed to fetch results:', error);
    }
}

// Show the last draw results
function showLastDraw(data) {
    const lastDraw = data[data.length - 1];
    const lastDrawList = document.getElementById('lastDraw');

    const listItem = document.createElement('li');
    listItem.textContent = `Draw on ${lastDraw.date}: Numbers: ${lastDraw.numbers.join(', ')} | Stars: ${lastDraw.stars.join(', ')} | Prize: ${lastDraw.prize || 'Not available'}`;
    lastDrawList.appendChild(listItem);
}

// Analyze the draws and display insights
function analyzeDraws(data) {
    const numberCounts = {};
    const starCounts = {};
    const allNumbers = [];
    const allStars = [];
    const sequentialNumbers = [];
    const totalDraws = data.length;

    // Collect all numbers and stars
    data.forEach(draw => {
        draw.numbers.forEach(num => allNumbers.push(num));
        draw.stars.forEach(star => allStars.push(star));

        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);

        // Check for sequential numbers
        for (let i = 0; i < draw.numbers.length - 1; i++) {
            if (draw.numbers[i] + 1 === draw.numbers[i + 1]) {
                sequentialNumbers.push(draw.numbers.slice(i, i + 2).join('-'));
            }
        }
    });

    // Calculate statistics
    const stats = calculateStatistics(allNumbers);
    displayStatistics(stats);

    // Display frequent numbers
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const topNumbers = sortedNumbers.slice(0, 5).map(item => `${item[0]} (${item[1]} times)`);

    document.getElementById('frequentNumbers').textContent = `Most Frequent Numbers: ${topNumbers.join(', ')}`;

    // Display number patterns
    const pattern = analyzeLowHighPattern(allNumbers);
    document.getElementById('numberPatterns').textContent = `Low Numbers (1-25): ${pattern.lowNumbers}, High Numbers (26-50): ${pattern.highNumbers}`;

    // Display Lucky Stars analysis
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);
    const topStars = sortedStars.slice(0, 2).map(item => `${item[0]} (${item[1]} times)`);

    document.getElementById('luckyStars').textContent = `Most Frequent Stars: ${topStars.join(', ')}`;

    // Display sequential numbers
    document.getElementById('sequentialNumbers').textContent = `Sequential Numbers: ${sequentialNumbers.join(', ')}`;

    // Display outliers
    const outliers = sortedNumbers.filter(item => item[1] === 1).map(item => item[0]);
    document.getElementById('outliers').textContent = `Outliers (Appeared only once): ${outliers.join(', ')}`;
}

// Analyze number patterns (low vs. high numbers)
function analyzeLowHighPattern(allNumbers) {
    const lowNumbers = allNumbers.filter(num => num <= 25); // Numbers between 1 and 25
    const highNumbers = allNumbers.filter(num => num > 25); // Numbers between 26 and 50

    return {
        lowNumbers: lowNumbers.length,
        highNumbers: highNumbers.length
    };
}

// Calculate statistics (mean, median, standard deviation)
function calculateStatistics(numbers) {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const median = getMedian(numbers);
    const standardDeviation = Math.sqrt(numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length);

    return { mean, median, standardDeviation };
}

function getMedian(numbers) {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sortedNumbers.length / 2);
    return sortedNumbers.length % 2 === 0 ? (sortedNumbers[middle - 1] + sortedNumbers[middle]) / 2 : sortedNumbers[middle];
}

// Display statistics
function displayStatistics(stats) {
    document.getElementById('meanMedian').textContent = `Mean: ${stats.mean.toFixed(2)}, Median: ${stats.median}`;
    document.getElementById('standardDeviation').textContent = `Standard Deviation: ${stats.standardDeviation.toFixed(2)}`;
    document.getElementById('distribution').textContent = `Numbers are evenly distributed across the range: ${(stats.standardDeviation < 15) ? 'Yes' : 'No'}`;
}

// On page load, fetch data
fetchResults();
