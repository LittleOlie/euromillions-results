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

    luckyNumbers = luckyNumbers.map(num => num === 0 ? getRandomNumber(1, 50) : num);
    luckyStars = luckyStars.map(star => star === 0 ? getRandomNumber(1, 12) : star);

    luckyNumbers = ensureNoDuplicates(luckyNumbers, 1, 50);
    luckyStars = ensureNoDuplicates(luckyStars, 1, 12);

    document.getElementById('luckyPick').textContent = `Lucky Numbers: ${luckyNumbers.join(', ')} | Lucky Stars: ${luckyStars.join(', ')}`;

    // Create a table for lucky numbers
    createLuckyPickTable(luckyNumbers, luckyStars);

    checkIfLuckySetAppeared(luckyNumbers, luckyStars);
}

// Create a table for lucky pick numbers with draw count and percentage
function createLuckyPickTable(luckyNumbers, luckyStars) {
    const tableBody = document.getElementById('luckyPickTableBody');
    tableBody.innerHTML = ''; // Clear previous data

    luckyNumbers.forEach(number => {
        const count = numberCounts[number] || 0;
        const percentage = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(2) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `<td>${number}</td><td>${count}</td><td>${percentage}%</td>`;
        tableBody.appendChild(row);
    });

    luckyStars.forEach(star => {
        const count = starCounts[star] || 0;
        const percentage = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(2) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `<td>★${star}</td><td>${count}</td><td>${percentage}%</td>`;
        tableBody.appendChild(row);
    });
}


// Check if the lucky set appeared in past results
function checkIfLuckySetAppeared(luckyNumbers, luckyStars) {
    let matchFound = false;

    pastDrawData.forEach(draw => {
        const drawNumbers = draw.numbers.sort((a, b) => a - b);
        const drawStars = draw.stars.sort((a, b) => a - b);

        if (arraysEqual(luckyNumbers.sort((a, b) => a - b), drawNumbers) &&
            arraysEqual(luckyStars.sort((a, b) => a - b), drawStars)) {
            matchFound = true;
        }
    });

    if (matchFound) {
        document.getElementById('luckyPickResult').textContent = 'Your lucky numbers have already been drawn in the past! Keep trying!';
    } else {
        document.getElementById('luckyPickResult').textContent = 'Your lucky numbers have not been drawn yet! There is hope!';
    }
}

// Helper function to check array equality
function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

// Helper function to get a random number in a range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to ensure no duplicate numbers or stars
function ensureNoDuplicates(arr, min, max) {
    const uniqueArr = [...new Set(arr)];
    while (uniqueArr.length < arr.length) {
        uniqueArr.push(getRandomNumber(min, max));
    }
    return uniqueArr;
}





// Function to randomly pick 5 numbers and 2 stars from top and least numbers/stars
function generateRandomCombination() {
    // Combine top 10 and least 10 numbers
    const combinedNumbers = [
        ...Object.entries(numberCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(item => parseInt(item[0])),
        ...Object.entries(numberCounts).sort((a, b) => a[1] - b[1]).slice(0, 10).map(item => parseInt(item[0]))
    ];

    // Combine top 4 and least 4 stars
    const combinedStars = [
        ...Object.entries(starCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(item => parseInt(item[0])),
        ...Object.entries(starCounts).sort((a, b) => a[1] - b[1]).slice(0, 4).map(item => parseInt(item[0]))
    ];

    // Randomly pick 5 numbers
    const selectedNumbers = getRandomUniqueElements(combinedNumbers, 5);

    // Randomly pick 2 stars
    const selectedStars = getRandomUniqueElements(combinedStars, 2);

    // Display the result
    displayRandomCombination(selectedNumbers, selectedStars);
}

// Helper function to get random unique elements from an array
function getRandomUniqueElements(arr, count) {
    const result = [];
    const usedIndices = new Set();

    while (result.length < count) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        if (!usedIndices.has(randomIndex)) {
            result.push(arr[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return result;
}

// Function to display the randomly picked combination
function displayRandomCombination(numbers, stars) {
    const resultDiv = document.getElementById('randomCombinationResult');
    
    resultDiv.innerHTML = `Random Combination:<br> 
        Numbers: ${numbers.join(', ')}<br>
        Stars: ★${stars.join(', ★')}`;
}

// Event listener for the random combination button
document.getElementById('generateRandomCombinationButton').addEventListener('click', generateRandomCombination);










// Fetch results on page load
document.addEventListener('DOMContentLoaded', fetchResults);

// Event listener for generating lucky pick
document.getElementById('generateLuckyPickForm').addEventListener('submit', generateLuckyPick);