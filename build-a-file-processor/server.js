
const fs = require('fs');

// Create a readable stream
const readable = fs.createReadStream('assets/poem.txt');

// Create a writable stream
const writable = fs.createWriteStream('assets/stream-output.txt');

// Pipe readable data into writable stream
readable.pipe(writable);
