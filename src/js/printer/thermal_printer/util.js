import Big from 'big.js'

export const price = (n) => {
  const result = Big(n || 0).toFixed(2)
  return result === '0.00' ? '0' : result
}
