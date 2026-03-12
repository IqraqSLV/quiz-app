function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  console.log('📋 Parsed headers:', headers);
  console.log('📋 Header count:', headers.length);
  console.log('📋 First header chars:', JSON.stringify(headers[0]));

  // Validate headers
  const expectedHeaders = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
  console.log('📋 Expected headers:', expectedHeaders);
  if (!expectedHeaders.every(h => headers.includes(h))) {
    console.error('❌ Missing headers:', expectedHeaders.filter(h => !headers.includes(h)));
    throw new Error('CSV file has invalid headers');
  }

  // Parse data rows
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines

    const values = parseCSVLine(lines[i]);

    // Need at least Question and Correct Answer (minimum 2 values)
    // Pad with empty strings if needed to match header count
    while (values.length < headers.length) {
      values.push('');
    }

    if (!values[0] || !values[0].trim()) continue; // Skip rows without a question

    const questionObj = transformCSVRow(headers, values);
    questions.push(questionObj);
  }

  return questions;
}

function parseCSVLine(line) {
  // Handle quoted fields with commas, including trailing empty fields
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last field
  values.push(current.trim());

  return values;
}

function transformCSVRow(headers, values) {
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index];
  });

  // Build options object, filtering out empty options
  const options = {
    'A': row['Option A'],
    'B': row['Option B'],
    'C': row['Option C'],
    'D': row['Option D']
  };

  // Remove empty/undefined options
  const validOptions = Object.entries(options)
    .filter(([_, answer]) => answer && answer.trim() !== '')
    .reduce((acc, [letter, answer]) => {
      acc[letter] = answer;
      return acc;
    }, {});

  const correctAnswerValue = row['Correct Answer'];
  if (!correctAnswerValue || !correctAnswerValue.trim()) {
    throw new Error(`Missing correct answer for question: ${row['Question']}`);
  }

  const correctLetter = correctAnswerValue.trim().toUpperCase();
  const correctAnswer = validOptions[correctLetter];

  if (!correctAnswer) {
    throw new Error(`Invalid correct answer letter: ${correctLetter} for question: ${row['Question']}`);
  }

  // Get incorrect answers (only non-empty ones)
  const incorrectAnswers = Object.entries(validOptions)
    .filter(([letter, _]) => letter !== correctLetter)
    .map(([_, answer]) => answer);

  return {
    question: row['Question'],
    correct_answer: correctAnswer,
    incorrect_answers: incorrectAnswers,
    options: [] // Will be populated by shuffle()
  };
}

export default parseCSV;
