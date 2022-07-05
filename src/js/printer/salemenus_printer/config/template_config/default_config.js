export default {
  name: '',
  page: {
    gap: {
      paddingTop: '5mm',
      paddingLeft: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
    },
    name: 'A4',
    size: { width: '210mm', height: '297mm' },
    type: 'A4',
    printDirection: 'vertical',
  },
  sign: { style: { height: '12px' }, blocks: [] },
  footer: {
    style: { height: '17px' },
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: { top: '0px', left: '334px', right: '', position: 'absolute' },
      },
    ],
  },
  header: { style: { height: '0px' }, blocks: [] },
  contents: [
    {
      style: { height: '134px' },
      blocks: [
        {
          text: '报价时间：{{当前时间}}',
          style: { top: '105px', left: '3px', position: 'absolute' },
        },
        {
          text: '订货电话：{{订货电话}}',
          style: { top: '105px', left: '608px', position: 'absolute' },
        },
        {
          text: '报价单',
          style: {
            top: '13px',
            left: '349px',
            fontSize: '26px',
            position: 'absolute',
            fontWeight: 'bold',
          },
        },
        // {
        //   text: '{{logo}}',
        //   type: 'image',
        //   style: {
        //     top: '0px',
        //     left: '0px',
        //     width: '100px',
        //     height: '100px',
        //     position: 'absolute',
        //   },
        // },
        // {
        //   text: '{{qrcode}}',
        //   type: 'qrcode',
        //   style: { top: '8px', left: '676px', width: '75px', height: '75px' },
        // },
      ],
    },
    {
      type: 'table',
      className: '',
      columns: [
        {
          head: '序号',
          text: '{{列.序号}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
        {
          head: '商品名称',
          text: '{{列.商品名称}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
        {
          head: '规格',
          text: '{{列.规格}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
        {
          head: '销售价',
          text: '{{列.销售价_销售单位}}',
          style: { textAlign: 'center' },
          headStyle: { textAlign: 'center' },
        },
      ],
      dataKey: 'orders_multi3',
      subtotal: {
        show: false,
        fields: [
          {
            name: '每页合计：',
            valueField: 'real_item_price',
          },
        ],
      },
      specialConfig: { style: {} },
    },
  ],
}
