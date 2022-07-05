import { t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Form,
  FormButton,
  FormItem,
  Modal,
  Tip,
  Validator,
  Button,
} from '@gmfe/react'
import { TableX, selectTableXHOC } from '@gmfe/table-x'
import store from '../store'
import { observer } from 'mobx-react'
import ReturnSkusCell from './return_skus_cell'
import _ from 'lodash'

const SelectTableX = selectTableXHOC(TableX)

@observer
class ReturnSkusTable extends React.Component {
  state = {
    selected: [],
    showWarning: false,
    planIdInput: '',
  }

  columns = [
    { Header: t('商品名'), accessor: 'name' },
    { Header: t('物料批次'), accessor: 'batch_num' },
    { Header: t('领料数'), accessor: 'amount' },
    { Header: t('可退数量'), accessor: 'valuable_return' },
    {
      Header: t('退料数'),
      accessor: 'std_unit_name',
      Cell: ({
        row: {
          index,
          original: { _id },
        },
      }) => {
        const disabled = !this.state.selected.includes(_id)
        return <ReturnSkusCell index={index} disabled={disabled} />
      },
    },
  ]

  handleSelect = (selected) => {
    this.setState({
      selected,
      showWarning: !!selected.length,
    })
  }

  handleCancel = () => {
    ReturnSkusTable.hide()
  }

  handleConfirm = () => {
    const { selected } = this.state
    if (!selected.length) {
      Tip.warning(t('请选择退料商品'))
      return
    }
    const { returnSkus } = store
    returnSkus.forEach((item) => {
      item.error = false
    })
    const selectedData = returnSkus
      .slice()
      .filter((item) => selected.includes(item._id))
    if (selectedData.some((i) => _.isNil(i.new_amount))) {
      Tip.warning(t('退料数不能为空'))
      return
    }
    if (selectedData.some((i) => Number(i.new_amount) <= 0)) {
      Tip.warning(t('退料数必须大于0'))
      return
    }
    if (selectedData.some((i) => Number(i.new_amount) > i.valuable_return)) {
      Tip.warning(t('退料数必须小于可退数量'))
      return
    }
    const returnList = JSON.stringify(
      selectedData.map((i) => ({
        recv_id: i.id,
        amount: i.new_amount,
        batch_number: i.batch_num,
      })),
    )
    store
      .materialReturn({
        return_list: returnList,
      })
      .then(() => {
        Tip.success(t('退料成功'))
        store.clearPagination(1)
        store.getReturnMaterialList(store.filterReturnSearchData)
        ReturnSkusTable.hide()
      })
  }

  handleSearch = () => {
    const { planIdInput } = this.state
    store.checkProcessOrder(planIdInput)
  }

  render() {
    const { planIdInput, selected, showWarning } = this.state
    const { returnSkus } = store

    return (
      <div>
        <Form
          inline
          className='gm-margin-bottom-10'
          onSubmitValidated={this.handleSearch}
        >
          <FormItem
            validate={Validator.create(Validator.TYPE.required, planIdInput)}
            label={t('搜索')}
          >
            <input
              placeholder={t('输入计划单 ID')}
              className='form-control'
              value={planIdInput}
              onChange={({ target: { value } }) =>
                this.setState({ planIdInput: value })
              }
              autoFocus
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
          </FormButton>
        </Form>
        <SelectTableX
          data={returnSkus.slice()}
          tiled
          columns={this.columns}
          keyField='_id'
          selected={selected}
          onSelect={this.handleSelect}
        />
        {showWarning && (
          <Flex justifyCenter className='gm-margin-top-10 gm-text-red'>
            <i className='xfont ifont-warning' />
            <span className='gm-margin-left-5'>
              {t('退料记录无法删除，请确认退料数')}
            </span>
          </Flex>
        )}
        <Flex justifyCenter className='gm-margin-top-20'>
          <Button className='gm-margin-right-20' onClick={this.handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleConfirm}>
            {t('确定')}
          </Button>
        </Flex>
      </div>
    )
  }
}

ReturnSkusTable.hide = () => {
  store.returnSkus = []
  Modal.hide()
}

export default ReturnSkusTable
