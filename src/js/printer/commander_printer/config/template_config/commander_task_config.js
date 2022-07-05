export default {
  name: '团长任务核查单',
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
        text: '团长任务核查单',
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
      type: 'table',
      dataKey: 'commander_task',
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
          head: '订单号',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.订单号}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '商品数',
          text: '{{列.商品数}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '订单金额',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.订单金额}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '订单备注',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.订单备注}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '配送方式',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.配送方式}}',
        },
        {
          head: '用户名',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.用户名}}',
        },
        {
          head: '用户手机',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.用户手机}}',
        },
        {
          head: '收货地址',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.收货地址}}',
        },
        {
          head: '收货时间',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.收货时间}}',
        },
        {
          head: '签收',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.签收}}',
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
