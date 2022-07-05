import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { store } from './store'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { t } from 'gm-i18n'
import moment from 'moment'
import {
  Button,
  FunctionSet,
  Tip,
  RightSideModal,
  Modal,
  Flex,
} from '@gmfe/react'
import { handleValidator, PROCESS_RECEIPT_STATUS } from '../utils'
import { withRouter } from 'common/service'
import { PrintModal } from '../components'
import { getEnumValue } from 'common/filter'
import StockInModal from './stock_in_modal'

const SumbitTip = observer(({ id }) => {
  const handleSubmit = (req) => {
    store.saveAttrition(req).then(() => {
      Tip.success(t('保存成功'))
      store.setEdit(false)
      store.fetchPlanDetail(id)
    })

    Modal.hide()
  }

  return (
    <div>
      {t('是否标记损耗已录入完成，标记完成后无法二次录入？')}
      <Flex justifyEnd className='gm-margin-top-20'>
        <Button
          type='primary'
          plain
          className='gm-margin-right-10'
          onClick={() => handleSubmit(0)}
        >
          {t('否')}
        </Button>
        <Button type='primary' onClick={() => handleSubmit(1)}>
          {t('是')}
        </Button>
      </Flex>
    </div>
  )
})

@withRouter
@observer
class Header extends Component {
  handleRecordLoss = () => {
    const { setEdit, details, setDisabled } = store
    const { attritions } = details
    setEdit(true)
    setDisabled(!handleValidator(attritions))
  }

  handleCancel = async () => {
    const { setEdit, fetchPlanDetail } = store
    const { id } = this.props.location.query
    await fetchPlanDetail(id) // todo 可以优化
    setEdit(false)
  }

  handleSubmit = () => {
    Modal.render({
      title: t('提示'),
      children: <SumbitTip id={this.props.location.query.id} />,
      onHide: Modal.hide,
      size: 'sm',
    })
  }

  handleStockIn = () => {
    store.checkProcessOrder().then((res) => {
      Modal.render({
        style: { width: '320px' },
        title: t('提示'),
        children: (
          <StockInModal
            onOk={(checked) => store.createSheet(checked)}
            isProcess={!res.data.sheet_no}
          />
        ),
        onHide: () => Modal.hide(),
      })
    })
  }

  handlePrint = () => {
    RightSideModal.render({
      children: <PrintModal ids={[store.details.id]} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: false,
      style: {
        width: '300px',
      },
    })
  }

  render() {
    const { details, edit, disabled, canSubmit } = store
    const {
      status,
      custom_id,
      plan_finish_time,
      plan_start_time,
      finish_time,
      attrition_finished,
    } = details

    const canInStock = status === 4 // ( 2 未完成|未开工) 3 已完成   4(加工中|已开工)，未开工和已完成不可产出入库
    const isFinished = status === 3

    return (
      <ReceiptHeaderDetail
        className='b-order-detail-header'
        HeaderInfo={[
          {
            label: t('计划编号'),
            item: <div style={{ width: '300px' }}>{custom_id}</div>,
          },
        ]}
        ContentInfo={[
          {
            label: t('状态'),
            item: getEnumValue(PROCESS_RECEIPT_STATUS, status),
            tag: isFinished ? 'finish' : 'processing',
          },
          {
            label: t('计划开始时间'),
            item: plan_start_time
              ? moment(plan_start_time).format('YYYY-MM-DD')
              : '-',
          },
          {
            label: t('计划完成时间'),
            item: plan_finish_time
              ? moment(plan_finish_time).format('YYYY-MM-DD')
              : '-',
          },
          {
            label: t('完工时间'),
            item: finish_time ? moment(finish_time).format('YYYY-MM-DD') : '-',
          },
        ]}
        HeaderAction={
          edit ? (
            <>
              <Button onClick={this.handleCancel}>{t('取消')}</Button>
              <Button
                type='primary'
                className='gm-margin-left-10'
                disabled={disabled || !canSubmit}
                onClick={this.handleSubmit}
              >
                {t('保存')}
              </Button>
            </>
          ) : (
            <>
              {canInStock && (
                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={this.handleStockIn}
                >
                  {t('生成待入库单')}
                </Button>
              )}
              <FunctionSet
                right
                data={[
                  {
                    text: t('录入损耗'),
                    onClick: this.handleRecordLoss,
                    show: canInStock && attrition_finished !== 1, // 1为已完成录入损耗，不可再录入
                  },
                  { text: t('打印加工单'), onClick: this.handlePrint },
                ]}
              >
                <Button>{t('工具栏')}</Button>
              </FunctionSet>
            </>
          )
        }
      />
    )
  }
}

export default Header
