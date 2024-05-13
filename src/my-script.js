const fs = require('fs');

// Read the original JSON file
const jsonData = JSON.parse(fs.readFileSync('./converted.json'));

// Calculate the midpoint index
const midpoint = Math.ceil(jsonData.length / 2);

// Split the array into two parts
const firstHalf = jsonData.slice(0, midpoint);
const secondHalf = jsonData.slice(midpoint);

// Write the first half to a new file
fs.writeFileSync('first_half.json', JSON.stringify(firstHalf, null, 2));

// Write the second half to a new file
fs.writeFileSync('second_half.json', JSON.stringify(secondHalf, null, 2));
