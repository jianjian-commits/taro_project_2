import { i18next } from 'gm-i18n'
import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { Tip, Dialog, Button } from '@gmfe/react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { isNumber } from '../../common/util'

import store from './store'

@observer
class OrderReportPrint extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      generated: false,
      randomData: '',
      tempInputValue: '',
      tempInputList: [],
      list: [],
      dialogShow: false,
      dialogTitleList: [],
      reportData: {},

      titleWhich: i18next.t('此报告仅做样板,请点击更换抬头'),
      titleWhichConfirm: i18next.t('此报告仅做样板,请点击更换抬头'),
    }
  }

  componentWillMount() {
    const orderId = this.props.location.query.id
    store.getDetail(orderId)
    store.getDetectSpus(orderId).then(() => {
      const { orderReportSPUList } = store

      const list = _.map(orderReportSPUList, (v) =>
        Object.assign({}, v, { randomData: '' })
      )
      this.setState({
        list,
      })
    })
  }

  handleTitleChangeDialog = () => {
    const { titleWhichConfirm } = this.state
    this.setState({
      dialogShow: true,
      dialogTitleList: [
        i18next.t('杭州广瑞食品有限公司'),
        i18next.t('浙江浦江绿而康农副产品配送有限公司'),
        i18next.t('杭州利苏实业有限公司'),
        i18next.t('杭州友春食品配送有限公司'),
        i18next.t('杭州优菜农业发展有限公司'),
      ],
      titleWhich: titleWhichConfirm,
      titleWhichConfirm,
    })
  }

  handleTitleWhich(title) {
    this.setState({
      titleWhich: title,
    })
  }

  handleDialogOK = () => {
    const { titleWhich } = this.state
    this.setState({
      dialogShow: false,
      titleWhichConfirm: titleWhich,
      titleWhich,
    })
  }

  handleDialogCancel = () => {
    const titleWhichConfirm = this.state.titleWhichConfirm
    this.setState({
      dialogShow: false,
      titleWhich: titleWhichConfirm,
      titleWhichConfirm,
    })
  }

  handlePrint = () => {
    window.print()
  }

  generateRandomData() {
    // 18 ~ 30 的随机数
    let randomData = Math.random() * 12 + 18
    randomData = new Big(randomData).toFixed(2)
    return randomData
  }

  handleGenerateRandomButton = (e) => {
    e.preventDefault()
    let { list } = this.state

    list = _.map(list, (v) =>
      Object.assign({}, v, {
        randomData: this.generateRandomData(),
        qualified: v.qualified === undefined ? true : v.qualified,
      })
    )

    this.setState({
      list,
      generated: true,
    })
  }

  handleQualifiedChange = (e) => {
    let { list, generated } = this.state
    if (!generated) {
      return false
    }
    const index = e.target.attributes['data-index'].value
    list = _.map(list, (v, i) => {
      if (+i === +index) {
        return Object.assign({}, v, { qualified: !v.qualified })
      } else {
        return { ...v }
      }
    })
    this.setState({
      list,
    })
  }

  handleEmptyInputFocus = (e) => {
    const inputValue = e.target.value
    this.setState({
      tempInputValue: inputValue,
    })
  }

  handleEmptyInputBlur = (e) => {
    let inputValue = e.target.value
    const tempInputValue = this.state.tempInputValue
    if (isNaN(+inputValue)) {
      Tip.warning(i18next.t('格式错误!'))
      e.target.value = parseFloat(tempInputValue)
      return false
    }
    if (+inputValue < 0) {
      Tip.warning(i18next.t('送检数量不能为负数!'))
      e.target.value = parseFloat(tempInputValue)
      return false
    }
    inputValue = new Big(inputValue).toFixed(2)
    e.target.value = parseFloat(inputValue)
    if (inputValue.trim() === '') {
      Tip.warning(i18next.t('送检数量不能为空!'))
      e.target.value = parseFloat(tempInputValue)
    } else if (isNaN(+inputValue.trim())) {
      Tip.warning(i18next.t('送检数量必须为数字!'))
      e.target.value = parseFloat(tempInputValue)
    }
  }

  handleRandomInputBlur = (e) => {
    const inputValue = e.target.value
    let list = this.state.list
    const index = e.target.attributes['data-index'].value

    list = _.map(list, (v, i) => {
      if (+i === +index) {
        const numValue =
          inputValue.trim() === '' ? '' : Big(inputValue).toFixed(2)

        return Object.assign({}, v, {
          randomData: numValue,
        })
      } else {
        return { ...v }
      }
    })
    this.setState({
      list,
    })
  }

  handleRandomInputChange = (e) => {
    const inputValue = e.target.value
    if (isNaN(+inputValue) || (inputValue && !isNumber(inputValue))) {
      return false
    }
    if (+inputValue < 0) {
      return false
    }
    let { list } = this.state
    const index = e.target.attributes['data-index'].value
    list = _.map(list, (v, i) => {
      if (+i === +index) {
        return Object.assign({}, v, { randomData: inputValue })
      } else {
        return { ...v }
      }
    })
    this.setState({
      list,
    })
  }

  render() {
    const {
      list,
      dialogShow,
      dialogTitleList,
      titleWhich,
      titleWhichConfirm,
      generated,
    } = this.state
    const { orderReportPrintDetail } = store
    const listLength = list.length || 0

    return (
      <div className='b-order-report-print'>
        <div className='print-container'>
          <div className='print-btn-group hidden-print'>
            <Button
              type='primary'
              plain
              onClick={this.handleGenerateRandomButton}
            >
              {i18next.t('生成示例数据')}
            </Button>
            <Button type='primary' plain onClick={this.handlePrint}>
              {i18next.t('打印报告')}
            </Button>
          </div>
          <div className='print-head'>
            <h1 onClick={this.handleTitleChangeDialog}>{titleWhichConfirm}</h1>
            <small>{i18next.t('食品安全快速检测结果报告单')}</small>
          </div>
          <div className='print-content'>
            <table>
              <tbody>
                <tr>
                  <td>{i18next.t('报告编号')}</td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                </tr>
                <tr>
                  <td>{i18next.t('受检单位名称')}</td>
                  <td colSpan='5'>{orderReportPrintDetail.resname}</td>
                </tr>
                <tr>
                  <td>{i18next.t('样品生产单位')}</td>
                  <td colSpan='5'>{orderReportPrintDetail.district_name}</td>
                </tr>
                <tr>
                  <td>{i18next.t('检测项目')}</td>
                  <td colSpan='2'>{i18next.t('农药残留')}</td>
                  <td>{i18next.t('抽样时间')}</td>
                  <td colSpan='2'>
                    {moment(orderReportPrintDetail.date_time).format(
                      'YYYY.MM.DD'
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{i18next.t('检测依据')}</td>
                  <td colSpan='5'>GB5009-2003</td>
                </tr>
                <tr>
                  <td />
                  <td colSpan='5'>
                    {i18next.t(
                      '《蔬菜中有机磷和氨基甲酸酯类农药残卵留量的快速检测》'
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{i18next.t('检测方法')}</td>
                  <td colSpan='5'>GB5009-2003</td>
                </tr>
                <tr>
                  <td />
                  <td colSpan='5'>
                    {i18next.t(
                      '《蔬菜中有机磷和氨基甲酸酯类农药残卵留量的快速检测》'
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{i18next.t('序号')}</td>
                  <td>{i18next.t('样品名称')}</td>
                  <td>{i18next.t('测定结果')}</td>
                  <td>{i18next.t('送检数量(斤)')}</td>
                  <td>{i18next.t('抑制率(%)')}</td>
                  <td>{i18next.t('备注')}</td>
                </tr>
                {_.map(list, (v, i) => (
                  <tr key={v + i}>
                    <td>{i + 1}</td>
                    <td>{v.name}</td>
                    <td className='order-print-qualified'>
                      {generated ? (
                        <span
                          data-index={i}
                          onClick={this.handleQualifiedChange}
                        >
                          {v.qualified
                            ? i18next.t('合格')
                            : i18next.t('不合格')}
                        </span>
                      ) : (
                        <input type='text' />
                      )}
                    </td>
                    <td
                      onFocus={this.handleEmptyInputFocus}
                      onBlur={this.handleEmptyInputBlur}
                    >
                      <input type='text' defaultValue='5' />
                    </td>
                    <td>
                      <input
                        data-index={i}
                        type='text'
                        value={v.randomData || ''}
                        onChange={this.handleRandomInputChange}
                        onBlur={this.handleRandomInputBlur}
                      />
                    </td>
                    <td>
                      <input type='text' />
                    </td>
                  </tr>
                ))}

                <tr>
                  <td>{listLength + 1}</td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                </tr>
                <tr>
                  <td>{listLength + 2}</td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                  <td>
                    <input type='text' />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className='b-order-footer-wrapper'>
              <p>{i18next.t('结果计算:样品抑制率=(Ack-As)/(Ack*100)')}</p>
              <p className='footer-print-tips'>
                <span>
                  <strong>Ack: </strong>
                  {i18next.t('对照试样吸光度变化值')}
                </span>
                <span>
                  <strong>As: </strong>
                  {i18next.t('样品试样的吸光度变化值')}
                </span>
              </p>
              <p>{i18next.t('环境条件:室温(≥25℃)')}</p>
              <p className='footer-print-tips-2'>{i18next.t('结果判定')}:</p>
              <p className='footer-print-tips-3'>
                <span>
                  {i18next.t(
                    '1.若样品的抑制率＜50.0%时说明样品中的农药毒性小,样品合格。'
                  )}
                </span>
                <br />
                <span>
                  {i18next.t(
                    '2.若样品的抑制率≥50.0%时说明样品中的农药毒性大,应复检,复检结果若≥50.0%,样品不合格。'
                  )}
                </span>
              </p>
              <p className='footer-print-sign'>
                <span>{i18next.t('检测人')}:</span>
                <span>{i18next.t('审核人')}:</span>
              </p>
            </div>
          </div>
        </div>
        <Dialog
          show={dialogShow}
          title={i18next.t('切换标题')}
          onCancel={this.handleDialogCancel}
          onOK={this.handleDialogOK}
          inputClass='order-report-dialog'
        >
          <ul className='order-report-dialog-ul'>
            {_.map(dialogTitleList, (v, i) => (
              <li
                className={titleWhich === v ? 'active' : ''}
                onClick={this.handleTitleWhich.bind(this, v)}
                key={v + i}
              >
                {v}
              </li>
            ))}
          </ul>
        </Dialog>
      </div>
    )
  }
}

export default OrderReportPrint
