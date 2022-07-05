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
import _ from 'lodash'

import { RECEIPT_TYPE, PAY_METHOD_TYPE } from '../../../common/enum'

import store from './store'
import { Request } from '@gm-common/request'
import TaskList from '../../../task/task_list'

const Filter = (props) => {
  useEffect(() => {
    store.querySupplierGroup()
  }, [])

  const handleExport = () => {
    const {
      filter: { statusSelected, supplySelected, start, end, settleInterval },
    } = store
    const params = {
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      status: statusSelected, // 状态筛选
      settle_supplier_id: supplySelected?.value || '', // 搜索供应商
      pay_method: settleInterval,
      export: '1',
    }

    Request('/stock/settle_sheet/search')
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
    filter: { start, end, statusSelected, settleInterval, supplySelected },
    supplyGroup,
  } = store

  return (
    <BoxForm
      btnPosition='left'
      labelWidth='90px'
      onSubmit={() => store.doFirstRequest()}
    >
      <FormBlock col={3}>
        <FormItem label={i18next.t('按建单日期')}>
          <Flex>
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
        <FormItem label={i18next.t('状态筛选')}>
          <Select
            value={statusSelected}
            onChange={(val) => store.handleChangeFilter('statusSelected', val)}
          >
            {RECEIPT_TYPE.map((item) => (
              <Option key={_.toNumber(item.key)} value={item.key}>
                {item.text}
              </Option>
            ))}
          </Select>
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormItem label={i18next.t('结算周期')}>
          <Select
            value={settleInterval}
            placeholder={i18next.t('全部标签')}
            onChange={(val) => store.handleChangeFilter('settleInterval', val)}
          >
            {PAY_METHOD_TYPE.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
          </Select>
        </FormItem>
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
