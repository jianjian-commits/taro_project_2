import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import Position from '../../../../common/components/position'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'

const Summary = observer(({ handleHighlight, tableRef }) => {
  const { stockInReceiptList } = store
  return (
    <Flex alignCenter>
      <div>
        <span>{t('合计: ')}</span>
        <span className='gm-text-primary gm-text-bold'>
          {stockInReceiptList.length}
        </span>
        <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      </div>

      <Position
        onHighlight={handleHighlight}
        tableRef={tableRef}
        list={stockInReceiptList.slice()}
        placeholder={t('请输入商品名称')}
        className='gm-margin-left-10'
        filterText={['displayName']}
      />
    </Flex>
  )
})

Summary.propTypes = {
  handleHighlight: PropTypes.func,
  tableRef: PropTypes.object,
}

export default Summary
