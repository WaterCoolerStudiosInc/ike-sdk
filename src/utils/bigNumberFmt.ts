import { BN } from '@polkadot/util'

export const toBN = (value: string): BN => new BN(value)

export const removeCommas = (input: string): string => input.replace(/,/g, '')

export const toDate = (ms: string): Date => new Date(Number.parseInt(removeCommas(ms)))

export const toInt = (input: string): number => Number.parseInt(removeCommas(input))

export const convertString = (
  input: string,
  decimalsTo: number,
  decimalsFrom: number = 0,
): string => {
  if (input.includes('e')) throw new Error(`Unsafe conversion of ${input}`)

  // Removes all commas, and leading 0s from the string
  let stringValue = input.replace(/,|^0+/g, '')

  let isNeg = false
  if (stringValue[0] === '-') {
    isNeg = true
    stringValue = stringValue.slice(1)
  }

  if (!stringValue.includes('.')) {
    stringValue = `${stringValue}.0`
  }

  const decimalChange = decimalsTo - decimalsFrom
  const padding = '0'.repeat(Math.abs(decimalChange))

  if (decimalChange >= 0) {
    // Add right padding
    stringValue = `${stringValue}${padding}`

    // Move decimal right
    const [wholePart, fractionalPart] = stringValue.split('.')
    const newFractionalPart =
      fractionalPart.slice(0, decimalChange) + '.' + fractionalPart.slice(decimalChange)
    stringValue = `${wholePart}${newFractionalPart}`
  } else {
    // Add left padding
    stringValue = `${padding}${stringValue}`

    // Move decimal left
    const [wholePart, fractionalPart] = stringValue.split('.')
    const newWholePart = wholePart.slice(0, decimalChange) + '.' + wholePart.slice(decimalChange)
    stringValue = `${newWholePart}${fractionalPart}`
  }

  // Trim left padding
  while (stringValue.charAt(0) === '0') {
    stringValue = stringValue.slice(1)
  }

  // Trim right padding
  while (stringValue.slice(-1) === '0') {
    stringValue = stringValue.slice(0, -1)
  }

  // Avoid leading decimal
  if (stringValue.charAt(0) === '.') {
    stringValue = `0${stringValue}`
  }

  // Avoid trailing decimal
  if (stringValue.slice(-1) === '.') {
    stringValue = stringValue.slice(0, -1)
  }

  // Preserve negative status
  if (isNeg) {
    stringValue = `-${stringValue}`
  }

  return stringValue
}

export const trimLeadingZeros = (input: string): string => {
  while (input.length > 1 && input.charAt(0) === '0' && input.charAt(1) !== '.') {
    input = input.slice(1)
  }
  return input
}

export const toFixedDecimal = (
  input: string,
  desiredDecimals: number,
  formatting = true,
): string => {
  let [wholePart, fractionalPart] = removeCommas(input).split('.')
  if (!wholePart) wholePart = '0'
  if (!fractionalPart) fractionalPart = '0'

  if (formatting === true) {
    wholePart = BigInt(wholePart).toLocaleString()
  }

  if (desiredDecimals >= fractionalPart.length) {
    // Add padding
    return wholePart + '.' + fractionalPart + '0'.repeat(desiredDecimals - fractionalPart.length)
  } else if (desiredDecimals === 0) {
    // Truncate all precision
    return wholePart
  } else {
    // Decrease precision
    return wholePart + '.' + fractionalPart.slice(0, desiredDecimals)
  }
}

export const formatLargeNumber = (input: string): string => {
  const number = toInt(removeCommas(input))

  if (number >= 1_000_000_000) {
    return `${toFixedDecimal((number / 1_000_000_000).toString(), 2)}B`
  } else if (number >= 1_000_000) {
    return `${toFixedDecimal((number / 1_000_000).toString(), 2)}M`
  } else if (number >= 1_000) {
    return `${toFixedDecimal((number / 1_000).toString(), 2)}K`
  } else {
    return number.toString()
  }
}

export const stringIsGreaterThan = (leftValue: string, rightValue: string): boolean => {
  return compareStrings(leftValue, rightValue) > 0
}

export const stringIsGreaterThanEq = (leftValue: string, rightValue: string): boolean => {
  return compareStrings(leftValue, rightValue) >= 0
}

export const stringIsLessThan = (leftValue: string, rightValue: string): boolean => {
  return compareStrings(leftValue, rightValue) < 0
}

export const stringIsLessThanEq = (leftValue: string, rightValue: string): boolean => {
  return compareStrings(leftValue, rightValue) <= 0
}

export const stringIsEqual = (leftValue: string, rightValue: string): boolean => {
  return compareStrings(leftValue, rightValue) === 0
}

export const compareStrings = (leftValue: string, rightValue: string): number => {
  const leftBN = new BN(convertString(leftValue, 32))
  const rightBN = new BN(convertString(rightValue, 32))

  return leftBN.cmp(rightBN)
}

export const multiplyStrings = (multiplicand: string, multiplier: string): string => {
  // Normalize assuming that +32 decimals will avoid any "." from the string and allow BN creation
  // TODO: Write an algorithm that determines Max(a decimals, b decimals)
  const multiplicandBN = new BN(convertString(multiplicand, 32))
  const multiplierBN = new BN(convertString(multiplier, 32))

  // Multiply
  const product = multiplicandBN.mul(multiplierBN)

  // Remove normalization
  return convertString(product.toString(), 0, 64)
}

export const divideStrings = (numerator: string, denominator: string): string => {
  // Normalize assuming that +32 decimals will avoid any "." from the string and allow BN creation
  // TODO: Write an algorithm that determines Max(numerator decimals, denominator decimals)
  const numeratorBN = new BN(convertString(numerator, 64))
  const denominatorBN = new BN(convertString(denominator, 32))

  // Divide
  if (denominatorBN.isZero()) return '0'
  const quotient = numeratorBN.div(denominatorBN)

  // Remove normalization
  return convertString(quotient.toString(), 0, 32)
}

export const addStrings = (x: string, y: string): string => {
  const number1BN = new BN(convertString(x, 32))
  const number2BN = new BN(convertString(y, 32))

  const sum = number1BN.add(number2BN)

  // Remove normalization
  return convertString(sum.toString(), 0, 32)
}

export const percentageOf = (value: string, totalValue: string, precision: number = 2): string => {
  return `${toFixedDecimal(multiplyStrings(divideStrings(value, totalValue), '100'), precision)}%`
}

export const percentageOfToNumber = (
  value: string,
  totalValue: string,
  precision: number = 2,
): number => {
  return Number(toFixedDecimal(multiplyStrings(divideStrings(value, totalValue), '100'), precision))
}
