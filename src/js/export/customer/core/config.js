import { border, alignmentLeft } from '../../enum'

export const getTableConfig = (id) => ({
  id,
  type: 'table',
  style: {
    border,
  },
  columns: [],
})

export const getBlockConfig = (id) => ({
  type: 'block',
  id,
  block: {
    style: {
      border,
      alignment: alignmentLeft,
    },
    rows: [],
  },
})

export const getEmpty = () => ({
  id: 'empty',
  type: 'block',
  block: { rows: [] },
})
