// Fetching results from the API
async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

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
    const lastDraw = data[0]; // Last draw is the first item in the array
    const lastDrawList = document.getElementById('lastDraw');
    
    const listItem = document.createElement('li');
    listItem.textContent = `Draw on ${lastDraw.date}: Numbers: ${lastDraw.numbers.join(', ')} | Stars: ${lastDraw.stars.join(', ')}`;
    lastDrawList.appendChild(listItem);
}

// Calculate and display highest and least drawn numbers and stars
function calculateProbabilities(data) {
    const numberCounts = {};
    const starCounts = {};
    const totalDraws = data.length;

    // Count the occurrences of each number and star
    data.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Sort numbers by frequency
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);

    // Prepare data for charts
    const numberLabels = sortedNumbers.map(item => item[0]);
    const numberFrequencies = sortedNumbers.map(item => (item[1] / totalDraws * 100).toFixed(2));

    const starLabels = sortedStars.map(item => item[0]);
    const starFrequencies = sortedStars.map(item => (item[1] / totalDraws * 100).toFixed(2));

    // Create charts
    createChart('numberChart', 'Number Frequencies (%)', numberLabels, numberFrequencies);
    createChart('starChart', 'Star Frequencies (%)', starLabels, starFrequencies);
}

// Create the chart for numbers or stars
function createChart(canvasId, label, labels, data) {
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

    // Generate lucky numbers based on the birthdate
    const luckyNumbers = [day % 50, month % 50, year % 50, (day + month) % 50, (day + year) % 50];
    const luckyStars = [(day + month) % 12, (month + year) % 12];

    // Display lucky numbers
    document.getElementById('luckyPick').textContent = `Lucky Numbers: ${luckyNumbers.join(', ')} | Lucky Stars: ${luckyStars.join(', ')}`;
}

// Add event listener to the form
document.getElementById('birthdateForm').addEventListener('submit', generateLuckyPick);

// Initialize by fetching results when the page loads
document.addEventListener('DOMContentLoaded', fetchResults);
