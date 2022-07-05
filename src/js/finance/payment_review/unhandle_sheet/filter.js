import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  DateRangePicker,
  BoxForm,
  Flex,
  FormItem,
  FormBlock,
  FormButton,
  Select,
  Option,
  Button,
  RightSideModal,
} from '@gmfe/react'
import { FilterSearchSelect } from '@gmfe/react-deprecated'
import moment from 'moment'
import { UNHANDLE_TYPE, PAY_METHOD_TYPE } from '../../../common/enum'
import store from './store'
import { Request } from '@gm-common/request'
import TaskList from '../../../task/task_list'

const timeTypeMap = [
  { label: i18next.t('按入库/退货'), value: '1' },
  { label: i18next.t('按建单日期'), value: '2' },
]

const Filter = (props) => {
  useEffect(() => {
    store.querySupplierGroup()
  }, [])

  const handleExport = () => {
    const params = {
      type: time_type,
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      receipt_type: statusSelected, // 状态筛选
      settle_supplier_id: supplySelected?.value || '', // 搜索供应商
      export: '1',
    }

    Request('/stock/settle_sheet/unsettled')
      .data(params)
      .get()
      .then((json) => {
        RightSideModal.render({
          children: <TaskList tabKey={0} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  const {
    filter: {
      start,
      end,
      statusSelected,
      pay_method,
      supplySelected,
      time_type,
    },
    supplyGroup,
  } = store
  return (
    <BoxForm
      btnPosition='left'
      labelWidth='90px'
      onSubmit={() => store.doFirstRequest()}
    >
      <FormBlock col={3}>
        <FormItem>
          <Flex alignCenter>
            <Flex>
              <Select
                clean
                name='time_type'
                value={time_type}
                onChange={(val) => store.handleChangeFilter('time_type', val)}
                className='b-filter-select-clean-time'
              >
                {timeTypeMap.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Flex>
            <Flex flex column>
              <DateRangePicker
                begin={start}
                end={end}
                onChange={(start, end) => store.mergeFilter({ start, end })}
              />
            </Flex>
          </Flex>
        </FormItem>
        <FormItem label={i18next.t('搜索')}>
          <FilterSearchSelect
            list={supplyGroup.slice()}
            selected={supplySelected}
            isGroupList
            onSelect={(val) => store.handleChangeFilter('supplySelected', val)}
            onFilter={store.handleFilter}
            placeholder={i18next.t('搜索供应商')}
          />
        </FormItem>
        <FormItem label={i18next.t('单据类型')}>
          <Select
            value={statusSelected}
            onChange={(val) => store.handleChangeFilter('statusSelected', val)}
          >
            {UNHANDLE_TYPE.map((item) => (
              <Option key={item.key} value={item.key}>
                {item.text}
              </Option>
            ))}
          </Select>
        </FormItem>
      </FormBlock>

      <BoxForm.More>
        <FormBlock col={1}>
          <FormItem col={1} label={i18next.t('结款周期')}>
            <Select
              value={pay_method}
              onChange={(val) => store.handleChangeFilter('pay_method', val)}
            >
              {PAY_METHOD_TYPE.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormBlock>
      </BoxForm.More>

      <FormButton>
        <Button htmlType='submit' type='primary'>
          {i18next.t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{i18next.t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
