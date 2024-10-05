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

        // Update totalDraws to be the length of the data
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

// Helper function to create number or star span
function createSpanElement(content, isStar = false) {
    const span = document.createElement('span');
    span.style.fontSize = '20px';
    span.innerHTML = content.map(item => {
        const symbol = isStar ? `★${item}` : item;
        const backgroundColor = isStar ? 'gold' : 'white';
        return `<span style="display: inline-block; background-color: ${backgroundColor}; border-radius: 50%; padding: 10px; width: 40px; height: 40px; text-align: center; margin-right: 10px;">${symbol}</span>`;
    }).join('');
    return span;
}

// Modify showLastDraw to use createSpanElement
function showLastDraw(data) {
    const lastDraw = data[data.length - 1]; // Last draw is the last item in the array

    // Display the draw numbers and stars
    const lastDrawList = document.getElementById('lastDraw');
    const listItem = document.createElement('li');

    const numbersSpan = createSpanElement(lastDraw.numbers);
    const starsSpan = createSpanElement(lastDraw.stars, true);
    
    const drawInfo = `Draw on ${lastDraw.date}`;
    const prizeInfo = ` | Prize: ${lastDraw.prize || 'Not available'}`;
    
    listItem.innerHTML = `${drawInfo}: `;
    listItem.appendChild(numbersSpan);
    listItem.appendChild(starsSpan);
    listItem.innerHTML += prizeInfo;
    lastDrawList.appendChild(listItem);

    // Now create the table for last draw data
    createLastDrawTable(lastDraw);
}

// Function to create a table for last draw numbers and stars
function createLastDrawTable(lastDraw) {
    const tableBody = document.getElementById('lastDrawTableBody');
    tableBody.innerHTML = ''; // Clear previous data

    // Process numbers
    lastDraw.numbers.forEach(number => {
        const count = numberCounts[number] || 0;
        const percentage = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(2) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `<td>${number}</td><td>${count}</td><td>${percentage}%</td>`;
        tableBody.appendChild(row);
    });

    // Process stars
    lastDraw.stars.forEach(star => {
        const count = starCounts[star] || 0;
        const percentage = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(2) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `<td>★${star}</td><td>${count}</td><td>${percentage}%</td>`;
        tableBody.appendChild(row);
    });
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

// Generate lucky numbers based on user's birthdate
function generateLuckyPick(event) {
    event.preventDefault();

    const birthdate = new Date(document.getElementById('birthdate').value);
    if (!birthdate.getTime()) {
        document.getElementById('luckyPick').textContent = 'Please enter a valid birthdate.';
        return;
    }

    const day = birthdate.getDate();
    const month = birthdate.getMonth() + 1;
    const year = birthdate.getFullYear();

    let luckyNumbers = [day % 50, month % 50, year % 50, (day + month) % 50, (day + year) % 50];
    let luckyStars = [(day + month) % 12, (month + year) % 12];

    // Ensure no duplicates in the generated lucky numbers and stars
    luckyNumbers = [...new Set(luckyNumbers)];
    luckyStars = [...new Set(luckyStars)];

    // Display lucky numbers and stars
    const luckyNumbersSpan = createSpanElement(luckyNumbers);
    const luckyStarsSpan = createSpanElement(luckyStars, true);

    const luckyPickDiv = document.getElementById('luckyPick');
    luckyPickDiv.innerHTML = ''; // Clear previous lucky picks
    luckyPickDiv.appendChild(luckyNumbersSpan);
    luckyPickDiv.appendChild(luckyStarsSpan);
}

// Add event listeners
document.getElementById('fetchResultsButton').addEventListener('click', fetchResults);
document.getElementById('generateLuckyPickButton').addEventListener('click', generateLuckyPick);

// Automatically fetch results on page load
window.onload = fetchResults;
