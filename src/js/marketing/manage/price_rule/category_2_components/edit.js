import React from 'react'
import { i18next, t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { SvgMinus } from 'gm-svg'
import SelectInputEdit from '../components/select_input_edit'
import { Flex, BoxTable, Pagination, Price, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { observer } from 'mobx-react'
import EditDropSearch from './edit_drop_search'
import { RULE_TYPE } from 'common/enum'
import editStore from './edit_store'
import Info from '../components/info'
import openDialog from './edit_upload_dialog'
import RuleObjectTypeSwitchBtn from '../components/rule_object_type_switch_btn'
import TableTotalText from 'common/components/table_total_text'
import BoxTableS from 'common/components/box_table_s'
import Big from 'big.js'

const ruleOptions = RULE_TYPE.slice(1)

const PanelRight = (props) => {
  return (
    <div>
      <Button onClick={props.handleUpload}>{i18next.t('导入')}</Button>
      {props.viewType === 'add' && (
        <>
          <div className='gm-gap-10' />
          <RuleObjectTypeSwitchBtn curType={2} />
        </>
      )}
    </div>
  )
}

PanelRight.propTypes = {
  handleUpload: PropTypes.func,
  viewType: PropTypes.string,
}

@observer
class Edit extends React.Component {
  componentDidMount() {
    editStore.init(this.props)
  }

  componentWillUnmount() {
    editStore.reset()
  }

  handleUpload = () => {
    openDialog()
  }

  handleToPage = (pageObj) => {
    editStore.JumpPage(pageObj)
  }

  handleItemYxPriceChange(item, yx_price) {
    editStore.setResultItem(item, { yx_price })
  }

  handleItemRuleTypeChange(item, rule_type) {
    editStore.setResultItem(item, { rule_type })
    // 由于乘的时候是4位小数，固定和加都只是两位小数，所以切换计算规则类型时，yx_price都统一为两位小数
    editStore.setResultItem(item, { yx_price: Big(item.yx_price).toFixed(2) })
  }

  render() {
    const { resultList, pagination, salemenuInfo } = editStore
    const { offset, limit, count } = pagination
    const list = resultList.slice(offset, offset + limit)

    return (
      <BoxTableS
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('分类数'),
                  content: count,
                },
              ]}
            />
          </BoxTable.Info>
        }
        action={
          <PanelRight
            viewType={this.props.viewType}
            handleUpload={this.handleUpload}
          />
        }
      >
        <EditDropSearch />
        <Table
          data={list}
          columns={[
            {
              Header: t('分类名/分类ID'),
              accessor: 'id',
              Cell: ({ original }) => (
                <div>
                  <div>
                    {original.category_1_name}/{original.category_2_name}
                  </div>
                  <div className='gm-text-desc'>{original.category_2_id}</div>
                </div>
              ),
            },
            {
              Header: (
                <span>
                  {i18next.t('计算规则')}
                  <Info />
                </span>
              ),
              accessor: 'rule',
              Cell: ({ original }) => (
                <SelectInputEdit
                  id={Number(original.category_2_id)}
                  options={ruleOptions}
                  selected={original.rule_type}
                  inputValue={original.yx_price}
                  onInputChange={this.handleItemYxPriceChange.bind(
                    this,
                    original
                  )}
                  onSelect={this.handleItemRuleTypeChange.bind(this, original)}
                  suffixText={Price.getUnit(salemenuInfo.feeType)}
                />
              ),
            },
            {
              Header: TableUtil.OperationHeader,
              width: 100,
              Cell: ({ original }) => (
                <Flex justifyCenter>
                  <Button
                    type='danger'
                    onClick={() =>
                      editStore.resultListRemoveItem(original.category_2_id)
                    }
                    style={{
                      width: '22px',
                      height: '22px',
                      padding: 0,
                      borderRadius: '3px',
                    }}
                  >
                    <SvgMinus />
                  </Button>
                </Flex>
              ),
            },
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination toPage={this.handleToPage} data={pagination} />
        </Flex>
      </BoxTableS>
    )
  }
}

Edit.propTypes = {
  viewType: PropTypes.string,
}

// viewType: [copy, add, edit] 的时候显示
export default Edit
