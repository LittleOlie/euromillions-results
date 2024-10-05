// Global variable to store past draw data and processed counts
let pastDrawData = [];
let numberCounts = {};
let starCounts = {};
let totalDraws = 0;  // Ensure totalDraws is initialized

// Fetching results from the API
async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        // Store the fetched data globally for future use
        pastDrawData = data;
        totalDraws = data.length;

        // Display first date, last date, and total number of draws
        displayDrawInfo(data);

        // Show the last draw
        showLastDraw(data);

        // Calculate highest and least probability numbers and stars
        calculateProbabilities(data);

    } catch (error) {
        console.error('Failed to fetch results:', error);
    }
}

// Show the last draw results
function showLastDraw(data) {
    const lastDraw = data[data.length - 1]; // Last draw is the last item in the array
    const lastDrawList = document.getElementById('lastDraw');

    const listItem = document.createElement('li');

    // Create a span element for the numbers with a white circular background
    const numbersSpan = document.createElement('span');
    numbersSpan.style.fontSize = '20px';
    numbersSpan.innerHTML = lastDraw.numbers.map(num => {
        return `<span style="display: inline-block; background-color: white; border-radius: 50%; padding: 10px; width: 40px; height: 40px; text-align: center; margin-right: 10px;">${num}</span>`;
    }).join('');

    // Create a span element for the stars with a golden circular background
    const starsSpan = document.createElement('span');
    starsSpan.style.fontSize = '20px';
    starsSpan.innerHTML = lastDraw.stars.map(star => {
        return `<span style="display: inline-block; background-color: gold; border-radius: 50%; padding: 10px; width: 40px; height: 40px; text-align: center; margin-right: 10px;">★${star}</span>`;
    }).join('');

    // Set the draw date and prize
    const drawInfo = `Draw on ${lastDraw.date}`;
    const prizeInfo = ` | Prize: ${lastDraw.prize || 'Not available'}`;

    // Append all elements to the list item
    listItem.innerHTML = `${drawInfo}: `;
    listItem.appendChild(numbersSpan);
    listItem.appendChild(starsSpan);
    listItem.innerHTML += prizeInfo;

    // Add the list item to the DOM
    lastDrawList.appendChild(listItem);
}

// Display draw information (first draw, last draw, and total draws)
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

// Calculate probabilities of numbers and stars
function calculateProbabilities(data) {
    numberCounts = {};
    starCounts = {};

    // Count occurrences of each number and star
    data.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Sort numbers and stars by frequency
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);

    const numberLabels = sortedNumbers.map(item => `${item[0]} (${item[1]} draws)`);
    const numberFrequencies = sortedNumbers.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    const starLabels = sortedStars.map(item => `${item[0]} (${item[1]} draws)`);
    const starFrequencies = sortedStars.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    // Create charts
    createChart('numberChart', 'Number Frequencies (%)', numberLabels, numberFrequencies, false);
    createChart('starChart', 'Star Frequencies (%)', starLabels, starFrequencies, true);

    // Get top and least frequent numbers and stars
    const topNumbers = sortedNumbers.slice(0, 10).map(item => item[0]);
    const leastNumbers = sortedNumbers.slice(-10).map(item => item[0]);
    const topStars = sortedStars.slice(0, 4).map(item => item[0]);
    const leastStars = sortedStars.slice(-4).map(item => item[0]);

    displayNumberSets(topNumbers, topStars, leastNumbers, leastStars);
}

// [other functions from the code remain unchanged]

document.addEventListener('DOMContentLoaded', fetchResults);
document.getElementById('generateLuckyPickForm').addEventListener('submit', generateLuckyPick);
