import React from 'react'
import Form from './components/form'

class Component extends React.Component {
  render() {
    const { id } = this.props.location.query
    return <Form id={id} />
  }
}

export default Component
