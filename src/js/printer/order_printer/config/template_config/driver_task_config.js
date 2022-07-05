export default {
  name: '配送任务清单',
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
        text: '配送任务清单',
        style: {
          position: 'absolute',
          left: '0px',
          top: '0px',
          right: '0px',
          textAlign: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
        },
      },
      {
        text: '配送司机: {{配送司机}}',
        style: {
          position: 'absolute',
          left: '4px',
          top: '39px',
        },
      },
      {
        text: '车牌号：{{车牌号}}',
        style: {
          position: 'absolute',
          left: '154px',
          top: '39px',
        },
      },
      {
        text: '打印时间：{{打印时间}}',
        style: {
          position: 'absolute',
          left: '',
          top: '39px',
          right: '11px',
        },
      },
      {
        text: '联系方式：{{联系方式}}',
        style: {
          position: 'absolute',
          left: '',
          top: '39px',
          right: '297px',
        },
      },
    ],
    style: {
      height: '57px',
    },
  },
  contents: [
    {
      type: 'table',
      dataKey: 'driver_task',
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
          head: '商户名',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.商户名}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '收货地址',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.收货地址}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '收货时间',
          headStyle: {
            width: '92px',
            textAlign: 'center',
          },
          text: '{{列.收货时间}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '配送框数',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.配送框数}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '回收框数',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.回收框数}}',
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
