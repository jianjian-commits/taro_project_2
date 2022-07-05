import { setTitle } from '@gm-common/tool'
import { TableXUtil } from '@gmfe/table-x'
import HeaderTip from 'common/components/header_tip'
import { renderPurchaseSpec } from 'common/filter'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router'
import store, { COPY_VIEW_TYPE } from '../store/detail'
import AddSkuRuleModal from './add_sku_rule_modal'
import Category from './category'
import CellId from './cell_id'
import CellInput from './cell_input'
import CellPrice from './cell_price'
import Header from './header'
import PositionList from './position_list'
import ProductNameCell from './product_name_cell'

const { TABLE_X, OperationHeader, EditOperation } = TableXUtil

/**
 * 报价规则详情组件函数，用来展示供应商周期报价规则页
 * @param  {Object} props 父组件传入的属性
 * @return {Object}       组件渲染的内容
 */
function Detail(props) {
  const { isAdd } = props

  const { sku_details, isEdit, isSupply } = store

  const { query = {} } = useLocation()
  const { id, viewType } = query

  useEffect(() => {
    store.changeIsAdd(isAdd || viewType === COPY_VIEW_TYPE)
  }, [isAdd, viewType])

  useEffect(() => {
    store.changeViewType(viewType)
  }, [viewType])

  useEffect(() => {
    if (id?.length) {
      store.getDetail(id)
    }
  }, [id])

  useEffect(() => {
    setTitle(t('周期报价规则'))
    return () => {
      store.clearStore()
    }
  }, [])

  const getInputMinWidth = useCallback((isInput) => (isInput ? 220 : 150), [])

  /**
   * 设置表单展示栏
   */
  const columns = useMemo(
    () =>
      [
        {
          Header: t('序号'),
          accessor: 'index',
          id: 'index',
          width: 60,
          fixed: 'left',
          Cell: ({ row: { index } }) => index + 1,
        },
        isEdit && {
          Header: OperationHeader,
          accessor: 'action',
          id: 'operation',
          fixed: 'left',
          width: TABLE_X.WIDTH_OPERATION,
          Cell: (cellProp) => {
            const {
              row: { index },
            } = cellProp
            return (
              <EditOperation
                onAddRow={() => store.addSkuRow()}
                onDeleteRow={() => store.removeSkuRow(index)}
              />
            )
          },
        },
        {
          Header: t('采购规格ID'),
          accessor: 'sku_id',
          width: 110,
          fixed: 'left',
          Cell: (cellProp) => {
            const {
              row: {
                original: { sku_id, fail_reason },
              },
            } = cellProp
            return <CellId sku_id={sku_id} msg={fail_reason} />
          },
        },
        {
          Header: t('规格名称'),
          accessor: 'sku_name',
          id: 'sku_name',
          isKeyboard: true,
          minWidth: 180,
          Cell: (cellProp) => {
            const {
              row: {
                original: { sku_id, sku_name },
                index,
              },
            } = cellProp
            return isEdit ? (
              <ProductNameCell
                index={index}
                sku_id={sku_id}
                sku_name={sku_name}
              />
            ) : (
              sku_name
            )
          },
        },

        {
          Header: t('采购规格'),
          accessor: 'spec_info',
          id: 'spec_info',
          minWidth: 100,
          Cell: (cellProps) =>
            cellProps.row.original.spec_info ??
            renderPurchaseSpec(cellProps.row.original),
        },
        {
          Header: t('分类'),
          accessor: 'category',
          id: 'category',
          minWidth: 150,
          Cell: (cellProp) => {
            const {
              row: {
                original: { category_name_1, category_name_2 },
              },
            } = cellProp
            return (
              <Category
                categoryName1={category_name_1}
                categoryName2={category_name_2}
              />
            )
          },
        },
        {
          Header: (
            <HeaderTip
              title={t('预报价（基本单位）')}
              tip={t('指供应商的报价，仅做参考不作为规则价')}
            />
          ),
          id: 'std_unite_pre_quote',
          accessor: 'std_unite_pre_quote',
          isKeyboard: isSupply,
          minWidth: getInputMinWidth(isEdit && isSupply),
          Cell: (cellProp) => {
            const {
              row: {
                original: {
                  std_unite_pre_quote,
                  std_unit_name,
                  std_unite_protocol_price,
                  ratio,
                  isOld,
                },
                index,
              },
            } = cellProp
            return (
              <CellPrice
                index={index}
                value={std_unite_pre_quote}
                valueKey='std_unite_pre_quote'
                unit_name={std_unit_name}
                compareValue={std_unite_protocol_price}
                ratio={ratio}
                ratioKey='pack_unite_pre_quote'
                isEdit={isSupply}
                isOld={isOld}
              />
            )
          },
        },
        {
          Header: t('预报价（采购单位）'),
          id: 'pack_unite_pre_quote',
          accessor: 'pack_unite_pre_quote',
          isKeyboard: isSupply,
          minWidth: getInputMinWidth(isEdit && isSupply),
          Cell: (cellProp) => {
            const {
              row: {
                original: {
                  pack_unite_pre_quote,
                  purchase_unit,
                  pack_unite_protocol_price,
                  ratio,
                  isOld,
                },
                index,
              },
            } = cellProp
            return (
              <CellPrice
                index={index}
                value={pack_unite_pre_quote}
                valueKey='pack_unite_pre_quote'
                unit_name={purchase_unit}
                compareValue={pack_unite_protocol_price}
                ratio={ratio}
                ratioKey='std_unite_pre_quote'
                isEdit={isSupply}
                isOld={isOld}
              />
            )
          },
        },
        {
          Header: t('协议价（基本单位）'),
          id: 'std_unite_protocol_price',
          accessor: 'std_unite_protocol_price',
          isKeyboard: !isSupply,
          minWidth: getInputMinWidth(isEdit && !isSupply),
          Cell: (cellProp) => {
            const {
              row: {
                original: {
                  std_unite_protocol_price,
                  std_unit_name,
                  std_unite_pre_quote,
                  ratio,
                },
                index,
              },
            } = cellProp
            return (
              <CellPrice
                index={index}
                value={std_unite_protocol_price}
                valueKey='std_unite_protocol_price'
                unit_name={std_unit_name}
                compareValue={std_unite_pre_quote}
                ratio={ratio}
                ratioKey='pack_unite_protocol_price'
                isEdit={!isSupply}
              />
            )
          },
        },
        {
          Header: (
            <HeaderTip
              title={t('协议价（采购单位）')}
              tip={
                <div>
                  <div>
                    {t(
                      '指最终确定的价格，如首次未填写将默认使用供应商预报价，',
                    )}
                  </div>
                  <div>{t('后续可单独修改，作为规则价进行使用')}</div>
                </div>
              }
            />
          ),
          id: 'pack_unite_protocol_price',
          accessor: 'pack_unite_protocol_price',
          isKeyboard: !isSupply,
          minWidth: getInputMinWidth(isEdit && !isSupply),
          Cell: (cellProp) => {
            const {
              row: {
                original: {
                  pack_unite_protocol_price,
                  pack_unite_pre_quote,
                  ratio,
                  purchase_unit,
                },
                index,
              },
            } = cellProp
            return (
              <CellPrice
                index={index}
                value={pack_unite_protocol_price}
                valueKey='pack_unite_protocol_price'
                unit_name={purchase_unit}
                compareValue={pack_unite_pre_quote}
                ratio={ratio}
                ratioKey='std_unite_protocol_price'
                isEdit={!isSupply}
              />
            )
          },
        },
        {
          Header: t('描述'),
          id: 'description',
          accessor: 'description',
          isKeyboard: true,
          minWidth: 180,
          Cell: (cell) =>
            isEdit ? (
              <CellInput
                index={cell.row.index}
                value={cell.row.original.description}
                valueKey='description'
              />
            ) : (
              cell.row.original.description
            ),
        },
        {
          Header: t('产地'),
          id: 'product_place',
          accessor: 'product_place',
          isKeyboard: true,
          minWidth: 220,
          Cell: (cellProp) => {
            const {
              row: {
                original: { product_place },
                index,
              },
            } = cellProp
            return isEdit ? (
              <CellInput
                value={product_place}
                index={index}
                valueKey='product_place'
              />
            ) : (
              product_place
            )
          },
        },
      ].filter(Boolean),
    [isEdit, isSupply, getInputMinWidth],
  )

  return (
    <>
      <Header />
      <PositionList
        id='cycle_quote_rule_table'
        filterText={['sku_name']}
        modalTitle={t('批量导入商品')}
        totalTextLabel={t('商品总数')}
        isEdit={isEdit}
        columns={columns}
        data={sku_details.slice()}
        onAddRow={() => store.addSkuRow()}
        ModalChild={AddSkuRuleModal}
      />
    </>
  )
}

/**
 * 设置Detail组件的属性规则
 * isAdd: boolean 可选
 */
Detail.propTypes = {
  isAdd: PropTypes.bool,
}

export default observer(Detail)
