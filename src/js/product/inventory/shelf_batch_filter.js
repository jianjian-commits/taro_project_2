import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Button,
  Form,
  FormButton,
  FormItem,
  Input,
  Select,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { DELAY_STOCK_TYPE } from 'common/enum'

// 这个组件货位和批次都在用，虽然看起来不像
// 现在只有货位在用了
function ShelfBatchFilter({
  onSearch,
  onExport,
  defaultFilter,
  placeholder,
  hasDelayStock,
}) {
  const [text, changeText] = useState(defaultFilter?.text || '')
  const [delayType, changeDelayType] = useState(defaultFilter?.delayType || 0)

  const handleSearch = () => {
    const req = { text }

    hasDelayStock && (req.delayType = delayType)
    onSearch(req)
  }

  const handleExport = () => {
    const req = { text }

    hasDelayStock && (req.delayType = delayType)
    onExport(req)
  }

  return (
    <Box hasGap>
      <Form inline>
        <FormItem label={t('搜索')}>
          <Input
            value={text}
            onChange={({ target: { value } }) => changeText(value)}
            className='form-control'
            placeholder={placeholder}
          />
        </FormItem>
        {hasDelayStock && (
          <FormItem label={t('呆滞库存')}>
            <Select
              value={delayType}
              onChange={changeDelayType}
              data={DELAY_STOCK_TYPE}
            />
          </FormItem>
        )}
        <FormButton>
          <Button type='primary' onClick={handleSearch}>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={handleExport}>{t('导出')}</Button>
        </FormButton>
      </Form>
    </Box>
  )
}

ShelfBatchFilter.propTypes = {
  onSearch: PropTypes.func,
  onExport: PropTypes.func,
  defaultFilter: PropTypes.object,
  placeholder: PropTypes.string,
  hasDelayStock: PropTypes.bool,
}

export default ShelfBatchFilter
