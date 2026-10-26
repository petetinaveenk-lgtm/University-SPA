const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { DATA_DIR, FILES } = require('../config/config');

// In-memory queues to serialize write operations per file and prevent concurrency corruption
const writeQueues = {};

/**
 * Ensures data directory and JSON files exist with at least an empty array.
 */
async function initializeDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fsPromises.mkdir(DATA_DIR, { recursive: true });
    }

    for (const [key, filePath] of Object.entries(FILES)) {
      if (!fs.existsSync(filePath)) {
        await fsPromises.writeFile(filePath, '[]', 'utf8');
      } else {
        // Verify it contains valid JSON
        try {
          const content = await fsPromises.readFile(filePath, 'utf8');
          if (!content.trim()) {
            await fsPromises.writeFile(filePath, '[]', 'utf8');
          } else {
            JSON.parse(content);
          }
        } catch {
          await fsPromises.writeFile(filePath, '[]', 'utf8');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error.message);
    throw error;
  }
}

/**
 * Safely read data from a JSON file.
 * @param {string} fileKey - Key from config.FILES (e.g. 'students')
 * @returns {Promise<Array>}
 */
async function readData(fileKey) {
  const filePath = FILES[fileKey];
  if (!filePath) {
    throw new Error(`Unknown file key: ${fileKey}`);
  }

  try {
    if (!fs.existsSync(filePath)) {
      await fsPromises.writeFile(filePath, '[]', 'utf8');
      return [];
    }
    const raw = await fsPromises.readFile(filePath, 'utf8');
    if (!raw.trim()) {
      return [];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${fileKey}:`, error.message);
    return [];
  }
}

/**
 * Safely write data to a JSON file using a sequential queue and atomic write.
 * @param {string} fileKey - Key from config.FILES
 * @param {Array} data - Data array to write
 * @returns {Promise<void>}
 */
function writeData(fileKey, data) {
  const filePath = FILES[fileKey];
  if (!filePath) {
    return Promise.reject(new Error(`Unknown file key: ${fileKey}`));
  }

  if (!writeQueues[fileKey]) {
    writeQueues[fileKey] = Promise.resolve();
  }

  const task = writeQueues[fileKey].then(async () => {
    const jsonString = JSON.stringify(data, null, 2);
    const tempPath = `${filePath}.${Date.now()}-${Math.random().toString(36).substring(2, 7)}.tmp`;

    // Write to temporary file first, then atomically rename
    await fsPromises.writeFile(tempPath, jsonString, 'utf8');
    await fsPromises.rename(tempPath, filePath);
  });

  writeQueues[fileKey] = task.catch((err) => {
    console.error(`Error writing ${fileKey}:`, err.message);
  });

  return task;
}

/**
 * Generates next human-friendly unique ID, e.g. STU-1001, FAC-101, CRS-101.
 * @param {string} prefix - e.g. 'STU'
 * @param {Array} existingItems - Array of items with 'id'
 * @param {number} defaultStart - Default starting number e.g. 1001
 * @returns {string}
 */
function generateId(prefix, existingItems = [], defaultStart = 1001) {
  let maxNum = defaultStart - 1;
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

  for (const item of existingItems) {
    if (item && item.id) {
      const match = String(item.id).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  return `${prefix}-${maxNum + 1}`;
}

module.exports = {
  initializeDataFiles,
  readData,
  writeData,
  generateId
};
