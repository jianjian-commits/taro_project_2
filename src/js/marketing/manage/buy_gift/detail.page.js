import React, { useRef, useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  FormPanel,
  FormGroup,
  FormItem,
  Flex,
  Form,
  FormBlock,
  CheckboxGroup,
  Checkbox,
  InputNumberV2,
  Select,
  Button,
  Modal,
  Tip,
} from '@gmfe/react'
import { observer } from 'mobx-react'

import { detailStore as store } from './store'
import { hasAdd, STATE_DATA } from './utils'

import { withRouter } from 'common/service'
import Position from 'common/components/position'
import BatchSelectedModal from 'common/components/batch_select_modal'
import Table from './components/detail/table'

const DetailPage = withRouter(
  observer((props) => {
    const { id } = props.location.query
    const refFormBase = useRef(null)
    const refFormMethod = useRef(null)
    const refList = useRef(null)
    const [searchIndex, setSearchIndex] = useState([])

    useEffect(() => {
      store.getDetail(id).then((json) => {
        const { salemenu_id } = json.data
        // 设置对应报价单
        store.setSaleMenuId(salemenu_id)
        store.getSkuTree()
        store.getExistPresentIds()
      })
    }, [])

    const handleSave = () => {
      // 校验
      if (store.presentType.length === 0) {
        return Tip.warning(t('请选择赠送方式'))
      }

      if (store.hasProduct) {
        if (!store.hasFailProduct) {
          return Tip.warning(t('请删除失效商品'))
        }

        if (!store.noEmptyRatio) {
          return Tip.warning(t('请填写兑换比例'))
        }

        if (store.tableCount === 0) {
          return Tip.warning(t('请添加商品'))
        }
      }

      store.updateDetail(id).then(() => {
        Tip.success(t('保存成功'))
      })
    }

    const handleCancel = () => {
      store.getDetail(id).then((json) => {
        const { salemenu_id } = json.data
        // 设置对应报价单
        store.setSaleMenuId(salemenu_id)
        store.getSkuTree()
        store.getExistPresentIds()
      })
    }

    const handleBatchAddSave = (data) => {
      store.setTable([...store.tableData, ...data])
    }

    const handleRequest = async (id) => {
      return store.getSkuTreeList({ category_2_id: id })
    }

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

    const handleBatchAdd = () => {
      Modal.render({
        title: '选择商品',
        children: (
          <BatchSelectedModal
            columns={columns}
            tree={store.skuTree.slice()}
            disableData={store.tableExistIds}
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

    const handleSelectCheck = (v) => {
      store.setPresentType(v)
    }

    const labelWidth = '120px'
    const {
      table,
      presentType,
      status,
      skuName,
      spec,
      sort,
      salemenuName,
      stockNum,
      has_used_stock,
    } = store

    return (
      <FormGroup
        formRefs={[refFormBase, refFormMethod]}
        onCancel={handleCancel}
        onSubmit={handleSave}
      >
        <FormPanel title={t('基本信息')}>
          <Form ref={refFormBase} colWidth='300px' labelWidth={labelWidth}>
            <FormBlock col={2}>
              <FormItem label={t('商品名')}>
                <div className='text-center gm-margin-top-5'>{skuName}</div>
              </FormItem>
              <FormItem label={t('规格名')}>
                <div className='text-center gm-margin-top-5'>{spec}</div>
              </FormItem>
              <FormItem label={t('商品分类')}>
                <div className='text-center gm-margin-top-5'>{sort}</div>
              </FormItem>
              <FormItem label={t('报价单')}>
                <div className='text-center gm-margin-top-5'>
                  {salemenuName}
                </div>
              </FormItem>
              <FormItem
                label={t('库存设置')}
                toolTip={
                  <div className='gm-padding-5'>{t('0表示不设置活动库存')}</div>
                }
              >
                <InputNumberV2 onChange={store.setStockNum} value={stockNum} />
              </FormItem>
              <FormItem label={t('状态')}>
                <Select
                  data={STATE_DATA}
                  value={status}
                  onChange={store.setStatus}
                />
              </FormItem>
              <FormItem label={t('已用库存')}>
                <div className='text-center gm-margin-top-5'>
                  {has_used_stock}
                </div>
              </FormItem>
            </FormBlock>
          </Form>
        </FormPanel>
        <FormPanel title={t('赠送方式')}>
          <Form ref={refFormMethod} colWidth='400px' labelWidth={labelWidth}>
            <FormItem label={t('选择赠送方式')} required>
              <CheckboxGroup
                name='method'
                value={presentType}
                onChange={handleSelectCheck}
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
                  {store.tableCount}
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
                  list={table.slice()}
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
  }),
)

export default DetailPage
