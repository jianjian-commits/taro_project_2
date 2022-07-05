import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, Popover, PopupContentConfirm, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import '../style.less'
import BatchSelectModal from './batch_select_modal'
import { TableX, TableXUtil } from '@gmfe/table-x'
import Big from 'big.js'

const { EditButton } = TableXUtil
const BatchNumberCell = observer(({ index }) => {
  const { receiveMaterialList } = store
  const { batch_list, status } = receiveMaterialList[index]

  const handleOk = async (close) => {
    const { batchSelected } = store
    if (!batchSelected.length) {
      Tip.warning(t('请勾选领料批次'))
      return
    }
    const { receiveMaterialList, batchList } = store
    const selectedData = batchList.filter((item) =>
      batchSelected.includes(item.batch_num),
    )
    if (selectedData.some((item) => !item.amount)) {
      Tip.warning(t('请输入领取数量'))
      return
    }
    const { id } = receiveMaterialList[index]
    await store.updateReturn({
      id,
      batch_list: JSON.stringify(
        selectedData.map((item) => ({
          batch_num: item.batch_num,
          amount: item.amount,
        })),
      ),
    })
    let amount = 0
    selectedData.forEach((item) => {
      amount = Big(amount).plus(item.amount)
    })
    store.setReceiveMaterialListItem(index, {
      batch_list: selectedData.map((item) => ({
        batch_num: item.batch_num,
        amount: item.amount,
      })),
      real_recv_amount: amount,
    })
    close()
  }

  const handleRenderPopover = () => (
    <TableX
      style={{ minWidth: '400px', maxHeight: '500px' }}
      data={batch_list.slice()}
      columns={[
        { Header: t('领料批次'), accessor: 'batch_num', minWidth: '200' },
        { Header: t('领取数目'), accessor: 'amount', minWidth: '50' },
        { Header: t('批次均价'), accessor: 'avg_price', minWidth: '50' },
      ]}
    />
  )

  return status === 2 ? (
    <Popover popup={handleRenderPopover} type='hover' showArrow top>
      <span>{batch_list[0].batch_num}</span>
    </Popover>
  ) : (
    <Flex row alignCenter justifyStart>
      {batch_list.length ? (
        <Popover popup={handleRenderPopover} type='hover' showArrow top>
          <span>{batch_list[0].batch_num + '...'}</span>
        </Popover>
      ) : (
        t('选择批次')
      )}
      <EditButton
        right
        popupRender={(close) => (
          <PopupContentConfirm
            onCancel={close}
            title={t('选择批次')}
            type='save'
            style={{ minWidth: '600px' }}
            onSave={() => handleOk(close)}
          >
            <BatchSelectModal index={index} />
          </PopupContentConfirm>
        )}
      />
    </Flex>
  )
})

BatchNumberCell.propTypes = {
  index: PropTypes.number,
}

export default BatchNumberCell
