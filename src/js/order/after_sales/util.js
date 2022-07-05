const AFTER_SALES_TYPE = {
  0: { typeName: null, dataName: null },
  1: { typeName: 'abnormal', dataName: 'abnormalData' },
  2: { typeName: 'refund', dataName: 'refundData' },
}

const isSelectDisable = (detail, typeName) => {
  return typeName === 'refund' && detail?.state >= 2
}

export { AFTER_SALES_TYPE, isSelectDisable }
