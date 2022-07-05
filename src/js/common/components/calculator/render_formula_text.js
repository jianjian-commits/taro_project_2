import { FORMULA_TEXT } from '../../enum'

/**
 * @param text {string}
 * @return {string}
 */
const renderFormulaText = (text) => {
  let result = text
  Object.entries(FORMULA_TEXT).forEach(([key, value]) => {
    if (result.match(new RegExp(key, 'g'))) {
      result = result.replace(new RegExp(key, 'g'), value)
    }
  })
  return result
}

export default renderFormulaText
