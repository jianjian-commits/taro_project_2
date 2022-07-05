import {
  Button,
  DateRangePicker,
  Dialog,
  Flex,
  Input,
  MoreSelect,
} from '@gmfe/react'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { CYCLE_QUOTE_TYPE } from 'common/enum'
import { history } from 'common/service'
import { formatStartEndDate } from 'common/util'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { useEffect, useRef } from 'react'
import globalStore from 'stores/global'
import { isStatusEditCode } from '../index.page'
import store, { COPY_VIEW_TYPE } from '../store/detail'
import EditStatusSelect from './edit_status'

/**
 * 报价详情页头部组件函数，用来展示供应商周期报价详情页头部
 * @return {Object} 组件渲染的内容
 */
function Header() {
  const isSupply = globalStore.isSettleSupply()
  // 有编辑权限或者是供应商账号
  const editPermission =
    isSupply || globalStore.hasPermission('edit_cycle_quoted_price')
  const { isAdd, isEdit = false, viewType, details = {}, supplierList } = store

  const {
    settle_supplier_id,
    supplier_name,
    quote_rule_id = '-',
    quote_rule_name,
    begin_time,
    end_time,
    status,
    creator = '-',
    create_time,
    last_operater = '-',
    last_modify_time,
  } = details
  // 详情路径
  const editPath = `/sales_invoicing/base/cycle_quote_rules/edit?id=${quote_rule_id}`
  // 头部状态是否可编辑，【编辑】按钮是否显示
  const isStatusEdit = isStatusEditCode.includes(status)
  const targetRef = useRef()

  useEffect(() => {
    store.getSupplier()
  }, [])

  /**
   * 保存更改时触发的动作
   * @return {Promise} 保存的请求结果
   */
  function onOk() {
    return store.onSave()
  }

  /**
   * 开始编辑时触发的动作
   */
  function handleEdit() {
    store.changeEdit(true)
  }

  /**
   * 日期发生更改时触发的动作
   */
  function onDateChange(startTime, endTime) {
    const [begin_time, end_time] = formatStartEndDate(
      startTime,
      endTime,
      'YYYY-MM-DD HH:mm:ss',
    )
    store.changeDetail({ begin_time, end_time })
  }

  /**
   * 按下键盘时触发的动作
   */
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      targetRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  /**
   * 确认取消修改时触发的动作
   */
  function handleCancel() {
    // 新增则返回
    if (isAdd) {
      history.goBack()
    } else if (viewType === COPY_VIEW_TYPE) {
      // 复制则回到编辑详情页
      history.push(editPath)
    } else {
      // 取消修改后,重新拉取数据
      store.resetDetail()
    }
  }

  /**
   * 申请取消修改时触发的动作
   */
  function handleConfirmCancel() {
    Dialog.confirm({
      title: t('提示'),
      children: t('确认放弃此次修改吗？'),
      disableMaskClose: true,
    }).then(handleCancel)
  }

  /**
   * 复制规则时触发的动作
   */
  function onCopy() {
    const path = `${editPath}&viewType=${COPY_VIEW_TYPE}`
    history.push(path)
  }

  return (
    <ReceiptHeaderDetail
      contentCol={4}
      customeContentColWidth={[350, 350, 350, 350]}
      HeaderAction={
        editPermission &&
        (isEdit ? (
          <Flex>
            <Button onClick={handleConfirmCancel}>{t('取消')}</Button>
            <Button type='primary' className='gm-margin-left-10' onClick={onOk}>
              {t('保存')}
            </Button>
          </Flex>
        ) : (
          <Flex>
            {isStatusEdit && (
              <Button type='primary' onClick={handleEdit}>
                {t('修改')}
              </Button>
            )}
            <Button className='gm-margin-left-10' onClick={onCopy}>
              {t('复制')}
            </Button>
          </Flex>
        ))
      }
      ContentInfo={[
        {
          label: t('起止时间'),
          item: isEdit ? (
            <DateRangePicker
              onChange={onDateChange}
              begin={begin_time ? moment(begin_time) : undefined}
              end={end_time ? moment(end_time) : undefined}
            />
          ) : begin_time ? (
            `${moment(begin_time).format('YYYY-MM-DD')} ~ ${moment(
              end_time,
            ).format('YYYY-MM-DD')}`
          ) : (
            '-'
          ),
        },
        {
          label: t('状态'),
          item:
            isEdit && !isAdd && isStatusEdit ? (
              <EditStatusSelect
                onChange={(status) => store.changeDetail({ status })}
                {...{ updated: { begin_time, end_time, status } }}
              />
            ) : (
              CYCLE_QUOTE_TYPE.find(({ value }) => value === status)?.text ||
              '-'
            ),
        },
        { label: t('创建人'), item: creator },
        {
          label: t('创建时间'),
          item: create_time
            ? moment(create_time).format('YYYY-MM-DD HH:mm')
            : '-',
        },
        { label: t('最后修改人'), item: last_operater },
        {
          label: t('最后修改时间'),
          item: last_modify_time
            ? moment(last_modify_time).format('YYYY-MM-DD HH:mm')
            : '-',
        },
      ]}
      HeaderInfo={[
        {
          label: t('规则名称'),
          item: isEdit ? (
            <Input
              className='form-control'
              placeholder={t('请输入规则名称')}
              maxLength={30}
              value={quote_rule_name}
              onChange={(e) =>
                store.changeDetail({ quote_rule_name: e.target.value })
              }
            />
          ) : (
            quote_rule_name
          ),
        },
        {
          label: t('供应商'),
          item:
            /**
             * 1.供应商不用选择
             * 2.只有新增能编辑
             * */
            !isSupply && isAdd ? (
              <MoreSelect
                ref={targetRef}
                data={supplierList.slice()}
                selected={
                  settle_supplier_id
                    ? { value: settle_supplier_id, text: supplier_name }
                    : undefined
                }
                isGroupList
                onSelect={({
                  value: settle_supplier_id,
                  text: supplier_name,
                }) => store.changeDetail({ settle_supplier_id, supplier_name })}
                onKeyDown={handleKeyDown}
                renderListFilterType='pinyin'
                placeholder={t('请选择系统供应商')}
                disabledClose
                style={{ width: 150 }}
              />
            ) : isSupply ? (
              // 供应商的话就是登录名
              globalStore.user.station_name
            ) : (
              supplier_name
            ),
        },
        {
          label: t('报价规则编号'),
          item: quote_rule_id,
        },
      ]}
    />
  )
}

export default observer(Header)
