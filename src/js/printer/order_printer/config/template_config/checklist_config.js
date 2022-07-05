export default {
  name: '分拣核查单',
  page: {
    type: 'A4',
    name: 'A4',
    printDirection: 'vertical',
    size: {
      width: '210mm',
      height: '297mm',
    },
    gap: {
      paddingRight: '5mm',
      paddingLeft: '5mm',
      paddingBottom: '5mm',
      paddingTop: '5mm',
    },
  },
  header: {
    blocks: [
      {
        text: '分拣核查单',
        style: {
          right: '0px',
          left: '0px',
          position: 'absolute',
          top: '0px',
          fontWeight: 'bold',
          fontSize: '26px',
          textAlign: 'center',
        },
      },
      {
        text: '订单号: {{订单号}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '分拣序号：{{分拣序号}}',
        style: {
          left: '261px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '司机：{{司机}}',
        style: {
          right: '',
          left: '553px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '商户名：{{商户名}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '76px',
        },
      },
      {
        text: '线路：{{线路}}',
        style: {
          left: '261px',
          position: 'absolute',
          top: '76px',
        },
      },
    ],
    style: {
      height: '97px',
    },
  },
  contents: [
    {
      type: 'table',
      dataKey: 'check_list',
      subtotal: {
        show: false,
        fields: [
          {
            name: '每页合计：',
            valueField: 'real_item_price',
          },
        ],
      },
      columns: [
        {
          head: '序号',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.序号}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '分类',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.分类}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '商品ID',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.商品ID}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '商品名',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.商品名}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '规格',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.规格}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '下单数(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.下单数_基本单位}}{{列.基本单位}}',
        },
        {
          head: '实配数(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.实配数_基本单位}}{{列.基本单位}}',
        },
      ],
      className: '',
    },
  ],
  sign: {
    blocks: [],
    style: {
      height: '0',
    },
  },
  footer: {
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: {
          position: 'absolute',
          left: '',
          top: '-0.15625px',
          right: '0px',
        },
      },
    ],
    style: {
      height: '15px',
    },
  },
}
