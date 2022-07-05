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
    style: { height: '140px' },
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: {
          right: '',
          left: '10px',
          position: 'absolute',
          top: '0px',
        },
      },
      {
        text: '{{智能菜单名称}}',
        style: {
          right: '0px',
          left: '0px',
          position: 'absolute',
          top: '10px',
          fontWeight: 'bold',
          fontSize: '26px',
          textAlign: 'center',
        },
      },
      {
        text: '店铺名称： {{店铺名称}}',
        style: {
          left: '10px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: '客服电话： {{客服电话}}',
        style: {
          left: '480px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: '',
        style: {
          position: 'absolute',
          left: '0px',
          top: '82px',
          width: '100%',
          borderBottom: '1px solid',
        },
      },
      {
        text: '商户：{{商户}}',
        style: {
          left: '10px',
          position: 'absolute',
          top: '90px',
        },
      },
      {
        text: '联系方式：{{联系方式}}',
        style: {
          left: '480px',
          position: 'absolute',
          top: '90px',
        },
      },
      {
        text: '备注信息：{{备注信息}}',
        style: {
          left: '10px',
          position: 'absolute',
          top: '115px',
        },
      },
    ],
  },
  contents: [
    {
      className: '',
      type: 'table',
      dataKey: 'menu',
      customerRowHeight: 30,
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
      columns: [
        {
          head: '商品名',
          headStyle: {
            width: '100px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
            wordBreak: 'break-all',
          },
          text: '{{列.商品名1}}',
        },
        {
          head: '规格',
          headStyle: {
            width: '60px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.规格1}}',
        },
        {
          head: '下单数',
          headStyle: {
            width: '50px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'right',
          },
          text: '{{列.下单数1}}',
        },
        {
          head: '商品名',
          headStyle: {
            width: '100px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
            wordBreak: 'break-all',
          },
          text: '{{列.商品名2}}',
        },
        {
          head: '规格',
          headStyle: {
            width: '60px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.规格2}}',
        },
        {
          head: '下单数',
          headStyle: {
            width: '50px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'right',
          },
          text: '{{列.下单数2}}',
        },
        {
          head: '商品名',
          headStyle: {
            width: '100px',
            textAlign: 'center',
          },
          style: {
            wordBreak: 'break-all',
            textAlign: 'center',
          },
          text: '{{列.商品名3}}',
        },
        {
          head: '规格',
          headStyle: {
            width: '60px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.规格3}}',
        },
        {
          head: '下单数',
          headStyle: {
            width: '50px',
            textAlign: 'center',
          },
          style: {
            textAlign: 'right',
          },
          text: '{{列.下单数3}}',
        },
      ],
    },
  ],
  sign: {
    blocks: [],
    style: {
      height: '10px',
    },
  },
  footer: {
    blocks: [],
    style: {
      height: '10px',
    },
  },
}
