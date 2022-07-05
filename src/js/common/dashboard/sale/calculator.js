const OPERATORS = {
  '*': (arg1, arg2) => arg1 * arg2,
  '/': (arg1, arg2) => arg1 / arg2,
  '+': (arg1, arg2) => arg1 + arg2,
  '-': (arg1, arg2) => arg1 - arg2,
  '^': (arg1, arg2) => arg1 ** arg2,
}

const PRECEDENCE = {
  '*': 1,
  '/': 1,
  '+': 2,
  '-': 2,
  '^': 0,
}
const charIsMinusSign = (chars, index) =>
  index < chars.length - 1 &&
  chars[index] === '-' &&
  (index === 0 || chars[index - 1] in OPERATORS) &&
  chars[index + 1].match(/[\d.]/)

function formatInfix(infix) {
  // ensure the right spacing between items, to make it look good / readable
  const chars = infix.split('')

  return chars
    .reduce(
      ({ stack, next }, char, index) => {
        const isWhitespace = char.match(/\s/)
        if (isWhitespace) {
          return { stack, next: true }
        }

        const isMinusSign = charIsMinusSign(chars, index)
        const isOperator = !isMinusSign && char in OPERATORS

        if (isOperator) {
          return {
            stack: [...stack, ' ', char],
            next: true,
          }
        }

        if (isMinusSign || next) {
          return {
            stack: [...stack, ' ', char],
            next: false,
          }
        }

        return {
          stack: [...stack, char],
          next: false,
        }
      },
      { stack: [], next: true },
    )
    .stack.slice(1)
    .join('')
}
const BRACKET = 0xb00000

const TYPE_NUMBER = 'NUMBER'
const TYPE_OPERATOR = 'OPERATOR'
const TYPE_GROUP = 'GROUP'

function getBracketSections(infix) {
  return infix
    .split('')
    .reduce((sections, char, index) => {
      if (char === '(') {
        const remove =
          index > 0 &&
          sections.findIndex((section) => section.close === null) > -1

        return [...sections, { open: index, close: null, remove }]
      }
      if (char === ')') {
        const lastNotClosed = sections
          .slice()
          .reverse()
          .findIndex((section) => section.close === null)

        if (lastNotClosed === -1) {
          throw new Error('invalid brackets')
        }

        const closeIndex = sections.length - 1 - lastNotClosed

        sections[closeIndex].close = index
      }

      return sections
    }, [])
    .filter((section) => !section.remove)
}

function getCharsWithBrackets(bracketSections, infix) {
  if (!bracketSections.length) {
    return infix.split('')
  }

  return [
    ...bracketSections.reduce(
      ({ items, start }, { open, close }) => ({
        items: [...items, ...infix.substring(start, open).split(''), BRACKET],
        start: close + 1,
      }),
      {
        items: [],
        start: 0,
      },
    ).items,
    ...infix
      .substring(bracketSections[bracketSections.length - 1].close + 1)
      .split(''),
  ]
}

function processCharsWithBrackets(chars) {
  const stacks = chars.reduce(
    ({ items, ops, continueNumber }, char, index) => {
      const isBracket = char === BRACKET
      if (isBracket) {
        return {
          items: [...items, { char, type: TYPE_GROUP }],
          ops,
          continueNumber: false,
        }
      }

      const isMinusSign = charIsMinusSign(chars, index)
      const nextIsMinusSign = charIsMinusSign(chars, index + 1)

      const isOperator =
        index > 0 &&
        index < chars.length - 1 &&
        !isMinusSign &&
        char in OPERATORS &&
        !(chars[index - 1] in OPERATORS) &&
        !(chars[index + 1] in OPERATORS && !nextIsMinusSign)

      if (isOperator) {
        const poppedOps = ops
          .slice()
          .reverse()
          .reduce(
            ({ stop, popped }, op) => {
              if (stop) {
                return { stop, popped }
              }

              const higherPrecedence = PRECEDENCE[op.char] > PRECEDENCE[char]

              if (higherPrecedence) {
                return { stop: true, popped }
              }

              return { stop, popped: [...popped, op] }
            },
            { stop: false, popped: [] },
          ).popped

        return {
          items: [...items, ...poppedOps],
          ops: [
            ...ops.slice(0, ops.length - poppedOps.length),
            { char, type: TYPE_OPERATOR },
          ],
          continueNumber: false,
        }
      }

      if (continueNumber) {
        return {
          items: [
            ...items.slice(0, items.length - 1),
            {
              char: `${items[items.length - 1].char}${char}`,
              type: TYPE_NUMBER,
            },
          ],
          ops,
          continueNumber: true,
        }
      }

      return {
        items: [...items, { char, type: TYPE_NUMBER }],
        ops,
        continueNumber: true,
      }
    },
    { items: [], ops: [], continueNumber: false },
  )

  return [...stacks.items, ...stacks.ops.reverse()]
}

function infixToPostfix(infix = '2 + 3 * (5 / 2)', level = 0) {
  const bracketSections = getBracketSections(infix)

  const invalidBrackets =
    bracketSections.length &&
    bracketSections[bracketSections.length - 1].close === null
  if (invalidBrackets) {
    return 0
  }

  const chars = getCharsWithBrackets(bracketSections, infix).filter(
    (item) => !(typeof item === 'string' && item.match(/\s/)),
  )

  const bits = processCharsWithBrackets(chars)

  let bracketIndex = -1

  return bits
    .map(({ char }) => char)
    .join(' ')
    .replace(new RegExp(BRACKET, 'g'), () => {
      bracketIndex++

      return infixToPostfix(
        infix.substring(
          bracketSections[bracketIndex].open + 1,
          bracketSections[bracketIndex].close,
        ),
        level + 1,
      )
    })
}
function evaluatePostfix(raw) {
  if (!raw.length) {
    return 0
  }

  const result = raw
    .replace(/(\s+|,)/, ' ')
    .split(' ')
    .reduce((stack, char) => {
      if (char in OPERATORS) {
        const arg2 = stack.pop()
        const arg1 = stack.pop()

        return [...stack, OPERATORS[char](arg1, arg2)]
      }

      return [...stack, Number(char)]
    }, [])

  if (result.length !== 1) {
    return 0
  }

  return result[0]
}

function evaluateInfix(raw) {
  const formatted = formatInfix(raw)

  const postfix = infixToPostfix(formatted)

  const result = evaluatePostfix(postfix)

  if (result === null || isNaN(result)) {
    return 0
  }

  return result
}

export { evaluateInfix }
