// readFile.js

const fs = require('fs');

// Check if a file path is provided as a command-line argument
if (process.argv.length < 3) {
  console.error('Usage: node readFile.js <file_path>');
  process.exit(1);
}

const filePath = process.argv[2];

function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Use an async function to wait for the data
async function main() {
  try {
    const fileData = await readFileAsync(filePath);
    console.log(`File content:\n${fileData}`);
    console.log(typeof fileData);
    for (let line of fileData.split('\n')){
        console.log(`Line: ${line}`);
        for (let i = 0; i < line.length; ++i){
            let c = line[i];
            console.log(c);
        }
    }
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
}

// Call the async function
main();
