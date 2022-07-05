import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SvgMinus, SvgSearch } from 'gm-svg'
import { Flex, DropSelect, BoxTable, Button } from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import { priceRuleTarget } from './filter'
import { convertNumber2Sid } from 'common/filter'
import TableTotalText from 'common/components/table_total_text'
import BoxTableS from 'common/components/box_table_s'
import _ from 'lodash'
import actions from '../../../actions'
import './actions'
import './reducer'
import { PRICE_RULE_TYPE } from 'common/enum'

class ObjectList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      search_input: '',
      dropSelectShow: false,
      activeIndex: null,
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   // 闪烁完之后清掉class
  //   if (prevState.activeIndex !== this.state.activeIndex) {
  //     setTimeout(() => {
  //       this.setState({ activeIndex: null })
  //     }, 1000)
  //   }
  // }

  handleSearchInputFocus = () => {
    this.setState({
      dropSelectShow: true,
    })
  }

  handleSearchInputChange = (e) => {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleSearchInputFocus()
    this.setState({
      search_input: e.target.value,
    })

    actions.debounceSearchObject(
      this.props.ruleDetail.salemenu_id,
      e.target.value
    )
  }

  handleDropSelectHide = () => {
    if (this.state.dropSelectShow) {
      this.setState({
        dropSelectShow: false,
      })
    }
  }

  handleSearchInputClear = () => {
    this.setState({
      dropSelectShow: false,
      search_input: '',
    })

    actions.price_rule_object_input_clear()
  }

  handleDropSelectEnter = (index) => {
    const obj = this.props.searchObjectData.list[index]
    const activeIndex = _.findIndex(
      this.props.ruleDetail.addresses,
      (s) => s.id === obj.id
    )

    actions.price_rule_object_add(obj)

    this.refInput.blur()

    this.setState({
      dropSelectShow: false,
      activeIndex: activeIndex > -1 ? activeIndex : 0,
    })
  }

  handleObjectAdd(obj) {
    actions.price_rule_object_add(obj)

    // 新添加的在第一行
    this.setState({
      dropSelectShow: false,
      activeIndex: 0,
    })
  }

  render() {
    const { activeIndex } = this.state
    const { ruleDetail } = this.props
    let actionDom
    const targetType = priceRuleTarget(PRICE_RULE_TYPE, ruleDetail.type) || {}

    const searchObjectData = Object.assign({}, this.props.searchObjectData, {
      columns: [
        {
          field: 'id',
          name: `${targetType.name}ID`,
          render: (id) => {
            if (targetType.id === 'customer') {
              return convertNumber2Sid(id)
            } else {
              return id
            }
          },
        },
        {
          field: 'resname',
          name: i18next.t('KEY128', {
            VAR1: targetType.name,
          }) /* src:`${targetType.name}名` => tpl:${VAR1}名 */,
        },
        {
          field: 'actions',
          name: i18next.t('操作'),
          render: (value, rowData) => {
            const { addresses } = ruleDetail
            const address = _.find(addresses, (s) => {
              return s.id === rowData.id
            })

            if (address) {
              return i18next.t('已添加')
            }

            return (
              <Button onClick={this.handleObjectAdd.bind(this, rowData)}>
                <i className='glyphicon glyphicon-ok' />
              </Button>
            )
          },
        },
      ],
    })

    if (ruleDetail.viewType === 'view') {
      actionDom = (
        <div>
          <Button onClick={this.props.onDownload}>{i18next.t('导出')}</Button>
        </div>
      )
    } else {
      actionDom = (
        <div className='clearfix'>
          <Button onClick={this.props.onUpload}>{i18next.t('导入')}</Button>
        </div>
      )
    }

    return (
      <BoxTableS
        info={
          <Flex alignCenter>
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商户数'),
                    content: ruleDetail.addresses.length,
                  },
                ]}
              />
            </BoxTable.Info>
          </Flex>
        }
        action={actionDom}
      >
        {ruleDetail.viewType !== 'view' && (
          <DropSelect
            show={this.state.dropSelectShow}
            data={searchObjectData}
            onEnter={this.handleDropSelectEnter}
            onHide={this.handleDropSelectHide}
          >
            <Flex alignCenter>
              <SvgSearch className='gm-text-16 gm-text-desc gm-margin-lr-10' />
              <input
                ref={(ref) => {
                  this.refInput = ref
                }}
                value={this.state.search_input}
                onChange={this.handleSearchInputChange}
                onFocus={this.handleSearchInputFocus}
                className='form-control'
                placeholder={
                  i18next.t('KEY130', {
                    VAR1: targetType.name,
                    VAR2: targetType.name,
                    VAR3: targetType.name,
                  }) /* src:`输入${targetType.name}ID或${targetType.name}名，快速添加${targetType.name}` => tpl:输入${VAR1}ID或${VAR2}名，快速添加${VAR3} */
                }
                type='search'
              />
            </Flex>
          </DropSelect>
        )}
        <Table
          data={ruleDetail.addresses}
          columns={[
            {
              Header: `${targetType.name}ID`,
              accessor: 'id',
              Cell: ({ original }) => {
                if (targetType.id === 'customer') {
                  return convertNumber2Sid(original.id)
                } else {
                  return original.id
                }
              },
            },
            {
              Header: i18next.t('KEY128', {
                VAR1: targetType.name,
              }) /* src:`${targetType.name}名` => tpl:${VAR1}名 */,
              accessor: 'name',
            },
            {
              Header: TableUtil.OperationHeader,
              width: 100,
              Cell: ({ index }) => {
                return (
                  <Flex justifyCenter>
                    {ruleDetail.viewType !== 'view' ? (
                      <Button
                        type='danger'
                        onClick={actions.price_rule_object_del.bind(
                          null,
                          index
                        )}
                        style={{
                          width: '22px',
                          height: '22px',
                          padding: 0,
                          borderRadius: '3px',
                        }}
                      >
                        <SvgMinus />
                      </Button>
                    ) : (
                      '-'
                    )}
                  </Flex>
                )
              },
            },
          ]}
        />
      </BoxTableS>
    )
  }
}

ObjectList.propTypes = {
  ruleDetail: PropTypes.object,
  searchObjectData: PropTypes.object,
  onDownload: PropTypes.func,
  onUpload: PropTypes.func,
}

export default connect((state) => ({
  ruleDetail: state.price_rule.ruleDetail,
  searchObjectData: state.price_rule.searchObjectData,
}))(ObjectList)
