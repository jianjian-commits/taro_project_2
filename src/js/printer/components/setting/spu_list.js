import { i18next } from 'gm-i18n'
import React from 'react'
import { DropSelect, Pagination, Flex, BoxTable, Button } from '@gmfe/react'
import { Observer, observer, inject } from 'mobx-react'
import { TableUtil, Table } from '@gmfe/table'
import ImportDialog from './import_dialog'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import _ from 'lodash'
import BoxTableS from 'common/components/box_table_s'
import TableTotalText from 'common/components/table_total_text'

@inject('settingStore')
@observer
class SpuList extends React.Component {
  constructor(props) {
    super(props)
    this.store = props.settingStore // eslint-disable-line
    this.state = {
      search_input: '',
      dropSelectShow: false,
      show: false,
    }
  }

  handlePage = (data) => {
    this.store.updatePagination(data)
  }

  handleSkuAdd = (spu) => {
    this.store.addSku(spu)

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

  handleDropSelectEnter = (index) => {
    const { searchSpuData } = this.store
    const obj = searchSpuData.list[index]

    this.store.addSku(obj)

    this.refInput.blur()
    this.setState({
      dropSelectShow: false,
    })
  }

  handleSearchInputChange = (e) => {
    const { dropSelectShow } = this.state
    if (!dropSelectShow) this.handleSearchInputFocus()

    this.setState({
      search_input: e.target.value,
    })

    this.store.debounceSearchData(e.target.value, 'searchSpuData')
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

    this.store.clearSearchData('searchSpuData')
  }

  handleDeleteSpu = (index) => {
    this.store.deleteSpu(index)
  }

  handleImport = () => {
    this.setState({ show: true })
  }

  handleExport = (e) => {
    e.preventDefault()
    const {
      detail: { spus },
    } = this.store
    const exportData = _.map(spus.slice(), (val) => ({
      [i18next.t('商品ID')]: val.spu_id,
      [i18next.t('商品名')]: val.spu_name,
      [i18next.t('所属分类')]: val.category,
    }))

    requireGmXlsx((res) => {
      const { jsonToSheet } = res
      jsonToSheet([exportData], { fileName: i18next.t('商品列表.xlsx') })
    })
  }

  handleImportData = (sheetData) => {
    const data = _.map(sheetData, (val) => {
      if (val[0]) {
        return {
          spu_id: val[0],
          spu_name: val[1],
          category: val[2],
        }
      }
    }).filter((_) => _)

    this.store.importSpu(data)

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
    const { viewType, detail, pagination } = this.store
    const { spus } = detail

    const editStatus = viewType === 'edit'
    const list = spus.slice(
      pagination.offset,
      pagination.offset + pagination.limit
    )

    const searchSpuData = Object.assign({}, this.store.searchSpuData, {
      columns: [
        {
          field: 'spu_id',
          name: i18next.t('商品ID'),
        },
        {
          field: 'spu_name',
          name: i18next.t('商品名'),
        },
        {
          field: 'category',
          name: i18next.t('所属分类'),
        },
        {
          field: 'actions',
          name: i18next.t('操作'),
          render: (value, rowData) => {
            const spu = _.find(spus, (s) => {
              return s.spu_id === rowData.spu_id
            })

            if (spu) {
              return i18next.t('已添加')
            }

            return (
              <Button onClick={this.handleSkuAdd.bind(this, rowData)}>
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
                    label: i18next.t('商品数'),
                    content: spus.length,
                  },
                ]}
              />
            </BoxTable.Info>
          </Flex>
        }
        action={rightSide}
      >
        {viewType === 'edit' ? (
          <DropSelect
            show={this.state.dropSelectShow}
            data={searchSpuData}
            onHide={this.handleDropSelectHide}
            onEnter={this.handleDropSelectEnter}
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
                placeholder={i18next.t('输入商品ID或商品名，快速添加商品')}
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
                  <i className='xfont xfont-remove' />
                </button>
              </span>
            </div>
          </DropSelect>
        ) : null}

        <Table
          data={list.slice()}
          columns={[
            { Header: i18next.t('商品ID'), accessor: 'spu_id' },
            { Header: i18next.t('商品名'), accessor: 'spu_name' },
            { Header: i18next.t('所属分类'), accessor: 'category' },
            {
              Header: TableUtil.OperationHeader,
              Cell: ({ index }) => (
                <TableUtil.OperationCell>
                  <Observer>
                    {() =>
                      editStatus ? (
                        <TableUtil.OperationDelete
                          onClick={this.handleDeleteSpu.bind(this, index)}
                        />
                      ) : (
                        '-'
                      )
                    }
                  </Observer>
                </TableUtil.OperationCell>
              ),
            },
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination data={pagination} toPage={this.handlePage} />
        </Flex>
        <ImportDialog
          show={show}
          downloadTempName='station_label_spu_add.xlsx'
          title={i18next.t('商品批量导入')}
          handleImportData={this.handleImportData}
          handleCancel={this.handleCancel}
        />
      </BoxTableS>
    )
  }
}

export default SpuList
