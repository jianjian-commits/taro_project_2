import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  Flex,
  FormItem,
  MoreSelect,
  FormButton,
  Button,
  Popover,
  List,
  DatePicker,
} from '@gmfe/react'
import moment from 'moment'
import classnames from 'classnames'

import globalStore from 'stores/global'
import { quotationStore as store, commonStore } from '../../store'

const QuotationFilter = observer(() => {
  useEffect(() => {
    commonStore.getSaleMenuList().then(() => {
      handleChange('salemenu', _.head(commonStore.salemenuList))
      if (store.canSearchQuotation) {
        store.getHistoryPriceDate()
        store.doQuotationFirstRequest()
      }
    })

    return () => store.initQuotationFilter()
  }, [])

  const handleSearch = () => {
    store.doQuotationFirstRequest()
  }

  const handleChange = (name, value) => {
    store.changeQuotationFilter({ [name]: value || null })

    // 重新拉取历史报价周期
    if (name === 'salemenu' && value) {
      store.getHistoryPriceDate()
    }
  }

  const handleSelectedDate = (data) => {
    store.changeQuotationFilter({ end_time: moment(data) })
  }

  const handleExport = () => {
    store.export()
  }

  const { salemenuList } = commonStore
  const { salemenu, end_time, selectedDateList } = store.quotation_filter
  const hasExport = globalStore.hasPermission('export_sku_snapshot_list')

  return (
    <BoxForm onSubmit={handleSearch} labelWidth='100px'>
      <FormBlock col={3}>
        <FormItem label={t('报价单')}>
          <MoreSelect
            data={salemenuList.slice()}
            selected={_.has(salemenu, 'id') ? salemenu : null}
            renderListFilterType='pinyin'
            renderListItem={(v) => (
              <Flex justifyBetween>
                <div>{v.text}</div>
                <div className='gm-text-desc gm-text-12'>
                  {v.type === -1 && t('已删除')}
                </div>
              </Flex>
            )}
            placeholder={t('请选择报价单')}
            onSelect={handleChange.bind(this, 'salemenu')}
          />
        </FormItem>
        <FormItem
          label={t('报价单日期')}
          toolTipLeft
          toolTip={
            <div className='gm-padding-5' style={{ width: '250px' }}>
              {t(
                '仅支持按单天查询，选择历史周期会以周期最后一天信息作为周期内报价。',
              )}
            </div>
          }
        >
          <DatePicker
            date={end_time}
            placeholder={t('选择报价日期')}
            onChange={handleChange.bind(this, 'end_time')}
            renderBottom={
              <Popover
                type='click'
                left
                isInPopup
                popup={
                  <div className='gm-overflow-y' style={{ maxHeight: '200px' }}>
                    <Flex flex className='gm-padding-5'>
                      {_.map(selectedDateList, (item, index) => (
                        <List
                          key={index}
                          className={classnames(
                            'gm-flex-flex text-center gm-border-0',
                            {
                              'gm-border-right': index === 0,
                            },
                          )}
                          data={item.slice()}
                          selected={moment(end_time).format('YYYY-MM-DD')}
                          onSelect={handleSelectedDate}
                        />
                      ))}
                    </Flex>
                  </div>
                }
              >
                <Button
                  block
                  disabled={
                    !store.canSearchQuotation ||
                    !_.flattenDeep(selectedDateList).length
                  }
                >
                  {t('历史周期')}
                </Button>
              </Popover>
            }
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button
          disabled={!store.canSearchQuotation}
          type='primary'
          htmlType='submit'
        >
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        {hasExport && <Button onClick={handleExport}>{t('导出')}</Button>}
      </FormButton>
    </BoxForm>
  )
})

export default QuotationFilter
