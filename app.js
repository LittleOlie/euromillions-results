let drawData = []; // Declare a global variable to store the fetched draw data

async function fetchResults() {
    try {
        const response = await fetch('https://euromillions.api.pedromealha.dev/draws', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        drawData = data; // Store the fetched data globally

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


// Check if the generated lucky pick appeared in past results
function checkIfLuckySetAppeared(luckyNumbers, luckyStars) {
    const lastDrawList = document.getElementById('luckyPickResult');
    let appearedInDraws = false;

    // Loop through all draws to see if the lucky numbers and stars match any past draw
    drawData.forEach(draw => {
        const drawNumbers = new Set(draw.numbers);
        const drawStars = new Set(draw.stars);

        // Check if all the lucky numbers and stars match a past draw
        const numbersMatch = luckyNumbers.every(num => drawNumbers.has(num));
        const starsMatch = luckyStars.every(star => drawStars.has(star));

        if (numbersMatch && starsMatch) {
            appearedInDraws = true;
        }
    });

    // Display result based on whether the numbers appeared in past draws
    if (appearedInDraws) {
        lastDrawList.textContent = 'Your lucky pick has already been drawn before. Maybe it’s a sign!';
    } else {
        lastDrawList.textContent = 'Your lucky pick has not yet been drawn. There’s still hope!';
    }
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
