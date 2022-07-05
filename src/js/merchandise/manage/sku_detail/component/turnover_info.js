import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import {
  FormItem,
  FormBlock,
  Flex,
  Switch,
  ToolTip,
  MoreSelect,
  Validator,
  RadioGroup,
  Radio,
  InputNumber,
  Form,
} from '@gmfe/react'
import skuStore from '../sku_store'
import globalStore from '../../../../stores/global'
import _ from 'lodash'

@observer
class TurnoverForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      turnOverList: [],
    }
  }

  componentDidMount() {
    globalStore.hasPermission('get_turnover') &&
      skuStore.getTurnOverList().then((json) => {
        this.setState({
          turnOverList: _.map(json.data, (v) => {
            return {
              value: v.id,
              text: v.name,
              unit_name: v.unit_name,
            }
          }),
        })
      })
  }

  handleChangeSwitch = () => {
    skuStore.changeSkuDetail({
      bind_turnover: !skuStore.skuDetail.bind_turnover ? 1 : 0,
    })
  }

  handleSelected = (selected) => {
    skuStore.changeSkuDetail({
      tid: selected.value,
    })
  }

  handleChangeValue = (name, value) => {
    skuStore.changeSkuDetail({
      [name]: value,
    })
  }

  render() {
    const { turnOverList } = this.state
    const {
      skuDetail: { bind_turnover, tid, turnover_bind_type, turnover_ratio },
    } = skuStore
    const materialSelected = _.find(turnOverList, (m) => m.value === tid)
    const p_editTurnover = globalStore.hasPermission('add_turnover_sku_info')
    const editDisabled = !p_editTurnover || !bind_turnover

    // 可编辑才添加校验
    const addValidateProps = (value) => {
      if (!p_editTurnover || !bind_turnover) {
        return null
      }
      return {
        required: true,
        validate: Validator.create([], value),
      }
    }
    console.log(turnover_ratio, 'turn')
    return (
      <Form
        hasButtonInGroup
        ref={this.props.forwardRef}
        labelWidth='179px'
        colWidth='500px'
      >
        <FormBlock col={2}>
          <FormItem label={i18next.t('周转物关联')}>
            <Switch
              type='primary'
              checked={!!bind_turnover}
              on={i18next.t('开启')}
              off={i18next.t('关闭')}
              onChange={this.handleChangeSwitch}
              disabled={!p_editTurnover}
            />
            <div className='gm-gap-5' />
            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {i18next.t(
                    '设置周转物关联后，下单后自动记录待借出的周转物数',
                  )}
                </div>
              }
            />
          </FormItem>
          <FormItem label={i18next.t('周转物')} {...addValidateProps(tid)}>
            <MoreSelect
              data={turnOverList}
              selected={materialSelected}
              onSelect={this.handleSelected}
              renderListFilterType='pinyin'
              disabled={editDisabled}
            />
          </FormItem>
          <FormItem
            label={i18next.t('换算方式')}
            {...addValidateProps(turnover_bind_type)}
          >
            <RadioGroup
              name='turnover_bind_type'
              inline
              value={turnover_bind_type}
              onChange={this.handleChangeValue.bind(this, 'turnover_bind_type')}
            >
              <Radio disabled={editDisabled} value={1}>
                {i18next.t('取固定值')}
              </Radio>
              <Radio disabled={editDisabled} value={2}>
                {i18next.t('按下单数设置')}
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label={i18next.t('数量')}
            {...addValidateProps(turnover_ratio)}
            toolTip={
              <div className='gm-padding-5'>
                {turnover_bind_type === 1 ? (
                  <div>
                    {i18next.t(
                      '按固定值设置的情况下，不管下单数为多少，均借出固定的数量；',
                    )}
                    <br />
                    {i18next.t(
                      '如设置为固定值3板，则不管客户下单多少板，均借出3板。',
                    )}
                  </div>
                ) : (
                  <div>
                    {i18next.t(
                      '按下单数设置的情况下，借出周转物数随着下单数变动而变动；',
                    )}
                    <br />
                    {i18next.t(
                      '如设置比例值为1板，则客户下单2板，则借出2板；若下单数为小数时，则借出周转物数向上取整。',
                    )}
                  </div>
                )}
              </div>
            }
          >
            <Flex alignCenter>
              <InputNumber
                className='form-control'
                value={turnover_ratio}
                min={0}
                precision={2}
                max={999999999}
                onChange={this.handleChangeValue.bind(this, 'turnover_ratio')}
                disabled={editDisabled}
              />
              <span className='gm-margin-left-5'>
                {materialSelected && materialSelected.unit_name}
              </span>
            </Flex>
          </FormItem>
        </FormBlock>
      </Form>
    )
  }
}

TurnoverForm.propTypes = {
  forwardRef: PropTypes.object,
}

// 转发form示例，在提交的时候能触发验证
export default React.forwardRef((props, ref) => (
  <TurnoverForm forwardRef={ref} {...props} />
))
