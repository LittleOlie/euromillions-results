// Fetching results from the API
async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

	       /// Display first date, last date, and total number of draws
        displayDrawInfo(data);

        // Show the last draw
        showLastDraw(data);

        // Calculate highest and least probability numbers and stars
        calculateProbabilities(data);

    } catch (error) {
        console.error('Failed to fetch results:', error);
    }
}

// Show the last draw results here
function showLastDraw(data) {
    const lastDraw = data[data.length - 1]; // Last draw is the last item in the array
    const lastDrawList = document.getElementById('lastDraw');

    const listItem = document.createElement('li');

    // Create a span element for the numbers with black text, large font, and round background
    const numbersSpan = document.createElement('span');
    numbersSpan.style.color = 'black';
    numbersSpan.style.fontSize = '20px'; // Larger font size
    numbersSpan.style.backgroundColor = 'lightgray'; // Background color
    numbersSpan.style.borderRadius = '60%'; // Round background
    numbersSpan.style.padding = '10px'; // Padding inside the circle
    numbersSpan.style.marginRight = '10px'; // Spacing between numbers and stars
    numbersSpan.textContent = `Numbers: ${lastDraw.numbers.join(', ')}`;

    // Create a span element for the stars with gold text, large font, and star shapes
    const starsSpan = document.createElement('span');
    starsSpan.style.color = 'gold';
    starsSpan.style.fontSize = '20px'; // Larger font size for stars
    
    const stars = lastDraw.stars.map(star => `★${star}`).join(' ');
    starsSpan.innerHTML = ` | Stars: ${stars}`;

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


/////

// Function to display first date, last date, and total number of draws
function displayDrawInfo(data) {
    const totalDraws = data.length;  // Total number of draws

    if (totalDraws > 0) {
        const firstDrawDate = new Date(data[0].date).toLocaleDateString();
        const lastDrawDate = new Date(data[totalDraws - 1].date).toLocaleDateString();

        document.getElementById('drawInfo').textContent = 
            `Total Draws: ${totalDraws}, First Draw: ${firstDrawDate}, Last Draw: ${lastDrawDate}`;
    } else {
        document.getElementById('drawInfo').textContent = 'No draw data available.';
    }
}
//////////////////
function calculateProbabilities(data) {
    const numberCounts = {};
    const starCounts = {};
    const totalDraws = data.length;  // Total number of draws

    // Count the occurrences of each number and star
    data.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Sort numbers by frequency
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);

    // Prepare data for charts
    const numberLabels = sortedNumbers.map(item => `${item[0]} (${item[1]} draws)`); // Include draw count
    const numberFrequencies = sortedNumbers.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    const starLabels = sortedStars.map(item => `${item[0]} (${item[1]} draws)`); // Include draw count
    const starFrequencies = sortedStars.map(item => ((item[1] / totalDraws) * 100).toFixed(2));

    // Create charts
    createChart('numberChart', 'Number Frequencies (%)', numberLabels, numberFrequencies, false);
    createChart('starChart', 'Star Frequencies (%)', starLabels, starFrequencies, true);

    // Get top and least numbers and stars
    const topNumbers = sortedNumbers.slice(0, 5).map(item => item[0]);
    const leastNumbers = sortedNumbers.slice(-5).map(item => item[0]);
    const topStars = sortedStars.slice(0, 2).map(item => item[0]);
    const leastStars = sortedStars.slice(-2).map(item => item[0]);

    // Display the number sets
    displayNumberSets(topNumbers, topStars, leastNumbers, leastStars);
}



///// Create the chart for numbers or stars
function createChart(canvasId, label, labels, data, isStarChart = false) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Determine colors based on whether it's a number or star chart
    const colors = labels.map((_, index) => {
        if (isStarChart) {
            // For stars, top 2 green, least 2 red
            return index < 2 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)';
        } else {
            // For numbers, top 5 green, least 5 red
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
                borderColor: colors.map(color => color.replace('0.5', '1')), // make borders solid
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


// display number set
function displayNumberSets(topNumbers, topStars, leastNumbers, leastStars) {
    // Display top numbers and stars
    document.getElementById('topNumbers').textContent = `Top 5 Numbers: ${topNumbers.join(', ')}`;
    document.getElementById('topStars').textContent = `Top 2 Stars: ${topStars.join(', ')}`;

    // Display least numbers and stars
    document.getElementById('leastNumbers').textContent = `Least 5 Numbers: ${leastNumbers.join(', ')}`;
    document.getElementById('leastStars').textContent = `Least 2 Stars: ${leastStars.join(', ')}`;
}





// Generate lucky numbers based on user's birthdate
function generateLuckyPick(event) {
    event.preventDefault(); // Prevent form submission

    const birthdate = new Date(document.getElementById('birthdate').value);
    if (!birthdate.getTime()) {
        document.getElementById('luckyPick').textContent = 'Please enter a valid birthdate.';
        return;
    }

    const day = birthdate.getDate(); // Get day of the month (1-31)
    const month = birthdate.getMonth() + 1; // Get month (1-12)
    const year = birthdate.getFullYear(); // Get full year

    // Generate initial lucky numbers and stars using modulo
    let luckyNumbers = [day % 50, month % 50, year % 50, (day + month) % 50, (day + year) % 50];
    let luckyStars = [(day + month) % 12, (month + year) % 12];

    // Replace any 0s with random numbers (1-50 for numbers, 1-12 for stars)
    luckyNumbers = luckyNumbers.map(num => num === 0 ? getRandomNumber(1, 50) : num);
    luckyStars = luckyStars.map(star => star === 0 ? getRandomNumber(1, 12) : star);

    // Ensure no duplicate numbers or stars
    luckyNumbers = ensureNoDuplicates(luckyNumbers, 1, 50);
    luckyStars = ensureNoDuplicates(luckyStars, 1, 12);

    // Display lucky numbers
    document.getElementById('luckyPick').textContent = `Lucky Numbers: ${luckyNumbers.join(', ')} | Lucky Stars: ${luckyStars.join(', ')}`;

    // Check if this set of numbers and stars appeared in past results
    checkIfLuckySetAppeared(luckyNumbers, luckyStars);
}

// Utility function to generate a random number in a given range (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility function to ensure no duplicate numbers in an array
function ensureNoDuplicates(arr, min, max) {
    const uniqueSet = new Set(arr);

    while (uniqueSet.size < arr.length) {
        // If a duplicate was found, add a new random number until the set is unique
        uniqueSet.add(getRandomNumber(min, max));
    }

    return Array.from(uniqueSet);
}






// Add event listener to the form
document.getElementById('birthdateForm').addEventListener('submit', generateLuckyPick);

// Initialize by fetching results when the page loads
document.addEventListener('DOMContentLoaded', fetchResults);
