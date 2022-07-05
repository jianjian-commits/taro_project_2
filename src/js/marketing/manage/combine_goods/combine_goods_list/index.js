import React from 'react'
import Filter from './components/search_filter'
import List from './components/commodity_list'

class CombineGoodsList extends React.Component {
  constructor(props) {
    super(props)
    this.pagination = React.createRef()
  }

  componentDidMount() {
    this.pagination.current.apiDoFirstRequest()
  }

  render() {
    return (
      <>
        <Filter pagination={this.pagination} />
        <List pagination={this.pagination} />
      </>
    )
  }
}

export default CombineGoodsList
