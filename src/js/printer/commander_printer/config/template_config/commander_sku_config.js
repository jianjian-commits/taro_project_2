export default {
  name: '团长商品清单',
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
        text: '团长商品清单',
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
        text: '社区店名称: {{社区店名称}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '打印时间：{{打印时间}}',
        style: {
          right: '',
          left: '553px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '团长名称：{{团长名称}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '76px',
        },
      },
      {
        text: '团长电话：{{团长电话}}',
        style: {
          left: '553px',
          position: 'absolute',
          top: '76px',
        },
      },
      {
        text: '团长地址：{{团长地址}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '102px',
        },
      },
    ],
    style: {
      height: '127px',
    },
  },
  contents: [
    {
      style: {
        height: 'auto',
      },
      blocks: [
        {
          style: {},
          type: 'counter',
          value: ['len', 'quantity'],
        },
      ],
    },
    {
      type: 'table',
      dataKey: 'commander_sku',
      subtotal: {
        show: false,
        fields: [
          {
            name: '每页合计：',
            valueField: 'real_item_price',
          },
        ],
      },
      specialConfig: {
        style: {
          fontSize: '16px',
        },
      },
      columns: [
        {
          head: '商品名称',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.商品名称}}',
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
          head: '销售规格',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.销售规格}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '下单数',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.下单数}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '售后异常数',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.售后异常数}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '明细',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.明细}}',
          style: {
            textAlign: 'center',
          },
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
