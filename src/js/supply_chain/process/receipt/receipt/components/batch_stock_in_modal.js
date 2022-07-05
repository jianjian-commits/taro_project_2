import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Button, Modal, Checkbox, Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const BatchStockInModal = (props) => {
  const { sheetNo = '', createTime = '', onOk, onHide } = props
  const [filter, setFilter] = useState(true)
  const [merge, setMerge] = useState(true)

  const handleSubmit = () => {
    onOk({ filter_stock: filter, merge })
    onHide()
  }

  return (
    <div>
      <div className='gm-margin-bottom-5'>
        {t(`今日已有成品待入库单:${sheetNo}`)}
        {t('（建单时间：')}
        {`${createTime}）,`}
        {t('是否合并？')}
      </div>
      <br />
      <Checkbox checked={filter} onChange={(e) => setFilter(e.target.checked)}>
        {t('过滤已操作生成待入库单的商品')}
      </Checkbox>

      <Checkbox checked={merge} onChange={(e) => setMerge(e.target.checked)}>
        {t('合并今日已有成品待入库单')}
      </Checkbox>
      <br />
      <div className='gm-text-red gm-margin-bottom-5'>
        {t(
          '1.勾选过滤，则已操作过生成待入库单的商品将不会再次添加进入成品待入库单中',
        )}
        <br />
        {t('2.勾选合并，将已开工的商品合并入已有成品待入库单')}
        <br />
      </div>
      <Flex justifyEnd className='gm-margin-top-5'>
        <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
        <span className='gm-gap-5' />
        <Button htmlType='submit' type='primary' onClick={handleSubmit}>
          {t('确认')}
        </Button>
      </Flex>
    </div>
  )
}

BatchStockInModal.propTypes = {
  onOk: PropTypes.func,
  onHide: PropTypes.func,
  sheetNo: PropTypes.string,
  createTime: PropTypes.string,
}

export default observer(BatchStockInModal)
