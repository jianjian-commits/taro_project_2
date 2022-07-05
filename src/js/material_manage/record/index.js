import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import InRecord from './in_record'
import OutRecord from './out_record'
import Permission from '../../common/components/permission'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 0,
    }
  }

  componentDidMount() {
    const { type } = this.props.history.location.query
    if (type && type === 'out') {
      this.setState({ type: 1 })
    }
  }

  render() {
    return (
      <FullTab
        tabs={[i18next.t('归还记录'), i18next.t('借出记录')]}
        active={this.state.type}
      >
        <Permission field='get_turnover_loan_sheet'>
          <InRecord />
        </Permission>
        <Permission field='get_turnover_return_sheet'>
          <OutRecord />
        </Permission>
      </FullTab>
    )
  }
}

export default Index
