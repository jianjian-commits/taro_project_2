import store from '../store/receipt_store'
import {
  Dialog,
  Flex,
  FunctionSet,
  Modal,
  Tip,
  Price,
  Input,
  RightSideModal,
  Button,
  Select,
  MoreSelect,
  DatePicker,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import { outStockStatusMap, closeWindowDialog, receiptTypeTag } from '../util'
import Big from 'big.js'
import React, { useState } from 'react'
import moment from 'moment'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'

import { observer } from 'mobx-react'
import _ from 'lodash'

import globalStore from 'stores/global'
import OutStockConfirm from './out_stock_confirm'
import PopupPrint from './popup_print_modal'

const HeaderAction = observer(() => {
  const [isSubmit, setIsSubmit] = useState(false)

  const { outStockDetail, isAddPage } = store
  const { status, id, is_frozen } = outStockDetail

  const verifySubmitData = () => {
    let canSubmit = true
    const { outStockDetail } = store
    const {
      out_stock_time,
      out_stock_target_type,
      out_stock_target,
      out_stock_customer,
      id,
    } = outStockDetail
    if (!id?.trim()) {
      canSubmit = false
      Tip.warning(t('请输入出库单号'))
      return false
    }
    if (out_stock_target_type === 1 && !out_stock_customer) {
      canSubmit = false
      Tip.warning(t('请选择出库商户'))
      return false
    }

    if (out_stock_target_type === 2 && !out_stock_target) {
      canSubmit = false
      Tip.warning(t('请输入自定义出库对象'))
      return false
    }

    if (!out_stock_time) {
      canSubmit = false
      Tip.warning(t('请选择出库时间'))
      return false
    }

    const postData = store.getValidStockOutListData()

    if (postData.length === 0) {
      Tip.warning(t('没有添加出库商品'))
      canSubmit = false

      return false
    }

    _.each(postData, (v) => {
      if (_.isNil(v.id) || _.isNil(v.quantity)) {
        Tip.warning(t('填写出库商品信息不完善'))
        canSubmit = false
        return false
      }

      // 若计算方式为先进先出，or是净菜站点，批次为必填字段，
      // 但如果该商品被标记缺货了，out_of_stock为true， 则不必判断批次
      // 如果出库数填写为0，不需要选择批次也可提交，但是在提交时加了提示
      if (
        (globalStore.otherInfo.cleanFood ||
          globalStore.user.stock_method === 2) &&
        v.quantity !== 0
      ) {
        if (v.batch_details.length === 0 && !v.out_of_stock) {
          canSubmit = false
          Tip.warning(t('请选择出库批次'))
          return false
        }
      }
    })

    return canSubmit
  }

  const handleSubmit = (submitType, type = 'modify') => {
    setIsSubmit(true)
    const { id } = store.outStockDetail
    store
      .postOutStockList(submitType, type)
      .then((json) => {
        store.fetchOutStockList(id).then(() => {
          if (submitType === 1) {
            Tip.success(t('保存成功'))
          }

          if (json.code === -1) {
            Tip.warning(t('所选批次剩余库存不足，请处理标记为异常的出库批次'))

            store.setAnomalyError(json.data.sku_id)
          } else {
            if (submitType === 2) {
              closeWindowDialog(t('出库单已提交成功'))
            }
          }
        })
      })
      .finally(() => setIsSubmit(false))
  }

  const handleModifySaveDraft = () => {
    // 创建完成之后的保存草稿
    if (verifySubmitData()) {
      handleSubmit(1)
    }
  }

  const handleCreateSaveDraft = () => {
    // 待提交
    if (verifySubmitData()) {
      const {
        createOutStock,
        outStockDetail: { id },
      } = store
      createOutStock(1).then(() => {
        Tip.success(t('保存成功'))
        history.push({
          pathname: '/sales_invoicing/stock_out/product/receipt',
          query: { id },
        })
      })
    }
  }

  const handleSubmitAndClose = (submitType, type = 'modify') => {
    handleHideModal()
    handleSubmit(submitType, type)
  }

  const handleHideModal = () => {
    Modal.hide()
  }

  const handleOutStock = (type = 'modify') => {
    const { stock_method } = globalStore.user
    // 单个出库, 先进先出逻辑不变, 加权平均 负库存不允许出库 不展示继续出库按钮
    const { isNegativeAllow } = globalStore.otherInfo
    const canContinueOutStock =
      stock_method === 2 ||
      (stock_method === 1 && isNegativeAllow === 1) ||
      globalStore.isCleanFood()

    if (verifySubmitData()) {
      setIsSubmit(true)
      store
        .confirmOutStock(stock_method)
        .then((json) => {
          if (
            json.data &&
            json.data.spu_remain &&
            json.data.spu_remain.length
          ) {
            Modal.render({
              children: (
                <Flex column>
                  <OutStockConfirm
                    list={json.data.spu_remain}
                    onHide={() => Modal.hide()}
                    single
                  />
                  <Flex justifyEnd className='gm-margin-top-5'>
                    <Button
                      className='gm-margin-right-5'
                      onClick={handleHideModal}
                    >
                      {t('取消操作')}
                    </Button>
                    {canContinueOutStock && (
                      <Button
                        type='primary'
                        onClick={() => {
                          handleSubmitAndClose(2, type)
                        }}
                      >
                        {t('继续出库')}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              ),
              title: t('提醒'),
              style: { width: '500px' },
              onHide: Modal.hide,
            })
          } else {
            handleSubmit(2, type)
          }
        })
        .finally(() => setIsSubmit(false))
    }
  }

  const handleDelete = () => {
    Dialog.confirm({
      children: t('是否删除此单据?'),
      title: t('确认删除'),
    }).then(() => {
      store.deleteReceipt(id).then(() => {
        window.location.reload()
      })
    })
  }

  const handlePrint = () => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: <PopupPrint data_ids={[id]} />,
    })
  }

  const confirmSubmit = (action = 'modify') => {
    const postData = store.getValidStockOutListData()

    const isNeedConfirm = _.some(postData, (data) => data.quantity == 0)

    if (isNeedConfirm) {
      Dialog.confirm({
        children: t('当前单据有出库数量为0条目,是否继续提交?'),
        title: t('提交'),
      }).then(() => {
        handleOutStock(action)
      })
    } else {
      handleOutStock(action)
    }
  }
  return (
    <Flex alignCenter>
      {isAddPage && (
        <Button
          loading={isSubmit}
          type='primary'
          className='gm-margin-right-5'
          onClick={() => confirmSubmit('create')}
        >
          {t('确认出库')}
        </Button>
      )}
      {/* 在编辑页，且还是待出库过程才显示 */}
      {status === 1 && !isAddPage && (
        <Button
          loading={isSubmit}
          type='primary'
          className='gm-margin-right-5'
          onClick={() => confirmSubmit()}
        >
          {t('确认出库')}
        </Button>
      )}
      {!isAddPage ? (
        <FunctionSet
          data={[
            {
              text: t('保存草稿'),
              onClick: handleModifySaveDraft,
              show: status !== 2 && status !== 3,
            },
            {
              text: t('打印出库单'),
              onClick: handlePrint,
              show: globalStore.hasPermission('print_out_stock') && !isAddPage,
            },
            {
              text: t('冲销'),
              onClick: handleDelete,
              show: status !== 3 && !isAddPage && !is_frozen,
            },
          ]}
          right
        />
      ) : (
        <Button onClick={handleCreateSaveDraft}>{t('保存草稿')}</Button>
      )}
    </Flex>
  )
})

const HeaderDetail = observer(() => {
  const renderHeaderInfo = () => {
    const { outStockDetail, isAddPage } = store
    const { id, is_frozen } = outStockDetail

    const handleChange = (event) => {
      /** 只能数据英文字母或数字，仅去除双字节 */
      // eslint-disable-next-line no-control-regex
      const value = event.target.value.replace(/[^a-zA-Z0-9]+/, '')
      store.changeDetail('id', value)
    }

    return [
      {
        label: t('出库单号'),
        item: !isAddPage ? (
          <>
            <div>{id}</div>
            <div>{is_frozen ? t('历史单据，不允许修改') : ''}</div>
          </>
        ) : (
          <Flex alignCenter>
            <Input
              className='form-control'
              style={{ width: '240px' }}
              value={id ?? ''}
              maxLength={14}
              onChange={handleChange}
              placeholder={t('请输入出库单号(8~14个英文或数字)')}
            />
            <p
              className='gm-text-12 gm-text-red'
              style={{
                whiteSpace: 'nowrap',
                fontWeight: 'normal',
                margin: '0 0 0 5px',
              }}
            >
              {id?.length < 8 ? t('出库单号长度须满足为8～14') : ''}
            </p>
          </Flex>
        ),
      },
    ]
  }

  const renderContentInfo = () => {
    const { outStockDetail, isAddPage, outStockTargetList } = store
    const {
      out_stock_target,
      out_stock_time,
      status,
      creator,
      out_stock_remark,
      last_operate_time,
      out_stock_target_type,
      out_stock_customer,
    } = outStockDetail

    const handleDetailChange = (name, value) => {
      store.changeDetail(name, value)
    }

    const handleCheckCurrentData = (data) => {
      store.checkDetailData(data)
    }

    const handleSearch = (search_text) => {
      store.fetchOutStockTargetList(search_text)
    }

    return [
      {
        label: (() => {
          if (!isAddPage) return t('商户信息')
          return (
            <Select
              onChange={(value) =>
                handleDetailChange('out_stock_target_type', value)
              }
              data={[
                { value: 1, text: t('商户列表') },
                { value: 2, text: t('自定义商户') },
              ]}
              value={out_stock_target_type}
            />
          )
        })(),
        item: (() => {
          if (!isAddPage) return out_stock_target
          return out_stock_target_type === 1 ? (
            <MoreSelect
              style={{ width: '100%' }}
              disabledClose
              placeholder={t('请选择出库商户')}
              selected={out_stock_customer}
              data={outStockTargetList.slice()}
              renderSelected={(item) => item.resname}
              onSelect={(value) => {
                handleDetailChange('out_stock_customer', value)
                handleCheckCurrentData(value)
              }}
              onSearch={(value) => handleSearch(value)}
              renderListFilter={(data) => {
                return data
              }}
            />
          ) : (
            <Input
              className='form-control'
              value={out_stock_target ?? ''}
              placeholder={t('请输入自定义商户名')}
              onChange={(event) =>
                handleDetailChange('out_stock_target', event.target.value)
              }
            />
          )
        })(),
      },
      {
        label: t('出库时间'),
        item: (() => {
          if (status && status !== 1 && !isAddPage)
            return moment(out_stock_time).format('YYYY-MM-DD HH:mm') ?? '-' // 排除初始状态为 null
          return (
            <DatePicker
              enabledTimeSelect
              date={out_stock_time}
              onChange={(value) => handleDetailChange('out_stock_time', value)}
            />
          )
        })(),
      },
      {
        label: t('出库单状态'),
        item: outStockStatusMap[status] ?? '-',
        tag: receiptTypeTag(status),
      },
      {
        label: t('建单人'),
        item: creator ?? '-',
      },
      {
        label: t('最后操作时间'),
        item: last_operate_time ?? '-',
      },
      {
        label: t('单据备注'),
        item:
          status === 1 || isAddPage ? (
            <Input
              type='text'
              maxLength={100}
              name='out_stock_remark'
              className='gm-paddingLR5 form-control'
              style={{ width: '350px' }}
              value={out_stock_remark || ''}
              onChange={(e) =>
                handleDetailChange(e.target.name, e.target.value)
              }
            />
          ) : (
            <div style={{ width: '350px' }}>{out_stock_remark}</div>
          ),
      },
    ]
  }

  const renderTotalData = () => {
    const { money } = store.outStockDetail

    return [
      {
        text: t('成本金额'),
        value: (
          <Price
            value={
              money === '-'
                ? 0
                : +Big(money || 0)
                    .div(100)
                    .toFixed(2)
            }
          />
        ),
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      customeContentColWidth={[300, 300, 300, 300]}
      contentLabelWidth={100}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction />}
      ContentInfo={renderContentInfo()}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
