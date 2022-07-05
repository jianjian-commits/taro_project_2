import React, { Component } from 'react'
import { store } from './store'
import { observer, Observer } from 'mobx-react'
import { BoxPanel, InputNumberV2 } from '@gmfe/react'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import { isNumber } from 'common/util'
import { remarkType } from 'common/filter'
import Big from 'big.js'
import { renderPercentageHeader } from '../../util'
import _ from 'lodash'
import { handleValidator } from '../utils'
import ValidateCom from 'common/components/validate_com'

@observer
class LossList extends Component {
  componentDidMount() {
    store.initAutoRun()
  }

  componentWillUnmount() {
    store.clear()
  }

  handleChangeInput = (value, index, key) => {
    const { mergeAttritions, details, setDisabled } = store
    const { attritions } = details
    mergeAttritions(value, index, key)
    setDisabled(!handleValidator(attritions))
  }

  render() {
    const { edit, details } = store
    const { attritions } = details

    const columns = [
      {
        Header: t('物料名'),
        accessor: 'ingredient_name',
      },
      {
        Header: t('商品类型'),
        accessor: 'type',
        Cell: ({ row: { original } }) => (
          <span>{remarkType(original.type)}</span>
        ),
      },
      {
        Header: t('工艺名'),
        accessor: 'technic_flow_name',
      },
      {
        Header: t('领料数量'),
        show: !edit,
        accessor: 'recv_amount',
        Cell: ({ row: { original } }) => {
          const { ingredient_std_unit_name, recv_amount } = original
          const num = isNumber(recv_amount)
            ? Big(recv_amount).toFixed(2) + ingredient_std_unit_name
            : '-'
          return <span>{num}</span>
        },
      },
      {
        Header: t('产出数量'),
        show: !edit,
        accessor: 'output_amount',
        Cell: ({ row: { original } }) => {
          const { ingredient_std_unit_name, output_amount } = original
          const num = isNumber(output_amount)
            ? Big(output_amount).toFixed(2) + ingredient_std_unit_name
            : '-'
          return <span>{num}</span>
        },
      },
      {
        Header: t('损耗数量'),
        show: !edit,
        id: 'loss_amount',
        Cell: ({ row: { original } }) => {
          const {
            recv_amount,
            output_amount,
            ingredient_std_unit_name,
          } = original
          const num =
            isNumber(recv_amount) && isNumber(output_amount)
              ? Big(recv_amount).minus(output_amount).toFixed(2) +
                ingredient_std_unit_name
              : '-'
          return <span>{num}</span>
        },
      },
      {
        Header: renderPercentageHeader(-1),
        show: !edit,
        id: '出成率',
        Cell: ({ row: { original } }) => {
          const { recv_amount, output_amount } = original
          const percentage =
            isNumber(output_amount) &&
            isNumber(recv_amount) &&
            _.toNumber(recv_amount) !== 0
              ? Big(output_amount).div(recv_amount).times(100).toFixed(2) + '%'
              : '-'
          return <span>{percentage}</span>
        },
      },
      {
        Header: t('领料数量'),
        accessor: 'recv_amount',
        show: edit,
        Cell: ({ row: { original, index } }) => {
          return (
            <Observer>
              {() => {
                const { recv_amount, zeroError } = original
                return original.task_id !== null ? (
                  <ValidateCom
                    warningText={t('领料数不能为0')}
                    isInvalid={zeroError}
                  >
                    <InputNumberV2
                      precision={2}
                      min={0}
                      max={10000000}
                      className='form-control'
                      value={recv_amount === '-' ? '' : recv_amount}
                      onChange={(value) =>
                        this.handleChangeInput(value, index, 'recv_amount')
                      }
                    />
                  </ValidateCom>
                ) : (
                  <span>-</span>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('产出数量'),
        accessor: 'output_amount',
        show: edit,
        Cell: ({ row: { original, index } }) => {
          return (
            <Observer>
              {() => {
                const { output_amount } = original
                return original.task_id !== null ? (
                  <InputNumberV2
                    className='form-control'
                    precision={2}
                    min={0}
                    max={10000000}
                    value={output_amount === '-' ? '' : output_amount}
                    onChange={(value) =>
                      this.handleChangeInput(value, index, 'output_amount')
                    }
                  />
                ) : (
                  <span>-</span>
                )
              }}
            </Observer>
          )
        },
      },
    ]
    return (
      <BoxPanel title={t('损耗明细')} collapse>
        <TableX data={attritions.slice()} columns={columns} />
      </BoxPanel>
    )
  }
}

export default LossList
