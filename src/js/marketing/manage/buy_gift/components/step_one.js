import React, { useRef, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import {} from '@gmfe/react'
import _ from 'lodash'
import {
  FormPanel,
  FormGroup,
  FormItem,
  Form,
  MoreSelect,
  Flex,
  Tip,
  Modal,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import Position from 'common/components/position'
import BatchSelectedModal from 'common/components/batch_select_modal'
import Tag from 'common/components/tag'
import Table from './one/table'

import { hasAdd } from '../utils'
import { addStore as store } from '../store'

const StepOne = observer(({ onNext }) => {
  const refFormBase = useRef(null)
  const refList = useRef(null)
  const [searchIndex, setSearchIndex] = useState(-1)

  useEffect(() => {
    store.getSaleMenuList().then(() => {
      if (store.saleMenus.length > 0) {
        store.setSelectedSaleMenu(store.saleMenus[0])
        store.getSkuTree()
        store.getExistPresentIds()
      }
    })

    // 判断是否已有数据，再初始化表格添加一个空行
    if (!store.tableOneCount) {
      store.setTableOne([{}])
    }
  }, [])

  const columns = [
    {
      Header: t('商品'),
      width: 250,
      Cell: (cellProps) => {
        const { sku_name, sku_id } = cellProps.row.original
        const show = hasAdd(sku_id, store.tableOne, 'id')
        return (
          <div>
            <div>{sku_name}</div>
            {show && <Tag color='#56A3F2'>{t('已加')}</Tag>}
            <span>{sku_id}</span>
          </div>
        )
      },
    },
    {
      Header: t('商品分类'),
      miniWidth: 50,
      Cell: (cellProps) => {
        const { category_1_name, category_2_name } = cellProps.row.original
        return <span>{`${category_1_name}/${category_2_name}`}</span>
      },
    },
    {
      Header: t('销售状态'),
      accessor: 'state',
      miniWidth: 50,
      Cell: (cellProps) => {
        const { state } = cellProps.row.original
        return (
          <span
            className='text-center'
            style={{
              width: '40px',
              backgroundColor: state ? '#56A3F2' : '#e8eaf0',
              color: '#fff',
            }}
          >
            {state ? t('上架') : t('下架')}
          </span>
        )
      },
    },
    {
      Header: t('报价单'),
      accessor: 'salemenu_name',
      miniWidth: 100,
    },
  ]

  const handleNext = () => {
    if (!store.tableOneCount) {
      return Tip.warning(t('请添加商品'))
    }

    onNext()
  }

  const handleSelect = (value) => {
    store.setSelectedSaleMenu(value)
    store.getSkuTree()
    store.getExistPresentIds()

    // 清除表格数据
    store.clearStore()
    // 添加一个空行
    store.setTableOne([{}])
  }

  const handleRequest = async (id) => {
    return store.getSkuTreeList({ category_2_id: id })
  }

  const handleBatchAddSave = (data) => {
    store.setTableOne([...store.tableOneData, ...data])
  }

  const handleBatchAdd = () => {
    Modal.render({
      title: '选择商品',
      children: (
        <BatchSelectedModal
          columns={columns}
          tree={store.skuTree.slice()}
          disableData={store.tableOneExistIds}
          onTreeSelectedRequest={handleRequest}
          onOk={handleBatchAddSave}
        />
      ),
      style: {
        width: '1062px',
      },
      onHide: Modal.hide,
    })
  }

  const labelWidth = '140px'

  const { saleMenus, selectSaleMenu, tableOne } = store

  return (
    <FormGroup
      formRefs={[refFormBase]}
      saveText={t('下一步')}
      onSubmit={handleNext}
    >
      <FormPanel title={t('报价单设置')} showBorder={false}>
        <Form ref={refFormBase} colWidth='550px' labelWidth={labelWidth}>
          <FormItem label={t('选择赠品所在报价单')} required>
            <Flex>
              <MoreSelect
                data={saleMenus.slice()}
                disabledClose
                selected={_.has(selectSaleMenu, 'id') ? selectSaleMenu : null}
                renderListFilterType='pinyin'
                placeholder={t('全部报价单')}
                renderListItem={(v) => (
                  <Flex justifyBetween>
                    <div>{v.text}</div>
                    <div className='gm-text-desc gm-text-12'>
                      {v.type === -1 && t('已删除')}
                    </div>
                  </Flex>
                )}
                onSelect={handleSelect}
              />
            </Flex>
            <div className='gm-text-desc gm-margin-top-10'>
              {t(
                '设置赠品需要选择报价单，赠品和购买有赠品的商品都必须在相同报价单',
              )}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel
        showBorder={false}
        style={{ position: 'relative' }}
        title={
          <span>
            {t('赠品总数')}:
            <span className='gm-text-primary gm-text-bold'>
              {store.tableOneCount}
            </span>
          </span>
        }
        left={
          <Flex
            nowrap
            className='gm-margin-left-10'
            style={{
              position: 'absolute',
              top: 4,
            }}
          >
            <div className='gm-border-left gm-text-bold gm-margin-right-10 gm-margin-tb-5' />
            <Button type='primary' onClick={handleBatchAdd}>
              {t('批量添加')}
            </Button>
            <Position
              className='gm-margin-left-20'
              list={tableOne.slice()}
              tableRef={refList}
              onHighlight={setSearchIndex}
              placeholder={t('请输入商品名称')}
              filterText={['sku_name']}
            />
          </Flex>
        }
      >
        <Table searchIndex={searchIndex} refList={refList} />
      </FormPanel>
    </FormGroup>
  )
})

StepOne.propTypes = {
  onNext: PropTypes.func,
}

export default StepOne
