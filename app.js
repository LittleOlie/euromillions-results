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

        // Show the last draw in table format
        showLastDrawInTable(data);

        // Calculate highest and least probability numbers and stars
        calculateProbabilities(data);

    } catch (error) {
        console.error('Failed to fetch results:', error);
    }
}

// Show the last draw results in table format
function showLastDrawInTable(data) {
    const lastDraw = data[data.length - 1]; // Last draw is the last item in the array
    const lastDrawTableBody = document.getElementById('lastDrawTableBody');
    lastDrawTableBody.innerHTML = ''; // Clear previous results

    const row = document.createElement('tr');

    // Numbers in separate columns
    lastDraw.numbers.forEach(num => {
        const cell = document.createElement('td');
        cell.textContent = num;
        row.appendChild(cell);
    });

    // Stars in separate columns
    lastDraw.stars.forEach(star => {
        const cell = document.createElement('td');
        cell.textContent = `★${star}`;
        row.appendChild(cell);
    });

    // Add the row to the table
    lastDrawTableBody.appendChild(row);
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

// Create the chart for numbers or stars
function createChart(canvasId, label, labels, data, isStarChart = false) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const colors = labels.map((_, index) => {
        if (isStarChart) {
            return index < 2 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)';
        } else {
            return index < 5 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)';
        }
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.5', '1')),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Numbers/Stars'
                    }
                }
            }
        }
    });
}

// Display the top and least frequent numbers and stars
function displayNumberSets(topNumbers, topStars, leastNumbers, leastStars) {
    document.getElementById('topNumbers').textContent = `Top 10 Numbers: ${topNumbers.join(', ')}`;
    document.getElementById('topStars').textContent = `Top 4 Stars: ${topStars.join(', ')}`;
    document.getElementById('leastNumbers').textContent = `Least 10 Numbers: ${leastNumbers.join(', ')}`;
    document.getElementById('leastStars').textContent = `Least 4 Stars: ${leastStars.join(', ')}`;
}

// Generate lucky numbers based on user's birthdate and display in a table
function generateLuckyPick(event) {
    event.preventDefault();

    const birthdate = new Date(document.getElementById('birthdate').value);
    if (!birthdate.getTime()) {
        document.getElementById('luckyPickResult').textContent = 'Please enter a valid birthdate.';
        return;
    }

    const day = birthdate.getDate();
    const month = birthdate.getMonth() + 1;
    const year = birthdate.getFullYear();

    let luckyNumbers = [day % 50, month % 50, year % 50, (day + month) % 50, (day + year) % 50];
    let luckyStars = [(day + month) % 12, (month + year) % 12];

    luckyNumbers = luckyNumbers.map(num => num === 0 ? getRandomNumber(1, 50) : num);
    luckyStars = luckyStars.map(star => star === 0 ? getRandomNumber(1, 12) : star);

    luckyNumbers = ensureNoDuplicates(luckyNumbers, 1, 50);
    luckyStars = ensureNoDuplicates(luckyStars, 1, 12);

    displayLuckyPick(luckyNumbers, luckyStars);
}

// Display lucky pick in a table
function displayLuckyPick(luckyNumbers, luckyStars) {
    const luckyPickTable = document.getElementById('luckyPickTable');
    luckyPickTable.innerHTML = ''; // Clear previous picks

    const row = document.createElement('tr');

    // Add lucky numbers
    luckyNumbers.forEach(num => {
        const cell = document.createElement('td');
        cell.textContent = num;
        row.appendChild(cell);
    });

    // Add lucky stars
    luckyStars.forEach(star => {
        const cell = document.createElement('td');
        cell.textContent = `★${star}`;
        row.appendChild(cell);
    });

    // Append the row to the table
    luckyPickTable.appendChild(row);
}

// Ensure no duplicates in lucky picks
function ensureNoDuplicates(array, min, max) {
    let uniqueArray = [...new Set(array)];
    while (uniqueArray.length < array.length) {
        uniqueArray.push(getRandomNumber(min, max));
        uniqueArray = [...new Set(uniqueArray)];
    }
    return uniqueArray;
}

// Get a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check result based on the lucky pick and last draw
function checkResult() {
    const luckyPickTable = document.getElementById('luckyPickTable');
    const resultCheck = document.getElementById('resultCheck');
    const lastDraw = pastDrawData[pastDrawData.length - 1];

    const luckyPickNumbers = Array.from(luckyPickTable.querySelectorAll('td')).slice(0, 5).map(td => parseInt(td.textContent));
    const luckyPickStars = Array.from(luckyPickTable.querySelectorAll('td')).slice(5).map(td => parseInt(td.textContent.replace('★', '')));

    const matchingNumbers = luckyPickNumbers.filter(num => lastDraw.numbers.includes(num)).length;
    const matchingStars = luckyPickStars.filter(star => lastDraw.stars.includes(star)).length;

    resultCheck.textContent = `Matching Numbers: ${matchingNumbers}, Matching Stars: ${matchingStars}`;
}

document.addEventListener('DOMContentLoaded', fetchResults);
document.getElementById('generateLuckyPickForm').addEventListener('submit', generateLuckyPick);
document.getElementById('checkResultButton').addEventListener('click', checkResult);
