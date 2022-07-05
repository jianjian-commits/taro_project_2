import { i18next, t } from 'gm-i18n'
import React from 'react'
import { LoadingFullScreen } from '@gmfe/react'
import { Flex, Button, Dialog } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import PropTypes from 'prop-types'
import { setTitle } from '@gm-common/tool'

import { ORDER_PRINT_API } from '../../../../printer/order_printer/api'

setTitle(i18next.t('打印'))

const OrderKidMergePrintTwoItem = ({ data }) => {
  const { details, merchandise } = data
  // 表头商户数组对象去重排序
  const merchandiseList = _.uniqWith(merchandise, _.isEqual)
  const productPanel = _.map(details, (p, index) => {
    // 商户分组
    const detailMerchandise = _.groupBy(p.merchandise, 'resname')
    return (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{p.category_title_1}</td>
        <td>{p.name}</td>
        <td>
          {p.std_unit_name_forsale === p.sale_unit_name && p.sale_ratio === 1
            ? `按${p.sale_unit_name}`
            : `${p.sale_ratio}${p.std_unit_name_forsale}/${p.sale_unit_name}`}
        </td>
        {_.map(merchandiseList, (item, index) => {
          // 根据表头的商户顺序插入数据 有数据返回数据，无数据返回空
          if (detailMerchandise[item.resname]) {
            // 合并同商户下的下单总数
            const sum = detailMerchandise[item.resname].reduce((acc, cur) => {
              return acc + cur.sid_real_weight
            }, 0)
            return (
              <td key={index}>
                {Big(sum || 0).toFixed(2)}
                {p.std_unit_name_forsale}
              </td>
            )
          } else {
            return <td>{}</td>
          }
        })}
        <td>{`${p.quantity}${p.sale_unit_name}`}</td>
        <td>{`${p.real_weight}${p.std_unit_name_forsale}`}</td>
        <td>{Big(p.std_sale_price_forsale || 0).toFixed(2)}</td>
        <td>{p.real_item_price}</td>
      </tr>
    )
  })
  const footerList = [
    {
      name: i18next.t('下单金额'),
      value: data.total_price,
    },
    {
      name: i18next.t('出库金额'),
      value: data.real_price,
    },
    {
      name: i18next.t('运费'),
      value: data.freight,
    },
    {
      name: i18next.t('异常金额'),
      value: Big(data.abnormal_money).plus(data.refund_money).toFixed(2),
    },
    {
      name: i18next.t('销售额(含运税)'),
      value: data.total_pay,
    },
  ]

  return (
    <div className='gm-margin-15' style={{ pageBreakAfter: 'always' }}>
      {/* 页眉 */}
      <Flex column alignCenter>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {i18next.t('配送单')}
        </div>
      </Flex>
      <div>
        <span>
          {i18next.t('账户名')}:{data.username}
        </span>
        <span style={{ marginLeft: '55px' }}>
          {i18next.t('商户公司')}:{data.cname || '-'}
        </span>
      </div>
      <div className='gm-margin-top-10'>
        <span className='b-width-200'>
          {i18next.t('收货日期')}:
          {moment(data.receive_begin_time).format('YYYY-MM-DD')}
        </span>
        <span className='gm-margin-left-20'>
          {i18next.t('打印时间')}:{moment().format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </div>
      {/* 表格 */}
      <table className='table table-hover table-bordered gm-bg gm-margin-top-10'>
        <tbody>
          <tr>
            <td>{i18next.t('序号')}</td>
            <td width='80px'>{i18next.t('类别')}</td>
            <td width='100px'>{i18next.t('商品名')}</td>
            <td>{i18next.t('规格')}</td>
            {_.map(merchandiseList, (item, index) => (
              // 去重后的商户列表
              <td key={index} className='gm-text-bold'>
                {item.resname}
              </td>
            ))}
            <td>{i18next.t('下单数')}</td>
            <td>
              &nbsp;&nbsp;{i18next.t('出库数')}
              <br />
              {i18next.t('(基本单位)')}
            </td>
            <td>{i18next.t('单价(基本单位)')}</td>
            <td>{i18next.t('出库金额')}</td>
          </tr>
          {/* 各商户下单数据 */}
          {productPanel}
        </tbody>
      </table>
      {/* 页脚 */}
      <Flex justifyBetween className='gm-margin-top-10 gm-margin-lr-10'>
        {_.map(footerList, (item, index) => (
          <span key={index}>
            {item.name}:{item.value}
          </span>
        ))}
      </Flex>
    </div>
  )
}

OrderKidMergePrintTwoItem.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}
class OrderKidMergePrintTwo extends React.Component {
  query = this.props.history.location.query
  ids = ''
  constructor(props) {
    super(props)
    this.state = {
      list: '',
    }
  }

  batchPlus = (accumulator, current, keys) => {
    keys.forEach((key) => {
      if (key === 'merchandise') {
        accumulator[key].push(current[key][0])
      } else if (key === 'receive_begin_time') {
        accumulator.receive_time_list.push(
          `${current.receive_begin_time}～${current.receive_end_time}`,
        )
      } else {
        accumulator[key] = Big(accumulator[key]).plus(current[key]).toFixed(2)
      }
    })
  }

  // 按账户打印
  getKidPrint = (getDataPromise) => {
    /*
     *  kidToIndex
     * {
     *   [kid]: {
     *     index: 0,
     *     nowSkuIndex: 0,
     *     skuToIndex: {
     *         [sku]: 0
     *      }
     *   }
     * }
     * */
    const kidToIndex = {}
    let kidIndex = 0
    const initData = (d) => {
      return {
        username: d.username,
        total_price: d.total_price,
        real_price: d.real_price,
        freight: d.freight,
        abnormal_money: d.abnormal_money,
        refund_money: d.refund_money,
        total_pay: d.total_pay,
        cname: d.cname,
        std_sale_price_forsale: d.std_sale_price_forsale,
        details: [],
        receive_begin_time: d.receive_begin_time,
        merchandise: [
          {
            resname: d.resname,
          },
        ],
        receive_time_list: [`${d.receive_begin_time}～${d.receive_end_time}`],
      }
    }

    return Promise.resolve(
      getDataPromise.reduce((accumulator, currentValue) => {
        const kid = currentValue.uid
        const existIndex = kidToIndex[kid]?.index
        currentValue.merchandise = [
          {
            resname: currentValue.resname,
          },
        ]
        // 账户
        if (existIndex !== undefined) {
          this.batchPlus(accumulator[existIndex], currentValue, [
            'total_price',
            'real_price',
            'freight',
            'abnormal_money',
            'refund_money',
            'total_pay',
            'merchandise',
            'receive_begin_time',
          ])
        } else {
          kidToIndex[kid] = {
            index: kidIndex,
            nowSkuIndex: 0,
            skuToIndex: {},
          }
          kidIndex += 1
          accumulator.push(initData(currentValue))
        }

        const currentKid = kidToIndex[kid]
        // sku
        currentValue.details.forEach((detail) => {
          const sku = detail.id
          // 把商户信息塞进每条detail
          detail.merchandise = [
            {
              resname: currentValue.resname,
              sid_real_weight: detail.real_weight,
              sid_std_unit_name_forsale: detail.std_unit_name_forsale,
            },
          ]
          const existIndex = currentKid.skuToIndex[sku]
          if (existIndex !== undefined) {
            this.batchPlus(
              accumulator[currentKid.index].details[existIndex],
              detail,
              ['quantity', 'real_weight', 'real_item_price', 'merchandise'],
            )
          } else {
            currentKid.skuToIndex[sku] = currentKid.nowSkuIndex
            currentKid.nowSkuIndex += 1
            accumulator[currentKid.index].details.push(detail)
          }
        })
        return accumulator
      }, []),
    )
  }

  getData = () => {
    const { order_ids, delivery_type = '1', filter } = this.query
    // 全选所有页: 传搜索条件，非全选(包含当前页全选): 传id
    const query = order_ids ? { ids: this.ids } : { ...JSON.parse(filter) }
    const params = delivery_type === '2' ? { ...query, type: 2 } : query
    return ORDER_PRINT_API[delivery_type](params)
  }

  start = async () => {
    let list = []
    let kidList = []
    const getDataPromise = await this.getData()
    kidList = await this.getKidPrint(getDataPromise)
    list = _.sortBy(kidList, ['username'])

    // 收货时间去重后如果有任意一个kid下的收货时间数组长度超过1就弹窗提示
    const alert = _.find(
      list,
      (item) => _.uniq(item.receive_time_list)?.length > 1,
    )
    if (alert) {
      this.timeAlert()
    }
    this.setState({ list })
    LoadingFullScreen.hide()
  }

  componentDidMount() {
    const { order_ids } = this.query

    this.ids = JSON.stringify(_.isArray(order_ids) ? order_ids : [order_ids])

    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    this.start()
  }

  handlePrint() {
    window.print()
  }

  timeAlert() {
    Dialog.alert({
      title: t('提示'),
      children: (
        <>
          {t(
            '当前配送单存在多个收货日期，显示的收货日期为随机选取其一，仅供参考。如有疑惑请以实际收货日期为准！',
          )}
        </>
      ),
      size: 'sm',
    })
  }

  render() {
    const { list } = this.state
    return (
      <>
        <div style={{ position: 'relative' }}>
          <Button
            type='primary'
            className='hidden-print'
            style={{ position: 'absolute', top: '10px', right: '20px' }}
            onClick={this.handlePrint.bind(this)}
          >
            {i18next.t('打印')}
          </Button>
        </div>
        {_.map(list, (item, index) => {
          return (
            <OrderKidMergePrintTwoItem data={item} index={index} key={index} />
          )
        })}
      </>
    )
  }
}

OrderKidMergePrintTwo.propTypes = {
  product: PropTypes.object,
  history: PropTypes.object.isRequired,
}

export default OrderKidMergePrintTwo
