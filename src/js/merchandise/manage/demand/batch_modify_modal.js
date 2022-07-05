import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Select, Flex, FormItem, Button } from '@gmfe/react'
import { PROCESS_STATUS } from 'common/enum'

const BatchActionModal = ({ ids, type, onSave }) => {
  const [innserStatus, setInnerStatus] = useState(1)

  const handleChangeOrderStatus = (value) => {
    const innserStatus = value
    setInnerStatus(innserStatus)
  }

  const handleHide = () => {
    Modal.hide()
  }

  const handleSubmit = () => {
    onSave(innserStatus, ids)
  }
  return (
    <Form onSubmit={handleSubmit} colWidth='360px'>
      <FormItem
        label={
          type
            ? i18next.t('将所有新品需求状态修改为')
            : i18next.t(
                /* src: `将选中${ids}个新品需求状态修改为` => tpl: 将选中${ids}个新品需求状态修改为 */ 'change_new_demand_status',
                { ids: ids.length }
              )
        }
      >
        <Select
          value={innserStatus}
          data={PROCESS_STATUS}
          style={{ width: '100px' }}
          onChange={handleChangeOrderStatus}
        />
      </FormItem>
      <FormItem>
        <Flex className='gm-text-desc'>
          {i18next.t(
            '处理状态可修改为已添加或已拒绝，仅能修改一次不可逆向修改'
          )}
        </Flex>
      </FormItem>
      <Flex justifyEnd>
        <Button onClick={handleHide}>{i18next.t('取消')}</Button>
        <Button htmlType='submit' className='gm-margin-left-10'>
          {i18next.t('确定')}
        </Button>
      </Flex>
    </Form>
  )
}

BatchActionModal.propTypes = {
  ids: PropTypes.array,
  type: PropTypes.bool,
  onSave: PropTypes.func,
}

export default BatchActionModal
