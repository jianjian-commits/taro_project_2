import { t } from 'gm-i18n'
import React from 'react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Select,
  Button,
  Input,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import DateFilter from 'common/components/date_range_filter'
import { inStockTimeTypeAdapter, STOCK_IN_SEARCH_TYPE } from '../../util'
import { PRODUCT_TIME_TYPE } from '../../../../common/enum'
import store from './store'

// 不需要清理，留着即可。 因为列表等其他数据也没有清理

const stockType = [
  { value: 0, text: t('全部单据状态') },
  { value: 1, text: t('待提交') },
  { value: 2, text: t('已提交') },
  { value: -1, text: t('已删除') },
]
@observer
class SearchFilter extends React.Component {
  handleExport = () => {
    store.handleExport()
  }

  handleDateFilterChange = (value) => {
    const { begin, end, dateType } = value

    if (dateType) {
      store.changeFilter('date_type', +dateType)
    } else if (begin && end) {
      store.changeFilter('begin', begin)
      store.changeFilter('end', end)
    }
  }

  render() {
    const {
      filter: { date_type, begin, end, status, q, search_type },
    } = store

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='80px'
        colWidth='385px'
        onSubmit={() => store.doFirstRequest()}
      >
        <FormBlock col={3}>
          <DateFilter
            data={{
              dateFilterData: [...inStockTimeTypeAdapter(PRODUCT_TIME_TYPE)],
            }}
            filter={{ begin, end, dateType: date_type }}
            onDateFilterChange={this.handleDateFilterChange}
            enabledTimeSelect
          />

          <FormItem>
            <Select
              data={STOCK_IN_SEARCH_TYPE}
              clean
              style={{ minWidth: '100px' }}
              className='gm-inline-block'
              canShowClose={false}
              onChange={(val) => store.changeFilter('search_type', val)}
              value={search_type}
            />
            <Input
              value={q}
              onChange={(e) => store.changeFilter('q', e.target.value)}
              name='search_text'
              type='text'
              style={{ width: '275px' }}
              className='gm-inline-block form-control'
              placeholder={t('请输入单号信息')}
            />
          </FormItem>
        </FormBlock>

        <BoxForm.More>
          <FormBlock col={2}>
            <FormItem label={t('入库单筛选')}>
              <Select
                name='status'
                value={status}
                onChange={(val) => store.changeFilter('status', val)}
                data={stockType}
              />
            </FormItem>
          </FormBlock>
        </BoxForm.More>

        <FormButton>
          <Button htmlType='submit' type='primary'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={this.handleExport}>{t('导出')}</Button>
        </FormButton>
      </BoxForm>
    )
  }
}

export default SearchFilter
