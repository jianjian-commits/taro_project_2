import {
  DateRangePicker,
  Form,
  FormButton,
  FormItem,
  FormBlock,
  Box,
  MoreSelect,
  Select,
  Option,
  Button,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { PAY_METHOD_TYPE } from '../../common/enum'

@observer
class QueryFilterView extends React.Component {
  handleDatePickerChange = (begin, end) => {
    this.props.changeFilterFunc('begin', begin)
    this.props.changeFilterFunc('end', end)
  }

  render() {
    const {
      begin,
      end,
      onSearchFunc,
      onExportFunc,
      supplierData,
      selectSupplierFunc,
      supplierSelected,
      queryPlaceHolder,
      settleInterval,
    } = this.props

    return (
      <Box hasGap>
        <Form inline onSubmit={onSearchFunc}>
          <FormBlock col={2}>
            <FormItem label={i18next.t('入库/退货日期')}>
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={this.handleDatePickerChange}
              />
            </FormItem>
            <FormItem label={i18next.t('供应商')}>
              <MoreSelect
                placeholder={queryPlaceHolder}
                data={supplierData}
                selected={supplierSelected}
                onSelect={selectSupplierFunc}
                renderListFilterType='pinyin'
                className='gm-margin-right-10'
              />
            </FormItem>
            <FormItem label={i18next.t('结算周期')}>
              <Select
                value={settleInterval}
                placeholder={i18next.t('全部标签')}
                onChange={(val) =>
                  this.props.changeFilterFunc('settleInterval', val)
                }
              >
                {PAY_METHOD_TYPE.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FormBlock>
          <FormButton>
            <Button
              htmlType='submit'
              type='primary'
              className='gm-margin-right-10'
            >
              {i18next.t('搜索')}
            </Button>
            <Button onClick={onExportFunc}>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

QueryFilterView.propTypes = {
  begin: PropTypes.object,
  end: PropTypes.object,
  supplierData: PropTypes.array,
  supplierSelected: PropTypes.object,
  changeFilterFunc: PropTypes.func.isRequired,
  selectSupplierFunc: PropTypes.func,
  onSearchFunc: PropTypes.func.isRequired,
  onExportFunc: PropTypes.func.isRequired,
  queryPlaceHolder: PropTypes.string.isRequired,
  settleInterval: PropTypes.number.isRequired,
}

export default QueryFilterView
