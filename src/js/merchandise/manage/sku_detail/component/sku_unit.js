import React, { useState, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Table } from '@gmfe/table'
import { Button, Modal, Flex, MoreSelect } from '@gmfe/react'
import { getSalemenuSelected, skuContrastList } from '../util'
import skuStore from '../sku_store'
import spuStore from '../spu_store'

const abColumn = [
  {
    Header: i18next.t('变更字段'),
    id: 'fieldName',
    accessor: (d) => <div>{d.fieldName} </div>,
  },
  {
    Header: i18next.t('编辑前'),
    id: 'before',
    accessor: (d) => {
      if (d.before === '') {
        return ' '
      } else if (d.fieldName === '商品图片') {
        const list = d.before.map((v, index) => {
          return (
            <img
              src={v.url}
              key={index}
              style={{ width: 150 + 'px' }}
              className='gm-margin-bottom-5'
            />
          )
        })
        return list
      }
      return d.before
    },
  },
  {
    Header: i18next.t('编辑后'),
    id: 'after',
    accessor: (d) => {
      if (d.after === '') {
        return ' '
      } else if (d.fieldName === '商品图片') {
        const list = d.after.map((v, index) => {
          return (
            <img
              src={v.url}
              key={index}
              style={{ width: 150 + 'px' }}
              className='gm-margin-bottom-5'
            />
          )
        })
        return list
      }
      return d.after
    },
  },
]
const UnityModal = observer(
  ({
    unitySkuSalemenuList,
    onHandleChangeSalemenu,
    onHandleSave,
    nowSkuCardDetail,
    activeIndex,
  }) => {
    const {
      sale_ratio,
      sale_unit_name,
      salemenu_id,
      fee_type,
      clean_food,
    } = nowSkuCardDetail
    const ifClean = skuStore.skuDetail.clean_food || clean_food
    unitySkuSalemenuList = _.filter(unitySkuSalemenuList, {
      sale_ratio,
      sale_unit_name,
      fee_type,
      is_active: true,
      type: 4,
    })
    // 同样的商品 包括净菜
    const findOwnSelf = _.filter(unitySkuSalemenuList.slice(), {
      value: salemenu_id,
    })
    if (findOwnSelf.length <= 1) {
      _.remove(unitySkuSalemenuList, { value: salemenu_id })
    }
    unitySkuSalemenuList = _.uniqBy(unitySkuSalemenuList, 'value')

    // 若自己表单中有两个相同的物品才放进多选中
    // 可同步的表单并且去重 筛选不同货币
    const salemenuSelected = getSalemenuSelected(
      unitySkuSalemenuList,
      skuStore.skuDetail.unity_salemenu_ids,
    )
    const [arrylist, changeArrylist] = useState([])

    useEffect(() => {
      async function getBeforeSkuList() {
        await skuStore.getTurnOverList().then((json) => {
          const turnOverList = _.map(json.data, (v) => {
            return {
              value: v.id,
              text: v.name,
              unit_name: v.unit_name,
            }
          })
          skuStore.changeTurnOverList(turnOverList)
        })
        // 周转物
        await skuStore.getBeforeSkuListDetail(spuStore.spuDetail.id)
        changeArrylist(
          skuContrastList(
            skuStore.beforeSkuList[activeIndex],
            skuStore.skuDetail,
            skuStore.beforeSkuList[activeIndex].bind_turnover,
            skuStore.skuDetail.bind_turnover,
          ),
        )
      }
      getBeforeSkuList()
    }, [])
    //
    return (
      <div>
        <span>
          {i18next.t('当前商品做了如下修改:')}
          {ifClean && i18next.t('(不包括加工信息和工艺信息)')}
        </span>
        <Table
          data={arrylist}
          className='gm-margin-top-5'
          style={{
            maxHeight: 450 + 'px',
          }}
          columns={abColumn}
        />
        <div
          style={{
            display: 'flex',
          }}
          className='gm-margin-top-10'
        >
          <p className='gm-margin-right-10 gm-margin-top-10'>
            {i18next.t('选择需要同步的报价单:')}
          </p>
          <div
            style={{
              flex: 1,
            }}
          >
            <MoreSelect
              multiple
              data={unitySkuSalemenuList.slice()}
              disabled={unitySkuSalemenuList.length === 0}
              selected={salemenuSelected}
              onSelect={onHandleChangeSalemenu}
              renderListFilterType='pinyin'
              className='gm-margin-bottom-10'
            />
            {unitySkuSalemenuList.length >= 1 ? (
              <span>
                {i18next.t('选择需要同步修改的报价单，如不选择则保存当前修改')}
              </span>
            ) : (
              <span
                style={{
                  color: 'red',
                }}
              >
                {i18next.t('当前无 报价单，点击保存后保存当前商品修改')}
              </span>
            )}
          </div>
        </div>
        <div className='gm-gap-10' />
        <Flex justifyEnd>
          <Button onClick={() => Modal.hide()}> {i18next.t('取消')} </Button>
          <div className='gm-gap-5' />
          <Button type='primary' onClick={onHandleSave}>
            {i18next.t('保存')}
          </Button>
        </Flex>
      </div>
    )
  },
)

export default UnityModal
