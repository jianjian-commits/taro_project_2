import React, { useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { Modal } from '@gmfe/react'
import {
  FormPanel,
  FormGroup,
  FormItem,
  Form,
  Checkbox,
  CheckboxGroup,
  Flex,
  Tip,
  Button,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { history, System } from 'common/service'
import Position from 'common/components/position'
import BatchSelectedModal from 'common/components/batch_select_modal'
import Table from './two/table'

import { hasAdd } from '../utils'
import { addStore as store } from '../store'

const StepTwo = ({ onPrevious }) => {
  const refFormMethod = useRef(null)
  const refList = useRef(null)
  const [searchIndex, setSearchIndex] = useState(-1)

  const columns = [
    {
      Header: t('商品'),
      width: 250,
      Cell: (cellProps) => {
        const { sku_name, sku_id } = cellProps.row.original
        const show = hasAdd(sku_id, store.tableTwo, 'id')
        return (
          <div>
            <div>{sku_name}</div>
            {show && (
              <span
                style={{
                  border: '1px solid #56A3F2',
                  color: '#56A3F2',
                }}
              >
                {t('已加')}
              </span>
            )}
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

  const handleSave = () => {
    // 校验
    if (store.presentType.length === 0) {
      return Tip.warning(t('请选择赠送方式'))
    }

    if (!store.canSubmit && store.hasProduct) {
      return Tip.warning(t('请填写兑换比例'))
    }

    if (store.tableTwoCount === 0 && store.hasProduct) {
      return Tip.warning(t('请添加商品'))
    }

    store.createBuyGift().then(() => {
      Tip.success(t('创建成功'))
      history.push(System.getUrl('/marketing/manage/buy_gift'))
    })
  }

  const handleBatchAddSave = (data) => {
    store.setTableTwo([...store.tableTwoData, ...data])
  }

  const handleRequest = async (id) => {
    return store.getSkuTreeList({ category_2_id: id })
  }

  const handleBatchAdd = () => {
    Modal.render({
      title: '选择商品',
      children: (
        <BatchSelectedModal
          columns={columns}
          tree={store.skuTree.slice()}
          disableData={store.tableTwoExistIds}
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

  const handleSelected = (v) => {
    store.setPresentType(v)
  }

  const labelWidth = '140px'

  const { tableTwo, presentType } = store

  return (
    <FormGroup
      formRefs={[refFormMethod]}
      onSubmit={handleSave}
      onCancel={onPrevious}
    >
      <FormPanel title={t('赠送方式')} showBorder={false}>
        <Form ref={refFormMethod} colWidth='400px' labelWidth={labelWidth}>
          <FormItem required label={t('选择赠送方式')}>
            <CheckboxGroup
              name='method'
              value={presentType}
              onChange={handleSelected}
            >
              <Checkbox value={1}>{t('满赠')}</Checkbox>
              <Checkbox value={2}>
                {t('买赠')}
                <span className='gm-margin-left-20 gm-text-desc'>
                  {t('选择买赠请设置购买商品')}
                </span>
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>
      </FormPanel>
      {store.hasProduct && (
        <FormPanel
          showBorder={false}
          style={{ position: 'relative' }}
          title={
            <span>
              {t('商品总数')}:
              <span className='gm-text-primary gm-text-bold'>
                {store.tableTwoCount}
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
                list={tableTwo.slice()}
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
      )}
    </FormGroup>
  )
}

StepTwo.propTypes = {
  onPrevious: PropTypes.func,
}

export default observer(StepTwo)
