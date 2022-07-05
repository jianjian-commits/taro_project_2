import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { LevelSelect, Flex, Button } from '@gmfe/react'
import { connect } from 'react-redux'

class BatchDefaultShelfModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      shelf_selected: [],
    }
  }

  handleChangeShelfSelected = (selected) => {
    this.setState({
      shelf_selected: selected,
    })
  }

  handleEnsure = () => {
    const { onEnsure } = this.props
    onEnsure(this.state.shelf_selected)
  }

  render() {
    const { supplier, onCancel } = this.props
    const {
      shelfList,
      tableSelected,
      purchaseSpecNum,
      isSelectAllPage,
    } = supplier
    const count = isSelectAllPage ? purchaseSpecNum : tableSelected.length // 若选择所有页，则显示全部采购规格数，否则显示已选择的数量

    return (
      <div className='gm-padding-lr-10'>
        <div>{t('default_shelf_merchandise_count', { count })}</div>
        <div className='gm-margin-top-10 gm-margin-bottom-10'>
          {t('如所选商品已分配默认货位，则选择后将重新分配')}
        </div>
        <LevelSelect
          style={{ width: '180px' }}
          data={shelfList}
          selected={this.state.shelf_selected}
          onSelect={this.handleChangeShelfSelected}
        />
        <Flex justifyEnd className='gm-margin-top-10'>
          <Button className='gm-margin-right-10' onClick={onCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={this.handleEnsure}>
            {t('确定')}
          </Button>
        </Flex>
      </div>
    )
  }
}

BatchDefaultShelfModal.propTypes = {
  onEnsure: PropTypes.func.isRequired,
  supplier: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
}

export default connect((state) => ({
  supplier: state.supplier,
}))(BatchDefaultShelfModal)
