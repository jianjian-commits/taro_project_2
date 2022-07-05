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
    style: { height: '90px' },
    blocks: [
      {
        text: '付款单',
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
        text: '往来单位： {{往来单位}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: '单据日期： {{单据日期}}',
        style: {
          left: '240px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: '单据编号： {{单据编号}}',
        style: {
          left: '460px',
          position: 'absolute',
          top: '62px',
        },
      },
    ],
  },
  contents: [
    {
      blocks: [
        {
          text: '开户银行：{{开户银行}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '6px',
          },
        },
        {
          text: '银行账号：{{银行账号}}',
          style: {
            left: '240px',
            position: 'absolute',
            top: '6px',
          },
        },
        {
          text: '结款方式：{{结款方式}}',
          style: {
            left: '460px',
            position: 'absolute',
            top: '6px',
          },
        },
        {
          text: '开户名：{{开户名}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '40px',
          },
        },
        {
          text: '付款单摘要：{{付款单摘要}}',
          style: {
            left: '240px',
            position: 'absolute',
            top: '40px',
          },
        },
        {
          text: '联系电话：{{联系电话}}',
          style: {
            left: '460px',
            position: 'absolute',
            top: '40px',
          },
        },
      ],
      style: {
        height: '70px',
      },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'ordinary',
      subtotal: {
        show: true,
        fields: [
          {
            name: '金额',
            valueField: 'total_money2',
          },
          {
            name: '结算金额',
            valueField: 'settle_money2',
          },
        ],
        displayName: true,
      },
      specialConfig: { style: {} },
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
          head: '单据编号',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.单据编号}}',
        },
        {
          head: '金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.金额}}',
        },
        {
          head: '结算金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.结算金额}}',
        },
      ],
    },
    {
      style: { blocks: [], height: '15px' },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'delta',
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
          head: '折让原因',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.折让原因}}',
        },
        {
          head: '折让类型',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.折让类型}}',
        },
        {
          head: '折让金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.折让金额}}',
        },
        {
          head: '备注',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.备注}}',
        },
      ],
    },
    {
      blocks: [
        {
          text: '结算金额: ￥{{结算金额}}',
          style: { position: 'absolute', left: '632px', top: '12px' },
        },
        {
          text: '单据金额: ￥{{单据金额}}',
          style: { position: 'absolute', left: '2px', top: '12px' },
        },
        {
          text: '折让金额: ￥{{折让金额}}',
          style: { position: 'absolute', left: '317px', top: '12px' },
        },
      ],
      style: { height: '50px' },
    },
  ],
  sign: {
    blocks: [
      {
        text: '经办人：',
        style: {
          left: '40px',
          position: 'absolute',
          top: '5px',
        },
      },
      {
        text: '制单人：{{制单人}}',
        style: {
          left: '550px',
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
