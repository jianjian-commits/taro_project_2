export default {
  name: '',
  page: {
    name: 'A4',
    size: {
      width: '210mm',
      height: '297mm',
    },
    printDirection: 'vertical',
    type: 'A4',
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
        text: '配送单',
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
        text: '账户名: {{账户名}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '打印时间：{{当前时间}}',
        style: {
          left: '2px',
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
      blocks: [
        {
          type: 'counter',
          style: {},
        },
      ],
      style: {
        height: 'auto',
      },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'orders',
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
          style: {
            textAlign: 'center',
          },
          text: '{{列.序号}}',
        },
        {
          head: '类别',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.类别}}',
        },
        {
          head: '商品名',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品名}}',
        },
        {
          head: '规格',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.规格}}',
        },
        {
          head: '下单数',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.下单数}}{{列.销售单位}}',
        },
        {
          head: '出库数(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.出库数_基本单位}}{{列.基本单位}}',
        },
        {
          head: '出库金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.出库金额}}',
        },
      ],
    },
    {
      blocks: [],
      style: {
        height: '15px',
      },
    },
    {
      blocks: [
        {
          text: '下单金额：￥{{下单金额}}',
          style: {
            left: '1px',
            position: 'absolute',
            top: '10px',
          },
        },
        {
          text: '出库金额：￥{{出库金额}}',
          style: {
            left: '162px',
            position: 'absolute',
            top: '10px',
          },
        },
        {
          text: '运费：￥{{运费}}',
          style: {
            left: '309px',
            position: 'absolute',
            top: '10px',
          },
        },
        {
          text: '异常金额：￥{{异常金额}}',
          style: {
            left: '424px',
            position: 'absolute',
            top: '10px',
          },
        },
        {
          text: '销售额(含运税)：￥{{销售额_含运税}}',
          style: {
            left: '570px',
            position: 'absolute',
            top: '10px',
          },
        },
      ],
      style: {
        height: '69px',
      },
    },
  ],
  sign: {
    blocks: [
      {
        text: '签收人：',
        style: {
          left: '600px',
          position: 'absolute',
          top: '5px',
        },
      },
    ],
    style: {
      height: '46px',
    },
  },
  footer: {
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: {
          right: '',
          left: '48%',
          position: 'absolute',
          top: '0px',
        },
      },
    ],
    style: {
      height: '15px',
    },
  },
}
