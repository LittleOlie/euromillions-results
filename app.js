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

    // Count the occurrences of each number and star
    data.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num] = (numberCounts[num] || 0) + 1);
        draw.stars.forEach(star => starCounts[star] = (starCounts[star] || 0) + 1);
    });

    // Sort numbers by frequency
    const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
    const sortedStars = Object.entries(starCounts).sort((a, b) => b[1] - a[1]);

    // Highest probability numbers and stars
    const highProbNumbers = sortedNumbers.slice(0, 5).map(item => item[0]);
    const highProbStars = sortedStars.slice(0, 2).map(item => item[0]);

    // Least drawn numbers and stars
    const lowProbNumbers = sortedNumbers.slice(-5).map(item => item[0]);
    const lowProbStars = sortedStars.slice(-2).map(item => item[0]);

    // Display results
    document.getElementById('highProbability').textContent = `Highest Probability Numbers: ${highProbNumbers.join(', ')} | Stars: ${highProbStars.join(', ')}`;
    document.getElementById('lowProbability').textContent = `Least Drawn Numbers: ${lowProbNumbers.join(', ')} | Stars: ${lowProbStars.join(', ')}`;
}

// Generate lucky numbers based on user's birthdate
function generateLuckyPick(event) {
    event.preventDefault(); // Prevent form submission

    const birthdate = new Date(document.getElementById('birthdate').value);
    const day = birthdate.getDate(); // Get day of the month (1-31)
    const month = birthdate.getMonth() + 1; // Get month (1-12)
    const year = birthdate.getFullYear(); // Get full year

    // Generate lucky numbers based on the birthdate
    const luckyNumbers = [day % 50, month % 50, year % 50, (
