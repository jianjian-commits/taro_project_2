import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Modal, Tip } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableV2HOC, Table, TableUtil } from '@gmfe/table'
import ImportModal from './import_modal'
import { observer } from 'mobx-react'
import { getColumns } from '../util'
import TableTotalText from '../../../../../common/components/table_total_text'

import store from '../store'
import PropType from "prop-types";
const SelectTable = selectTableV2HOC(Table)

@observer
class SpuSheet extends React.Component {
  componentDidMount() {
    store.setDoFirstRequest(this.pagination.doFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  getTemplateSpuList = (pagination) => {
    return store.fetchSpuList(pagination)
  }

  renderImportSpuModal = () => {
    const {
      spuList: { selectAll, selected },
    } = store

    if (!selectAll && !selected.length) {
      Tip.info(i18next.t('没有选择商品'))
      return
    }

    Modal.render({
      size: 'lg',
      children: <ImportModal retail={this.props.retail} />,
      title: i18next.t('导入至本地商品分类'),
      onHide: Modal.hide,
    })
  }

  render() {
    const {
      spuList: { pagination, list, selected, isSelectAllPage },
      loading,
    } = store
    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('云商品列表'),
                  content: pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          id='pagination_in_merchandise_cloud_goods_spu_sheet'
          onRequest={this.getTemplateSpuList}
          ref={(ref) => {
            this.pagination = ref
          }}
        >
          <SelectTable
            ref={(ref) => (this.table = ref)}
            loading={loading}
            data={list.slice()}
            columns={getColumns()}
            keyField='id'
            batchActionBar={
              selected.length ? (
                <TableUtil.BatchActionBar
                  onClose={() => store.toggleSelectAll(false)}
                  toggleSelectAll={(bool) => store.toggleIsSelectAllPage(bool)}
                  batchActions={[
                    {
                      dataId: 'cloudGoodsImport',
                      name: i18next.t('导入商品'),
                      onClick: this.renderImportSpuModal,
                      type: 'business',
                    },
                  ]}
                  count={isSelectAllPage ? pagination.count : selected.length}
                  isSelectAll={isSelectAllPage}
                />
              ) : null
            }
            onSelectAll={(isSelectedAll) =>
              store.toggleSelectAll(isSelectedAll)
            }
            selected={selected.slice()}
            onSelect={(selected) => store.select(selected)}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

SpuSheet.propTypes = {
  retail: PropType.bool
}

export default SpuSheet
