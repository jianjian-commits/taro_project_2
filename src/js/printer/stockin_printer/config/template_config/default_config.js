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
  header: { style: { height: '0px' }, blocks: [] },
  contents: [
    {
      blocks: [
        {
          text: '进货单',
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
          text: '单据日期： {{单据日期}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '62px',
          },
        },
        {
          text: '单据编号：{{单据编号}}',
          style: {
            left: '430px',
            position: 'absolute',
            top: '62px',
          },
        },
        {
          text: '单据备注：{{单据备注}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '127px',
          },
        },
        {
          text: '往来单位：{{往来单位}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '93px',
          },
        },
      ],
      style: {
        height: '151px',
      },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'orders',
      subtotal: {
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
          head: '批次号',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.批次号}}',
        },
        {
          head: '规格ID',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.规格ID}}',
        },
        {
          head: '商品名称',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品名称}}',
        },
        {
          head: '商品分类',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品分类}}',
        },
        {
          head: '一级分类',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.一级分类}}',
        },
        {
          head: '入库单位(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.入库单位_基本单位}}',
        },
        {
          head: '入库数(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.入库数_基本单位}}',
        },
        {
          head: '入库单价(基本单位)',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.入库单价_基本单位}}',
        },
        {
          head: '入库金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.入库金额}}',
        },
        {
          head: '商品备注',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品备注}}',
        },
      ],
    },
    {
      blocks: [
        {
          text: '折让金额: ￥{{折让金额}}',
          style: { position: 'absolute', left: '632px', top: '12px' },
        },
        {
          text: '整单金额: ￥{{整单金额}}',
          style: { position: 'absolute', left: '2px', top: '12px' },
        },
        {
          text: '商品金额: ￥{{商品金额}}',
          style: { position: 'absolute', left: '317px', top: '12px' },
        },
      ],
      style: { height: '56px' },
    },
  ],
  sign: {
    blocks: [
      {
        text: '仓库签名：',
        style: {
          left: '40px',
          position: 'absolute',
          top: '5px',
        },
      },
      {
        text: '供应商签名：',
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
