import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Price,
  Button,
  DropDown,
  DropDownItems,
  DropDownItem,
  DatePicker,
  RightSideModal,
} from '@gmfe/react'
import { QuickDesc } from '@gmfe/react-deprecated'
import styles from '../../product.module.less'
import Big from 'big.js'
import PropTypes from 'prop-types'
import moment from 'moment'
import PopupPrintModal from './popup_print_modal'
import globalStore from '../../../stores/global'

class InStockDetailHeader extends React.Component {
  handlePrint = () => {
    const {
      inStockDetail: { id },
    } = this.props

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrintModal closeModal={RightSideModal.hide} data_ids={[id]} />
      ),
    })
  }

  render() {
    const { statusMap, inStockDetail, can_submit_in_stock, type } = this.props
    const {
      sku_money,
      delta_money,
      id,
      supplier_name,
      supplier_customer_id,
      submit_time,
      status,
      creator,
    } = inStockDetail
    const totalMoney = Big(sku_money || 0)
      .plus(delta_money || 0)
      .toFixed(2)
    const isAdd = type === 'add'
    // 是否处于审核状态，审核状态操作多，单独处理
    const isCheck = status + '' === '2'
    // 是否可以冲销
    const isCancel =
      status + '' === '0' || status + '' === '1' || status + '' === '2'

    const headerLeft = (
      <Flex alignCenter>
        <div className={styles.title}>{i18next.t('入库单号')}:&nbsp;</div>
        <div className={styles.content}>{id || '-'}</div>
      </Flex>
    )

    const canPrint = globalStore.hasPermission('print_in_stock')

    const headerRight = (
      <Flex column className='gm-padding-tb-10'>
        <Flex className='gm-padding-tb-5'>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('供应商名称')}:&nbsp;</div>
            <div
              className={styles.content}
            >{`${supplier_name}(${supplier_customer_id})`}</div>
          </Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('入库时间')}:&nbsp;</div>
            {isAdd ? (
              <DatePicker
                date={moment(submit_time === '-' ? new Date() : submit_time)}
                onChange={this.props.handleChangeDate}
              />
            ) : (
              <div className={styles.content}>{submit_time}</div>
            )}
          </Flex>
        </Flex>
        <Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('入库单状态')}:&nbsp;</div>
            <div className={styles.content}>{statusMap[status] || '-'}</div>
          </Flex>
          <Flex flex={1} alignCenter>
            <div className={styles.title}>{i18next.t('建单人')}:&nbsp;</div>
            <div className={styles.content}>{creator}</div>
          </Flex>
        </Flex>
      </Flex>
    )

    return (
      <QuickDesc
        left={headerLeft}
        right={headerRight}
        leftFlex={1}
        rightFlex={2}
      >
        <Flex
          flex={2}
          justifyBetween
          className='gm-padding-15 gm-border-right gm-margin-right-15'
        >
          <div className={styles.title}>{i18next.t('入库金额')}</div>
          <div className={styles.money}>
            {totalMoney}
            {Price.getUnit()}
          </div>
        </Flex>
        <Flex
          flex={2}
          justifyBetween
          className='gm-padding-15 gm-margin-left-15'
        >
          <div className={styles.title}>{i18next.t('商品金额')}</div>
          <div className={styles.money}>
            {sku_money || 0}
            {Price.getUnit()}
          </div>
        </Flex>
        <Flex flex={2} justifyBetween className='gm-padding-15'>
          <div className={styles.title}>{i18next.t('折让金额')}</div>
          <div className={styles.money}>
            {delta_money || 0}
            {Price.getUnit()}
          </div>
        </Flex>
        <Flex flex={3} justifyEnd className='gm-margin-15'>
          {isAdd && can_submit_in_stock ? (
            <Button
              type='primary'
              className='gm-margin-right-5 gm-margin-tb-5'
              onClick={this.props.handleSubmit}
            >
              {i18next.t('提交入库单')}
            </Button>
          ) : null}
          <DropDown
            right
            popup={
              <DropDownItems>
                {isAdd && (
                  <DropDownItem onClick={this.props.handleSaveDraft}>
                    {i18next.t('保存草稿')}
                  </DropDownItem>
                )}
                {canPrint && (
                  <DropDownItem onClick={this.handlePrint}>
                    {i18next.t('打印入库单')}
                  </DropDownItem>
                )}
                <DropDownItem onClick={this.props.handleExport}>
                  {i18next.t('导出入库单')}
                </DropDownItem>
                {!isAdd && isCheck && (
                  <DropDownItem onClick={this.props.handleRefuse}>
                    {i18next.t('审核不通过')}
                  </DropDownItem>
                )}
                {isCancel && (
                  <DropDownItem onClick={this.props.handleCancel}>
                    {i18next.t('冲销')}
                  </DropDownItem>
                )}
              </DropDownItems>
            }
          >
            <Button type='primary' plain className='gm-margin-top-5'>
              {i18next.t('工具栏')}&nbsp;&nbsp;
              <span className='caret' />
            </Button>
          </DropDown>
        </Flex>
      </QuickDesc>
    )
  }
}

InStockDetailHeader.propTypes = {
  handleChangeDate: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSaveDraft: PropTypes.func.isRequired,
  handleExport: PropTypes.func.isRequired,
  handleRefuse: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  inStockDetail: PropTypes.object.isRequired,
  can_submit_in_stock: PropTypes.bool.isRequired,
  statusMap: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
}

export default InStockDetailHeader
