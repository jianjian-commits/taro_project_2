import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  DateRangePicker,
  Flex,
  FormButton,
  MoreSelect,
  FormItem,
  Input,
  Select,
  BoxForm,
  FormBlock,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import store from '../store'
import { PROCESS_RECEIPT_STATUS } from '../../utils'

const Filter = observer(() => {
  const {
    filter,
    technicCategoryList,
    technicCategorySelected,
    workShopSelected,
    workShopList,
  } = store
  const { date_type, q, begin, end, status } = filter

  useEffect(() => {
    // 获取工艺类型列表
    store.fetchTechnicCategoryList()
    // 获取车间列表
    store.fetchWorkShopList()
  }, [])

  const handleChangeFilter = (value, name) => {
    store.changeFilter(name, value)
  }

  const handleSearch = () => {
    store.clearTableSelected()

    store.doFirstRequest()
  }

  return (
    <BoxForm
      labelWidth='80px'
      colWidth='320px'
      onSubmit={handleSearch}
      btnPosition='left'
    >
      <FormBlock col={3}>
        <FormItem labelWidth='0' col={1}>
          <Flex>
            <Select
              clean
              onChange={(value) => handleChangeFilter(value, 'date_type')}
              data={[
                { value: 6, text: t('下达日期') },
                { value: 2, text: t('计划完成日期') },
              ]}
              value={date_type}
            />
            <Flex flex={1} column>
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={(begin, end) => {
                  handleChangeFilter(begin, 'begin')
                  handleChangeFilter(end, 'end')
                }}
              />
            </Flex>
          </Flex>
        </FormItem>
        <FormItem label={t('状态筛选')} col={1}>
          <Select
            value={status}
            data={PROCESS_RECEIPT_STATUS}
            onChange={(value) => handleChangeFilter(value, 'status')}
          />
        </FormItem>
        <FormItem label={t('搜索')} col={1}>
          <Input
            className='form-control'
            value={q}
            placeholder={t('输入成品信息或计划编号')}
            onChange={(e) => handleChangeFilter(e.target.value, 'q')}
          />
        </FormItem>
      </FormBlock>
      <BoxForm.More>
        <FormBlock col={2}>
          <FormItem label={t('工艺类型')} col={1}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              name='technic_category_ids'
              data={technicCategoryList.slice()}
              selected={technicCategorySelected.slice()}
              onSelect={(selected) =>
                store.changeTechnicCategorySelected(selected)
              }
              placeholder={t('全部类型')}
            />
          </FormItem>
          <FormItem label={t('车间筛选')} col={1}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              name='technic_category_ids'
              data={workShopList.slice()}
              selected={workShopSelected.slice()}
              onSelect={(selected) => store.changeWorkShopSelected(selected)}
              placeholder={t('全部车间')}
            />
          </FormItem>
        </FormBlock>
      </BoxForm.More>
      <FormButton>
        <Button type='primary' htmlType='submit' className='gm-margin-right-10'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
