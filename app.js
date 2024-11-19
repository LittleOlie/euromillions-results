// Fetching results from the API
async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        // Display first date, last date, and total number of draws
        displayDrawInfo(data);

        // Show the last draw
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

// Function to display first date, last date, and total number of draws
function displayDrawInfo(data) {
    const totalDraws = data.length;

    if (totalDraws > 0) {
        const firstDrawDate = new Date(data[0].date).toLocaleDateString();
        const lastDrawDate = new Date(data[totalDraws - 1].date).toLocaleDateString();

        document.getElementById('drawInfo').textContent = 
            `Total Draws: ${totalDraws}, First Draw: ${firstDrawDate}, Last Draw: ${lastDrawDate}`;
    } else {
        document.getElementById('drawInfo').textContent = 'No draw data available.';
    }
}

// Analyze draws for frequent numbers, patterns, and outliers
function analyzeDraws(data) {
    const numberCounts = {};
    const starCounts = {};
    const allNumbers = [];
    const allStars = [];
    const totalDraws = data.length;

    // Collect all numbers and stars
    data.forEach(draw => {
        draw.numbers.forEach(num => allNumbers.push(num));
        draw.stars.forEach(star => allStars.push(star));

        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Sort numbers and stars by frequency
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);

    // Prepare data for charts
    const numberLabels = sortedNumbers.map(item => `${item[0]} (${item[1]} draws)`);
    const numberFrequencies = sortedNumbers.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    const starLabels = sortedStars.map(item => `${item[0]} (${item[1]} draws)`);
    const starFrequencies = sortedStars.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    // Create charts
    createChart('numberChart', 'Number Frequencies (%)', numberLabels, numberFrequencies, false);
    createChart('starChart', 'Star Frequencies (%)', starLabels, starFrequencies, true);

    // Display frequent and least frequent numbers and stars
    const topNumbers = sortedNumbers.slice(0, 5).map(item => item[0]);
    const leastNumbers = sortedNumbers.slice(-5).map(item => item[0]);
    const topStars = sortedStars.slice(0, 2).map(item => item[0]);
    const leastStars = sortedStars.slice(-2).map(item => item[0]);

    displayNumberSets(topNumbers, topStars, leastNumbers, leastStars);
}

// Helper function to create charts
function createChart(canvasId, label, labels, data, isStarChart = false) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true },
                x: { title: { display: true, text: 'Numbers/Stars' } }
            }
        }
    });
}

// On page load, fetch data
fetchResults();
