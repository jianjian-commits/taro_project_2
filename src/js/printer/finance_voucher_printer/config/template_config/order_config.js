export default {
  name: '付款凭证',
  page: {
    gap: {
      paddingTop: '5mm',
      paddingRight: '5mm',
      paddingBottom: '5mm',
      paddingLeft: '5mm',
    },
    name: '自定义纸张',
    size: { width: '210mm', height: '120mm' },
    type: 'DIY',
    printDirection: 'vertical',
  },
  sign: {
    style: { height: '17px' },
  },
  footer: {
    style: { height: '20px', marginTop: '5px', position: 'static !important' },
    blocks: [
      {
        text: '供应商：',
        style: {
          position: 'absolute',
          left: '3px',
          top: '0px',
          fontSize: '14px',
        },
      },
      {
        text: '保管员：',
        style: {
          position: 'absolute',
          left: '190px',
          top: '0px',
          fontSize: '14px',
        },
      },
      {
        text: '食堂主任：',
        style: {
          position: 'absolute',
          left: '390px',
          top: '0px',
          fontSize: '14px',
        },
      },
      {
        text: '摊主：',
        style: {
          position: 'absolute',
          left: '610px',
          top: '0px',
          fontSize: '14px',
        },
      },
    ],
  },
  header: {
    style: { height: '55px' },
    blocks: [
      {
        text: '付款凭证',
        style: {
          top: '-2px',
          left: '-9px',
          right: '0px',
          fontSize: '21px',
          position: 'absolute',
          textAlign: 'center',
        },
      },
      {
        text: '摊位：{{商户公司}}',
        style: {
          top: '34px',
          left: '34px',
          position: 'absolute',
          fontSize: '14px',
        },
      },
      {
        text: '{{收货时间_日期}}',
        style: {
          top: '34px',
          left: '630px',
          position: 'absolute',
          fontSize: '14px',
        },
      },
    ],
  },
  contents: [
    {
      type: 'table',
      columns: [
        {
          head: '品名',
          text: '{{列.商品名}}',
          style: {
            textAlign: 'center',
            fontSize: '14px',
            verticalAlign: 'bottom',
            height: '7mm',
            width: '28mm',
            padding: '0px',
          },
          headStyle: { textAlign: 'center', fontSize: '14px', height: '8mm' },
        },
        {
          head: '数量',
          text: '{{列.出库数_销售单位}}',
          style: {
            textAlign: 'center',
            fontSize: '14px',
            verticalAlign: 'bottom',
            height: '7mm',
            width: '15mm',
            padding: '0px',
          },
          headStyle: { textAlign: 'center', fontSize: '14px', height: '8mm' },
        },
        {
          head: '单价',
          text: '{{列.单价_销售单位}}',
          style: {
            textAlign: 'center',
            fontSize: '14px',
            verticalAlign: 'bottom',
            height: '7mm',
            width: '15mm',
            padding: '0px',
          },
          headStyle: { textAlign: 'center', height: '8mm' },
        },
        {
          head: '付款金额',
          headStyle: { textAlign: 'center', fontSize: '14px', height: '8mm' },
          text: '{{列.出库金额}}',
          style: {
            textAlign: 'right',
            paddingRight: '10px',
            width: '24mm',
            fontSize: '14px',
            height: '7mm',
          },
        },
        {
          head: '备注',
          headStyle: { textAlign: 'center', fontSize: '14px', height: '8mm' },
          text: '',
          style: {
            textAlign: 'center',
            fontSize: '14px',
            verticalAlign: 'bottom',
            height: '7mm',
            padding: '0px',
          },
        },
      ],
      dataKey: 'orders_multi_vertical', // 双栏纵向
      subtotal: {
        show: true,
        needUpperCase: true,
        isUpperCaseBefore: true,
        isUpperLowerCaseSeparate: true,
        style: {
          fontSize: '14px',
          fields: [
            {
              name: '每页合计：',
              valueField: 'real_item_price',
            },
          ],
        },
      },
      className: '',
    },
  ],
  specialConfig: 'noSpecail',
  financeSpecialConfig: {
    pageFixLineNum: 7,
    printHead: '湖南科技大学后勤管理处饮食中心食堂购货付款凭证',
    CapitalPrefix: '大写',
    LowercasePrefix: '小写',
  },
}
