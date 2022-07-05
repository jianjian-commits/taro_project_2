export default {
  name: '',
  page: {
    gap: {
      paddingTop: '2mm',
      paddingLeft: '2mm',
      paddingRight: '2mm',
      paddingBottom: '2mm',
    },
    type: 'DIY',
    size: { width: '100mm', height: '100mm' },
    printDirection: 'vertical',
  },
  header: {
    style: { height: '220px' },
    blocks: [
      {
        text: '{{商户名}}',
        style: {
          top: '10px',
          left: '0px',
          right: '0px',
          fontSize: '100px',
          position: 'absolute',
          textAlign: 'center',
          fontWeight: 'bold',
        },
      },
      {
        text: '箱号：{{箱号}}',
        style: {
          top: '0px',
          left: '20px',
          fontSize: '18px',
          position: 'absolute',
          fontWeight: 'bold',
        },
      },
      {
        type: 'line',
        style: {
          position: 'absolute',
          left: '0px',
          top: '180px',
          borderTopColor: 'black',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          width: '100%',
        },
      },
      {
        text: '商品数：{{商品数}}',
        style: {
          top: '185px',
          left: '20px',
          fontSize: '16px',
          position: 'absolute',
        },
      },
    ],
  },
  sign: { style: { height: '0px' }, blocks: [] },
  footer: {
    style: { height: '20px' },
    blocks: [
      {
        text: '页码{{当前页码}}/{{页码总数}}',
        style: {
          top: '0px',
          left: '0px',
          right: '0px',
          fontSize: '14px',
          position: 'absolute',
          textAlign: 'center',
        },
      },
    ],
  },
  contents: [
    {
      className: '',
      type: 'table',
      columns: [
        {
          head: '商品名',
          text: '{{列.商品名}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
        {
          head: '下单数（销售单位）',
          text: '{{列.下单数_销售单位}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
      ],
      dataKey: 'ordinary',
      subtotal: {
        show: false,
        fields: [
          {
            name: '每页合计：',
            valueField: 'real_item_price',
          },
        ],
      },
    },
  ],
}
