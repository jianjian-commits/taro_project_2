import { i18next } from 'gm-i18n'
import React from 'react'
import { Observer, observer, inject } from 'mobx-react'
import { DropSelect, Flex, BoxTable, Button, ColorPicker } from '@gmfe/react'
import { TableUtil, Table } from '@gmfe/table'
import ImportDialog from './import_dialog'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { SvgRemove } from 'gm-svg'
import _ from 'lodash'
import styled from 'styled-components'
import BoxTableS from 'common/components/box_table_s'
import TableTotalText from 'common/components/table_total_text'
import MarkSvg from '../../../../svg/mark.svg'
import { convertNumber2Sid } from 'common/filter'

@inject('settingStore')
@observer
class MerchantList extends React.Component {
  constructor(props) {
    super(props)
    this.store = props.settingStore // eslint-disable-line
    this.state = {
      search_input: '',
      dropSelectShow: false,
      show: false,
    }
  }

  handleAddressAdd = (obj) => {
    this.store.addAddress(obj)

    this.setState({
      dropSelectShow: false,
    })
  }

  handleDropSelectEnter = (index) => {
    const { searchAddressData } = this.store
    const obj = searchAddressData.list[index]

    this.store.addAddress(obj)

    this.refInput.blur()
    this.setState({
      dropSelectShow: false,
    })
  }

  handleDropSelectHide = () => {
    if (this.state.dropSelectShow) {
      this.setState({
        dropSelectShow: false,
      })
    }
  }

  handleSearchInputChange = (e) => {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleSearchInputFocus()
    this.setState({
      search_input: e.target.value,
    })
    this.store.debounceSearchData(e.target.value, 'searchAddressData')
  }

  handleSearchInputFocus = () => {
    this.setState({
      dropSelectShow: true,
    })
  }

  handleSearchInputClear = () => {
    this.setState({
      dropSelectShow: false,
      search_input: '',
    })

    this.store.clearSearchData('searchAddressData')
  }

  handleDeleteAddress = (index) => {
    this.store.deleteAddress(index)
  }

  handleSetAddressColor = (index, color) => {
    this.store.setAddressColor(index, color)
  }

  handleImport = () => {
    this.setState({ show: true })
  }

  handleExport = (e) => {
    e.preventDefault()
    const {
      detail: { addresses },
    } = this.store
    const exportData = _.map(addresses.slice(), (val) => ({
      [i18next.t('商户ID')]: val.address_id,
      [i18next.t('商户名')]: val.address_name,
    }))

    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet([exportData], { fileName: i18next.t('商户列表.xlsx') })
    })
  }

  handleImportData = (sheetData) => {
    const data = _.map(sheetData, (val) => {
      if (val[0]) {
        return {
          address_id: val[0],
          address_name: val[1],
        }
      }
    }).filter((_) => _)
    this.store.importAddress(data)

    this.setState({
      dropSelectShow: false,
      show: false,
    })
  }

  handleCancel = () => {
    this.setState({ show: false })
  }

  render() {
    const { show } = this.state
    const { viewType, detail } = this.store
    const { addresses } = detail

    const editStatus = viewType === 'edit'

    const searchAddressData = Object.assign({}, this.store.searchAddressData, {
      columns: [
        {
          field: 'address_id',
          name: i18next.t('商户ID'),
        },
        {
          field: 'address_name',
          name: i18next.t('商户名'),
        },
        {
          field: 'actions',
          name: i18next.t('操作'),
          render: (value, rowData) => {
            const address = _.find(addresses, (s) => {
              return s.address_id === rowData.address_id
            })

            if (address) {
              return i18next.t('已添加')
            }

            return (
              <Button onClick={this.handleAddressAdd.bind(this, rowData)}>
                <i className='xfont xfont-ok' />
              </Button>
            )
          },
        },
      ],
    })
    const rightSide = editStatus ? (
      <Button type='primary' plain onClick={this.handleImport}>
        {i18next.t('导入')}
      </Button>
    ) : (
      <Button onClick={this.handleExport}>{i18next.t('导出')}</Button>
    )

    return (
      <BoxTableS
        info={
          <Flex alignCenter>
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商户数'),
                    content: addresses.length,
                  },
                ]}
              />
            </BoxTable.Info>
          </Flex>
        }
        action={rightSide}
      >
        {editStatus ? (
          <DropSelect
            show={this.state.dropSelectShow}
            data={searchAddressData}
            onEnter={this.handleDropSelectEnter}
            onHide={this.handleDropSelectHide}
          >
            <div className='input-prepend input-group'>
              <span className='input-group-addon'>
                <i className='xfont xfont-search' />
              </span>
              <input
                ref={(ref) => {
                  this.refInput = ref
                }}
                value={this.state.search_input}
                onChange={this.handleSearchInputChange}
                onFocus={this.handleSearchInputFocus}
                className='form-control'
                placeholder={i18next.t('输入商户ID或商户名，快速添加商户')}
                type='search'
              />
              <span className='input-group-btn'>
                <button
                  onClick={this.handleSearchInputClear}
                  className='btn'
                  style={{
                    border: '1px solid #ddd',
                    borderLeft: '0',
                    borderRight: '0',
                  }}
                >
                  <SvgRemove />
                </button>
              </span>
            </div>
          </DropSelect>
        ) : null}

        <Table
          data={addresses.slice()}
          columns={[
            {
              Header: i18next.t('商户ID'),
              accessor: 'address_id',
              Cell: ({ original }) =>
                `${convertNumber2Sid(original.address_id)}`,
            },
            { Header: i18next.t('商户名'), accessor: 'address_name' },
            {
              Header: TableUtil.OperationHeader,
              Cell: ({ original, index }) => {
                const ColorPoint = styled.div`
                  background-color: ${original.color_code};
                `
                return (
                  <Observer>
                    {() =>
                      editStatus ? (
                        <TableUtil.OperationCell>
                          <Flex justifyCenter alignCetner>
                            <ColorPicker
                              color={original.color_code}
                              onChange={(color) =>
                                this.handleSetAddressColor(index, color)
                              }
                            >
                              <Flex
                                alignCenter
                                className='gm-cursor gm-padding-5'
                              >
                                <ColorPoint className='gm-color-picker-color-point' />
                                <MarkSvg className='gm-text-14' />
                              </Flex>
                            </ColorPicker>
                            <TableUtil.OperationDelete
                              onClick={this.handleDeleteAddress.bind(
                                this,
                                index,
                              )}
                            />
                          </Flex>
                        </TableUtil.OperationCell>
                      ) : (
                        '-'
                      )
                    }
                  </Observer>
                )
              },
            },
          ]}
        />

        <ImportDialog
          show={show}
          downloadTempName='station_address_add.xlsx'
          title={i18next.t('商户批量导入')}
          handleImportData={this.handleImportData}
          handleCancel={this.handleCancel}
        />
      </BoxTableS>
    )
  }
}

export default MerchantList
