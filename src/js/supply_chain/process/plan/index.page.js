import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import TaskOverView from './task_overview'
import PlanList from './plan_list'

class ProcessPlan extends React.Component {
  constructor() {
    super()
    this.state = {
      active: 0,
    }
  }

  componentDidMount() {
    const { active } = this.props.location.query
    active && this.handleChange(active)
  }

  handleChange = (active) => {
    this.setState({ active })
  }

  render() {
    const { active } = this.state
    return (
      <FullTab
        tabs={[i18next.t('任务总览'), i18next.t('计划明细')]}
        active={+active}
        onChange={this.handleChange}
        className='b-plan'
      >
        <TaskOverView />
        <PlanList />
      </FullTab>
    )
  }
}

export default ProcessPlan
