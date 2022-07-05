import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { store } from './store'
import Header from './header'
import FinishList from './finish_list'
import LossList from './loss_list'

@observer
class Details extends Component {
  componentDidMount() {
    const { id } = this.props.location.query
    const { fetchPlanDetail } = store
    fetchPlanDetail(id)
  }

  render() {
    const { edit } = store
    return (
      <>
        <Header />
        {!edit && <FinishList />}
        <LossList />
      </>
    )
  }
}

export default Details
