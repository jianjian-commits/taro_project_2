export default {
  name: '默认模板',
  page: { type: '70X50', customizeWidth: 100, customizeHeight: 100 },
  blocks: [
    {
      type: 'barcode',
      style: {
        top: '5px',
        left: '47px',
        width: '165px',
        height: '50px',
        position: 'absolute',
      },
      barcode: '{{商品码}}',
    },
    {
      type: 'line',
      style: {
        top: '73px',
        left: '0px',
        width: '100%',
        position: 'absolute',
        borderTopColor: 'black',
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
      },
    },
    {
      text: '{{SKU}}({{规格}})',
      style: {
        top: '87px',
        left: '9px',
        fontSize: '16px',
        position: 'absolute',
      },
      fieldKey: '商品名',
    },
    {
      text: '',
      style: {
        top: '87px',
        left: '74px',
        fontSize: '16px',
        position: 'absolute',
      },
      fieldKey: '规格',
    },
    {
      text: '{{实称数_基本单位}}',
      style: {
        top: '111px',
        left: '9px',
        fontSize: '16px',
        position: 'absolute',
        fontWeight: 'bold',
      },
      fieldKey: '实称数(基本单位)',
    },
  ],
}
