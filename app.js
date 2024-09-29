// Fetching results from the API
async function fetchResults() {
    const response = await fetch('https://euromillions.api.pedromealha.dev/draws');
    const data = await response.json();
    const resultsList = document.getElementById('results');

    // Display results with dates
    data.slice(0, 10).forEach(draw => {
        const listItem = document.createElement('li');
        listItem.textContent = `Draw on ${draw.date}: Numbers: ${draw.numbers.join(', ')} | Stars: ${draw.stars.join(', ')}`;
        resultsList.appendChild(listItem);
    });

    // Processing number and star frequencies
    const numberCounts = {};
    const starCounts = {};
    data.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Displaying frequency in a graph
    displayGraph(numberCounts, starCounts, data.length);
}

// Generate random numbers
function generateRandomNumbers() {
    const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    const randomStars = Array.from({ length: 2 }, () => Math.floor(Math.random() * 12) + 1);
    document.getElementById('randomNumbers').textContent = `Numbers: ${randomNumbers.join(', ')} | Stars: ${randomStars.join(', ')}`;
}

// Display the graph using Chart.js
function displayGraph(numberCounts, starCounts, totalDraws) {
    const ctx = document.getElementById('graph').getContext('2d');

    const data = {
        labels: Object.keys(numberCounts).map(Number),
        datasets: [
            {
                label: 'Numbers Frequency (%)',
                data: Object.values(numberCounts).map(count => (count / totalDraws) * 100),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Stars Frequency (%)',
                data: Object.values(starCounts).map(count => (count / totalDraws) * 100),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }
        ]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });
}

// Initialize by fetching results when the page loads
fetchResults();
