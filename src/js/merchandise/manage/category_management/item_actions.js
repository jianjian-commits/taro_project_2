import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Button, Flex, Popover } from '@gmfe/react'
import PopConfirm from './pop_confirm'
import AddSubclassInput from './add_subclass_input'
import globalStore from '../../../stores/global'

const ItemActions = ({
  value,
  onCreateSpu,
  onChangeName,
  onAddSubclass,
  onHighlight,
  renderDelete,
}) => {
  const option = {
    0: t('新建二级分类'),
    1: t('新建品类'),
    2: t('新建商品'),
  }
  const title = option[value.level]

  return (
    <Flex alignCenter>
      {value.level === 2 ? (
        <Button type='link' onClick={() => onCreateSpu(value)}>
          {t('新建商品')}
        </Button>
      ) : (
        <Popover
          popup={
            <PopConfirm
              value={value}
              title={title}
              content={<AddSubclassInput onChange={onChangeName} />}
              onOkText={t('保存')}
              onOkType='primary'
              onOk={() => onAddSubclass(value)}
              onHighlight={onHighlight}
            />
          }
          right
          ref={(ref) => (value.addRef = ref)}
          offset={-10}
        >
          <Button type='link'>{title}</Button>
        </Popover>
      )}
      <div style={{ color: '#ccc' }}>|</div>
      {globalStore.hasPermission('delete_category') && (
        <Popover
          popup={renderDelete(value)}
          right
          ref={(ref) => (value.deleteRef = ref)}
          offset={-10}
        >
          <Button type='link'>{t('删除')}</Button>
        </Popover>
      )}
    </Flex>
  )
}

ItemActions.propTypes = {
  value: PropTypes.object,
  onCreateSpu: PropTypes.func,
  onChangeName: PropTypes.func,
  onAddSubclass: PropTypes.func,
  onHighlight: PropTypes.func,
  renderDelete: PropTypes.func,
}

export default ItemActions
