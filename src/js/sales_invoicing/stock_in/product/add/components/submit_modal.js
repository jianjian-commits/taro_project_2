import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { Flex, Button, IconDownUp, Progress } from '@gmfe/react'
import { t } from 'gm-i18n'
import { selectTableXHOC, TableX } from '@gmfe/table-x'
import Big from 'big.js'
import PropTypes from 'prop-types'

const SelectTableX = selectTableXHOC(TableX)

const SubmitModal = (props, ref) => {
  const { dataSource, onFinish, onHide } = props
  const [fold, setFold] = useState(true)
  const [dataList, setDataList] = useState([])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    setDataList(dataSource)
    setSelected(dataSource.map((item) => item.proc_order_custom_id))
  }, [dataSource])

  useImperativeHandle(ref, () => ({
    selected,
  }))

  const handleFinished = () => {
    onFinish(selected)
    onHide()
  }

  const columns = [
    {
      Header: t('计划编号'),
      accessor: 'proc_order_custom_id',
      width: 200,
    },
    {
      Header: t('生产成品'),
      accessor: 'sku_name',
      width: 150,
    },
    {
      Header: t('已完成/计划'),
      accessor: 'plan_amount',
      width: 300,
      Cell: (cellProps) => {
        const {
          row: {
            original: { finish_amount, plan_amount, sale_unit_name },
          },
        } = cellProps
        const percentage = (Number(finish_amount) / Number(plan_amount)) * 100

        return (
          <>
            <Progress
              percentage={percentage > 100 ? 100 : percentage}
              status='success'
              showText={false}
              style={{ width: '200px' }}
            />
            <Flex>
              {`${Big(finish_amount || 0)}${sale_unit_name}/${Big(
                plan_amount || 0,
              )}${sale_unit_name}`}
            </Flex>
          </>
        )
      },
    },
  ]

  return (
    <>
      <Flex alignCenter justifyCenter className='b-psmd-finish-dialog-tip'>
        <div>
          <i className='ifont ifont-success' />
          <span>{t('入库单据已提交！')}</span>
        </div>
      </Flex>
      <div>
        {t('确认以下计划已完成: ')}
        {dataSource.length}
      </div>

      {!fold && (
        <SelectTableX
          keyField='proc_order_custom_id'
          data={dataList}
          columns={columns}
          selected={selected}
          onSelect={(selected) => setSelected(selected)}
        />
      )}

      <Flex alignCenter justifyCenter>
        <a onClick={() => setFold(!fold)}>
          {fold ? t('展开任务详情') : t('收起详情')}
          <IconDownUp active={!fold} />
        </a>
      </Flex>
      <Flex justifyEnd>
        <Button type='primary' onClick={() => handleFinished()}>
          {t('完成')}
        </Button>
      </Flex>
    </>
  )
}

SubmitModal.propTypes = {
  dataSource: PropTypes.array.isRequired,
  onFinish: PropTypes.func,
  onHide: PropTypes.func,
}

export default forwardRef(SubmitModal)
