/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {number[]} x - First variable array
 * @param {number[]} y - Second variable array
 * @returns {number} Correlation coefficient (-1 to 1)
 */
export function pearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length === 0) {
    return 0
  }

  const n = x.length
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n
  
  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0)
  const denominatorX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0))
  const denominatorY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0))
  
  if (denominatorX === 0 || denominatorY === 0) {
    return 0
  }
  
  return numerator / (denominatorX * denominatorY)
}

/**
 * Calculate average of an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Average value
 */
export function average(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Calculate Likert scale score from array of responses
 * @param {number[]} responses - Array of Likert responses (1-5)
 * @returns {number} Total score
 */
export function calculateLikertScore(responses) {
  return responses.reduce((sum, score) => sum + score, 0)
}
