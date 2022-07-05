/** value 不要加多语言,加者GG🔥🚸 */
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import globalStore from 'stores/global'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('下单时间'), value: '{{下单时间}}' },
    { key: i18next.t('配送时间'), value: '{{配送时间}}' },
    { key: i18next.t('打印时间'), value: '{{当前时间}}' },
    { key: i18next.t('订单号'), value: '{{订单号}}' },
    { key: i18next.t('分拣序号'), value: '{{分拣序号}}' },
    { key: i18next.t('订单备注'), value: '{{订单备注}}' },
    { key: i18next.t('结款方式'), value: '{{结款方式}}' },
    { key: i18next.t('销售经理'), value: '{{销售经理}}' },
    { key: i18next.t('销售经理电话'), value: '{{销售经理电话}}' },
    {
      key: i18next.t('总下单数(销售单位)'),
      value: '{{下单总数_销售单位}}',
    },
    {
      key: i18next.t('出库总数(销售单位)'),
      value: '{{出库总数_销售单位}}',
    },
    { key: i18next.t('支付状态'), value: '{{支付状态}}' },
    { key: i18next.t('打印人'), value: '{{打印人}}' },
    { key: i18next.t('下单账号'), value: '{{下单账号}}' },
    { key: i18next.t('下单员'), value: '{{下单员}}' },
    { key: i18next.t('结款周期'), value: '{{结款周期}}' },
    { key: i18next.t('授信额度'), value: '{{授信额度}}' },
    { key: i18next.t('箱数'), value: '{{箱数}}' },
    { key: i18next.t('订单类型'), value: '{{订单类型}}' },
  ],
  [i18next.t('配送')]: [
    { key: i18next.t('线路'), value: '{{线路}}' },
    {
      key: i18next.t('收货商户'),
      value: '{{收货商户}}({{商户ID}})',
    },
    { key: i18next.t('商户自定义编码'), value: '{{商户自定义编码}}' },
    { key: i18next.t('收货人'), value: '{{收货人}}' },
    { key: i18next.t('收货人电话'), value: '{{收货人电话}}' },
    { key: i18next.t('收货地址'), value: '{{收货地址}}' },
    { key: i18next.t('收货时间'), value: '{{收货时间}}' },
    { key: i18next.t('收货日期(星期)'), value: '{{收货日期_星期}}' },
    {
      key: i18next.t('地理标签'),
      value: '{{城市}}{{城区}}{{街道}}',
    },
    { key: i18next.t('商户公司'), value: '{{商户公司}}' },
    { key: i18next.t('承运商'), value: '{{承运商}}' },
    { key: i18next.t('司机名称'), value: '{{司机名称}}' },
    { key: i18next.t('司机电话'), value: '{{司机电话}}' },
    { key: i18next.t('收货方式'), value: '{{收货方式}}' },
    { key: i18next.t('自提点名称'), value: '{{自提点名称}}' },
    { key: i18next.t('自提点负责人'), value: '{{自提点负责人}}' },
    { key: i18next.t('自提点联系方式'), value: '{{自提点联系方式}}' },
    { key: i18next.t('车牌号码'), value: '{{车牌号码}}' },
    { key: i18next.t('车型'), value: '{{车型}}' },
    { key: i18next.t('满载框数'), value: '{{满载框数}}' },
    { key: i18next.t('社区店名称'), value: '{{社区店名称}}' },
    { key: i18next.t('团长姓名'), value: '{{团长姓名}}' },
    { key: i18next.t('团长账户'), value: '{{团长账户}}' },
    { key: i18next.t('团长地址'), value: '{{团长地址}}' },
    { key: i18next.t('团长电话'), value: '{{团长电话}}' },
    { key: i18next.t('分仓客户编号'), value: '{{分仓客户编号}}' },
    { key: i18next.t('分仓客户名称'), value: '{{分仓客户名称}}' },
    { key: i18next.t('商户自定义字段1'), value: '{{商户自定义字段1}}' },
    { key: i18next.t('商户自定义字段2'), value: '{{商户自定义字段2}}' },
    { key: i18next.t('商自定义字段3'), value: '{{商户自定义字段3}}' },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('下单金额'), value: '{{下单金额}}' },
    { key: i18next.t('优惠金额'), value: '{{优惠金额}}' },
    { key: i18next.t('出库金额'), value: '{{出库金额}}' },
    { key: i18next.t('运费'), value: '{{运费}}' },
    { key: i18next.t('异常金额'), value: '{{异常金额}}' },
    { key: i18next.t('销售额(含运税)'), value: '{{销售额_含运税}}' },
    { key: i18next.t('税额'), value: '{{税额}}' },
    { key: i18next.t('原总金额'), value: '{{原总金额}}' },
    { key: i18next.t('原销售额'), value: '{{原销售额}}' },
    { key: i18next.t('折扣金额'), value: '{{折扣金额}}' },
  ],
  [i18next.t('套账')]: [
    { key: i18next.t('实际下单金额'), value: '{{实际下单金额}}' },
    { key: i18next.t('套账下单金额'), value: '{{套账下单金额}}' },
    { key: i18next.t('套账出库金额'), value: '{{套账出库金额}}' },
    { key: i18next.t('总加单金额'), value: '{{总加单金额}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}} / {{页码总数}}' },
    { key: i18next.t('订单溯源码'), value: '{{订单溯源码}}' },
    { key: i18next.t('签名'), value: '{{signature_image_url}}', type: 'image' }, // 图片类型
    { key: i18next.t('分拣重点关注'), value: '{{分拣重点关注}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: '{{列.序号}}' },
    { key: i18next.t('商品ID'), value: '{{列.商品ID}}' },
    { key: i18next.t('商品名'), value: '{{列.商品名}}' },
    { key: i18next.t('商品名（不带*号）'), value: '{{列.商品名_无星号}}' },
    { key: i18next.t('类别'), value: '{{列.类别}}' },
    { key: i18next.t('商品二级分类'), value: '{{列.商品二级分类}}' },
    { key: i18next.t('商品品类'), value: '{{列.商品品类}}' },
    { key: i18next.t('SPU名称'), value: '{{列.SPU名称}}' },
    { key: i18next.t('规格'), value: '{{列.规格}}' },
    { key: i18next.t('税率'), value: '{{列.税率}}' },
    { key: i18next.t('规格自定义编码'), value: '{{列.自定义编码}}' },
    { key: i18next.t('商品自定义编码'), value: '{{列.商品自定义编码}}' },
    { key: i18next.t('商品描述'), value: '{{列.商品描述}}' },
    { key: i18next.t('生产日期'), value: '{{列.生产日期}}' },
    { key: i18next.t('保质期'), value: '{{列.保质期}}' },
    { key: i18next.t('备注'), value: '{{列.备注}}' },
    { key: i18next.t('默认供应商'), value: '{{列.默认供应商}}' },
    { key: i18next.t('箱号'), value: '{{列.箱号}}' },
    { key: i18next.t('上浮率'), value: '{{列.上浮率}}' },
    { key: i18next.t('商品生产日期'), value: '{{列.商品生产日期}}' },
    { key: i18next.t('自定义'), value: '' },
    { key: i18next.t('商品特征'), value: '{{列.商品特征}}' },
    { key: i18next.t('品牌'), value: '{{列.品牌}}' },
    { key: i18next.t('区域'), value: '{{列.区域}}' },
    { key: i18next.t('产地'), value: '{{列.产地}}' },
    { key: i18next.t('商品规格'), value: '{{列.商品规格}}' },
    { key: i18next.t('售后标准'), value: '{{列.售后标准}}' },
  ],
  [i18next.t('价格')]: [
    {
      key: i18next.t('不含税单价(基本单位)'),
      value: '{{列.不含税单价_基本单位}}',
    },
    {
      key: i18next.t('不含税单价(销售单位)'),
      value: '{{列.不含税单价_销售单位}}',
    },
    {
      key: i18next.t('单价(基本单位)'),
      value: '{{列.单价_基本单位}}',
    },
    {
      key: i18next.t('单价(销售单位)'),
      value: '{{列.单价_销售单位}}',
    },
    {
      key: i18next.t('原单价(基本单位)'),
      value: '{{列.原单价_基本单位}}',
    },
    {
      key: i18next.t('原单价(销售单位)'),
      value: '{{列.原单价_销售单位}}',
    },
    {
      key: i18next.t('单价(基本单位_0元展现为“时价”)'),
      value: '{{列.单价_基本单位_时价}}',
    },
    {
      key: i18next.t('单价(销售单位_0元展现为“时价”)'),
      value: '{{列.单价_销售单位_时价}}',
    },
    {
      key: i18next.t('报价单原价'),
      value: '{{列.报价单原价}}',
    },
    {
      key: i18next.t('变化率'),
      value: '{{列.变化率}}',
    },
    {
      key: i18next.t('变化前单价(基本单位)'),
      value: '{{列.变化前单价_基本单位}}',
    },
    {
      key: i18next.t('变化前单价(销售单位)'),
      value: '{{列.变化前单价_销售单位}}',
    },
  ],
  [i18next.t('数量')]: [
    {
      key: i18next.t('下单数'),
      value: '{{列.下单数}}{{列.销售单位}}',
    },
    {
      key: i18next.t('实际出库数'),
      value: '{{列.实际出库数}}{{列.基本单位}}',
    },
    {
      key: i18next.t('实际出库数(销售单位)'),
      value: '{{列.实际出库数_销售单位}}{{列.销售单位}}',
    },
    {
      key: i18next.t('出库数(基本单位)'),
      value: '{{列.出库数_基本单位}}{{列.基本单位}}',
    },
    {
      key: i18next.t('出库数(销售单位)'),
      value: '{{列.出库数_销售单位}}{{列.销售单位}}',
    },
    {
      key: i18next.t('称重数(销售单位)'),
      value: '{{列.称重数_销售单位}}{{列.销售单位}}',
    },
    {
      key: i18next.t('初始下单数'),
      value: '{{列.初始下单数}}{{列.销售单位}}',
    },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('商品税额'), value: '{{列.商品税额}}' },
    { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
    {
      key: i18next.t('出库金额(不含税)'),
      value: '{{列.出库金额_不含税}}',
    },
    { key: i18next.t('原金额'), value: '{{列.原金额}}' },
    { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
    { key: i18next.t('实际金额'), value: '{{列.实际金额}}' },
    { key: i18next.t('补差（销售单位）'), value: '{{列.补差_销售单位}}' },
    { key: i18next.t('补差（基本单位）'), value: '{{列.补差_基本单位}}' },
  ],
  [i18next.t('异常')]: [
    { key: i18next.t('异常原因'), value: '{{列.异常原因}}' },
    { key: i18next.t('异常描述'), value: '{{列.异常描述}}' },
    { key: i18next.t('异常数量'), value: '{{列.异常数量}}' },
    { key: i18next.t('异常金额'), value: '{{列.异常金额}}' },
    { key: i18next.t('售后类型'), value: '{{列.售后类型}}' },
  ],
  [i18next.t('套账')]: [
    { key: i18next.t('实际下单数'), value: '{{列.实际下单数}}' },
    {
      key: i18next.t('实际下单金额'),
      value: '{{列.实际下单金额}}',
    },
    { key: i18next.t('加单数1'), value: '{{列.加单数1}}' },
    { key: i18next.t('加单金额1'), value: '{{列.加单金额1}}' },
    { key: i18next.t('加单数2'), value: '{{列.加单数2}}' },
    { key: i18next.t('加单金额2'), value: '{{列.加单金额2}}' },
    { key: i18next.t('加单数3'), value: '{{列.加单数3}}' },
    { key: i18next.t('加单金额3'), value: '{{列.加单金额3}}' },
    { key: i18next.t('加单数4'), value: '{{列.加单数4}}' },
    { key: i18next.t('加单金额4'), value: '{{列.加单金额4}}' },
    { key: i18next.t('套账下单总数'), value: '{{列.套账下单总数}}' },
    { key: i18next.t('套账出库总数'), value: '{{列.套账出库总数}}' },
    { key: i18next.t('套账下单金额'), value: '{{列.套账下单金额}}' },
    { key: i18next.t('套账出库金额'), value: '{{列.套账出库金额}}' },
    { key: i18next.t('总加单金额'), value: '{{列.总加单金额}}' },
  ],
}

const summaryFields = [
  { key: i18next.t('下单金额'), value: '{{列.下单金额}}' },
  { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
  { key: i18next.t('商品税额'), value: '{{列.商品税额}}' },
  { key: i18next.t('出库金额(不含税)'), value: '{{列.出库金额_不含税}}' },
  { key: i18next.t('实际金额'), value: '{{列.实际金额}}' },
  { key: i18next.t('下单数'), value: '{{列.下单数}}{{列.销售单位}}' },
  {
    key: i18next.t('称重数(销售单位)'),
    value: '{{列.称重数_销售单位}}{{列.销售单位}}',
  },
  {
    key: i18next.t('出库数(基本单位)'),
    value: '{{列.出库数_基本单位}}{{列.基本单位}}',
  },
  {
    key: i18next.t('出库数(销售单位)'),
    value: '{{列.出库数_销售单位}}{{列.销售单位}}',
  },
  {
    key: i18next.t('实际出库数'),
    value: '{{列.实际出库数}}{{列.基本单位}}',
  },
]

const specialFields = [
  {
    id: 'noSpecail',
    value: i18next.t('无特殊控制'),
  },
  {
    id: 'orderQuanty',
    value: i18next.t(
      '下单数量（基本单位或销售单位）为0.01时不展现下单数（基本单位和销售单位），下单金额，出库数（基本单位，销售单位），出库金额，销售额',
    ),
  },
  {
    id: 'basicUnit',
    value: i18next.t('基本单位与销售单位不一致时出库金额，销售金额为空'),
  },
  {
    id: 'rateSort',
    value: i18next.t('是否按税率排序'),
  },
]

;(function customizeFields() {
  if (globalStore.isHuaKang()) {
    tableFields[i18next.t('数量')].push({
      key: i18next.t('销售出库数'),
      value: '{{列.销售出库数}}{{列.销售单位}}',
    })
    tableFields[i18next.t('金额')].push({
      key: i18next.t('销售出库金额'),
      value: '{{列.销售出库金额}}',
    })
    summaryFields.push({
      key: i18next.t('销售出库金额'),
      value: '{{列.销售出库金额}}',
    })
  }
})()
;(function () {
  if (globalStore.isLvKangYuan()) {
    commonFields[i18next.t('金额')].push({
      key: i18next.t('套餐价'),
      value: '{{套餐价}}',
    })
  }
})()
;(function () {
  if (globalStore.isdqhq()) {
    tableFields[i18next.t('金额')].push({
      key: i18next.t('折前金额'),
      value: '{{列.折前金额}}',
    })
    summaryFields.push({
      key: i18next.t('折前金额'),
      value: '{{列.折前金额}}',
    })
  }
})()

export const customizeConfigFields = (infoConfigs, detailConfigs) => {
  if (_.keys(infoConfigs).length) {
    commonFields[i18next.t('自定义字段')] = []
    _.forEach(infoConfigs, (v) => {
      commonFields[i18next.t('自定义字段')].push({
        key: v.field_name,
        value: `{{自定义_${v.id}}}`,
      })
    })
  }
  if (_.keys(detailConfigs).length) {
    tableFields[i18next.t('自定义字段')] = []
    _.forEach(detailConfigs, (v) => {
      tableFields[i18next.t('自定义字段')].push({
        key: v.field_name,
        value: `{{列.自定义_${v.id}}}`,
      })
    })
  }
}

export default {
  commonFields,
  tableFields,
  summaryFields,
  specialFields,
}
