import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gmfe/table-x'
import SvgDownload from 'svg/download.svg'

const { OperationIconTip } = TableXUtil

class ExportCell extends Component {
  static propTypes = {
    onClick: PropTypes.func,
  }

  handleClick = () => {
    const { onClick } = this.props
    onClick && onClick()
  }

  render() {
    return (
      <OperationIconTip tip={t('导出')}>
        <span
          className='gm-text-16 gm-cursor gm-text-hover-primary'
          onClick={this.handleClick}
        >
          <SvgDownload />
        </span>
      </OperationIconTip>
    )
  }
}

export default ExportCell
