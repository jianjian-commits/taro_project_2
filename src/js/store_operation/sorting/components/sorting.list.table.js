import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Sheet, SheetColumn, SheetAction } from '@gmfe/react'

class SortingListTable extends React.Component {
  handleClick(eList) {
    const listId = eList.listId
    const { handleClickDetail } = this.props
    handleClickDetail(listId)
  }

  render() {
    const { list, loading, enableEmptyTip } = this.props
    return (
      <Sheet list={list} loading={loading} enableEmptyTip={enableEmptyTip}>
        <SheetColumn
          field='listId'
          name={
            <div className='b-table-margin-left20'>{i18next.t('编号')}</div>
          }
        >
          {(listId) => {
            return <div className='b-table-margin-left20'>{listId}</div>
          }}
        </SheetColumn>
        <SheetColumn field='categoryName' name={i18next.t('一级分类')} />
        <SheetColumn field='work' name={i18next.t('需分拣商品数')} />
        <SheetAction>
          {(eList) => (
            <div>
              <a onClick={this.handleClick.bind(this, eList)}>
                <i className='xfont xfont-detail' />
              </a>
            </div>
          )}
        </SheetAction>
      </Sheet>
    )
  }
}

SortingListTable.propTypes = {
  list: PropTypes.array,
  loading: PropTypes.bool,
  enableEmptyTip: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

SortingListTable.defaultProps = {
  list: [],
  loading: false,
  enableEmptyTip: true,
}

export default SortingListTable
