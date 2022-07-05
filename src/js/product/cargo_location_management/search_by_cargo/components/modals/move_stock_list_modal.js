import React, { Component } from 'react'
import {
  Flex,
  Button,
  RightSideModal,
  Tip,
  LevelSelect,
  Popover,
  InputNumberV2,
} from '@gmfe/react'
import { SvgDelete, SvgFun, SvgWarningCircle } from 'gm-svg'
import { Table } from '@gmfe/table'
import { t } from 'gm-i18n'
import { store } from '../../../store'
import {
  handleOkCheckCascade,
  rebuildArray,
  resetSpuListToMoveNum,
  rollOutMenu,
} from '../../../utils'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import SupplierDel from 'common/components/supplier_del_sign'

@observer
class MoveStockListModal extends Component {
  cargoLocationMenu = rebuildArray(store.cargoLocationMenu)

  tileMenu = [] // 将级联货位平铺成list

  columns = [
    {
      Header: t('商品ID'),
      accessor: 'spu_id',
    },
    { Header: t('商品名'), accessor: 'spu_name' },
    {
      Header: t('移出货位'),
      accessor: 'shelf_name',
      Cell: ({ value: shelf_name }) => shelf_name || t('未分配'),
    },
    { Header: t('移出批次号'), accessor: 'batch_number' },
    {
      Header: t('供应商'),
      accessor: 'supplier_name',
      width: '120',
      Cell: (cellProps) => {
        const { supplier_name, supplier_status } = cellProps.original

        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {supplier_name}
          </Flex>
        )
      },
    },
    {
      Header: t('移入货位'),
      accessor: 'in_shelf_id',
      Cell: ({ original }) => {
        const { in_shelf_id, errors } = original
        return (
          <Flex alignCenter>
            <LevelSelect
              selected={in_shelf_id.slice()}
              right
              data={this.cargoLocationMenu.slice()}
              onSelect={(event) =>
                this.changeValue(original, event, 'in_shelf_id')
              }
            />
            <div className='gm-gap-5' />
            {errors && errors.length && (
              <Popover
                showArrow
                type='hover'
                right
                popup={
                  <div className='gm-margin-lr-15 gm-margin-tb-10'>
                    {_.map(errors, (error, index) => (
                      <p key={index} style={{ color: 'red' }}>
                        {index + 1}.{error}
                      </p>
                    ))}
                  </div>
                }
              >
                <span style={{ color: 'red' }}>
                  <SvgWarningCircle />
                </span>
              </Popover>
            )}
          </Flex>
        )
      },
      width: 260,
    },
    {
      Header: t('剩余库存（基本单位）'),
      accessor: 'remain',
      Cell: ({ original: { remain, std_unit_name } }) => (
        <>
          {remain}
          {std_unit_name}
        </>
      ),
    },
    {
      Header: t('移库数'),
      accessor: 'out_amount',
      Cell: ({ original }) => (
        <InputNumberV2
          value={original.out_amount}
          className='form-control'
          min={0}
          onChange={(value) => this.changeValue(original, value, 'out_amount')}
        />
      ),
    },
    {
      Header: <SvgFun style={{ color: 'green' }} />,
      accessor: 'operation',
      Cell: ({ index, original }) => (
        <span
          style={{ fontSize: '16px', cursor: 'pointer' }}
          onClick={() => this.deleteItem(original, index)}
        >
          <SvgDelete />
        </span>
      ),
    },
  ]

  constructor(props) {
    super(props)
    this.handleCancel = ::this.handleCancel
    this.cargoLocationMenu.shift()
  }

  componentDidMount() {
    rollOutMenu(store.cargoLocationMenu.slice(), this.tileMenu) // 平铺货位级联货位
  }

  changeValue(item, value, key) {
    item[key] = value
    store.setToMoveList(store.toMoveList)
  }

  deleteItem(value, index) {
    const { toMoveList } = store
    const newToMoveList = toMoveList.slice()
    newToMoveList.splice(index, 1)
    resetSpuListToMoveNum(value)
    store.setToMoveList(newToMoveList)
    store.setSpuList(store.spuList)
  }

  handleContinue() {
    RightSideModal.hide()
  }

  handleCancel() {
    this.handleContinue()
    const { toMoveList } = store
    _.forEach(toMoveList, (item) => {
      resetSpuListToMoveNum(item) // 清空spuList的带移库数量
    })
    store.setToMoveList([])
    store.setIsMoving(false)
  }

  handleOk() {
    const { toMoveList } = store
    if (
      _.some(
        toMoveList,
        (item) => !(item.in_shelf_id && item.in_shelf_id.length),
      )
    ) {
      Tip.warning('请选择移入货位！')
      return
    }
    if (_.some(toMoveList, (item) => !_.trim(item.out_amount))) {
      Tip.warning('请选择输入移库数！')
      return
    }
    if (_.some(toMoveList, (item) => item.out_amount > item.remain)) {
      Tip.warning('请输入少于剩余库存的移库数！')
      return
    }
    if (handleOkCheckCascade(toMoveList.slice())) {
      Tip.warning('移入货位不能与移出货位一致')
      return
    }
    const details = JSON.stringify(
      _.map(toMoveList.slice(), (item) => {
        return {
          ...item,
          spu_id: item.spu_id,
          out_batch_num: item.batch_number,
          in_shelf_id: item.in_shelf_id[item.in_shelf_id.length - 1],
          out_amount: item.out_amount,
        }
      }),
    )
    return new Promise((resolve) => {
      Request('/stock/inner_transfer_sheet/create')
        .data({ details, status: 4, view_shelf: 1 })
        .post()
        .then(({ data: { batch_errors } }) => {
          if (batch_errors) {
            // 如果返回的是错误结果
            throw batch_errors
          }
          Tip.success('移库成功！')
          this.handleCancel()
        })
        .catch((error) => {
          store.getCargoLocationMenu() // 返回的错误结果重新装填进表格
          this.tileMenu = []
          rollOutMenu(store.cargoLocationMenu.slice(), this.tileMenu)
          _.forEach(toMoveList, (item) => {
            item.errorsTypes = error[item.batch_number].type
            item.errors = error[item.batch_number].type.map((val) => {
              let string
              switch (val) {
                case 1:
                  string = t('移出批次不存在')
                  break
                case 2:
                  string = t('移入货位被删除')
                  break
                case 3:
                  string = t('移库数大于剩余库存')
                  break
              }
              return string
            })
            if (_.includes(item.errorsTypes, 2)) {
              item.in_shelf_id = []
            }
          })
          store.setToMoveList(toMoveList)
        })
        .finally(() => resolve())
    })
  }

  render() {
    const { toMoveList } = store
    return (
      <Flex column className='modal-container'>
        <Flex flex={1} style={{ overflowY: 'auto' }}>
          <div className='width-100-percent'>
            <Table data={toMoveList.slice()} columns={this.columns} />
          </div>
        </Flex>
        <Flex justifyCenter className='modal-foot gm-padding-top-10'>
          <Button onClick={this.handleCancel}>{t('放弃移库')}</Button>
          <Button type='primary' onClick={this.handleContinue}>
            {t('继续添加')}
          </Button>
          <Button type='primary' onClick={this.handleOk.bind(this)}>
            {t('确认移库')}
          </Button>
        </Flex>
      </Flex>
    )
  }
}

export default MoveStockListModal
