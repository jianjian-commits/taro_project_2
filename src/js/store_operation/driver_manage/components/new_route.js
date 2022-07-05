import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Modal, Tip, Form, FormItem, Button } from '@gmfe/react'
import PropTypes from 'prop-types'

class NewRoute extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modalShow: false,
    }
  }

  handleNewRouteClick = () => {
    this.setState({
      modalShow: true,
    })
  }

  handleModalHide = () => {
    this.setState({
      modalShow: false,
    })
    this.routeNameInput.value = ''
  }

  handleAddRoute = () => {
    if (this.routeNameInput.value === '') {
      Tip.warning(i18next.t('线路名称不能为空'))
      return
    }
    this.props.onAddRoute(this.routeNameInput.value)
    this.setState({
      modalShow: false,
    })
    this.routeNameInput.value = ''
  }

  render() {
    return (
      <Flex>
        <Button type='primary' onClick={this.handleNewRouteClick}>
          {i18next.t('新建线路')}
        </Button>
        <Modal
          size='sm'
          title={i18next.t('新建线路')}
          show={this.state.modalShow}
          onHide={this.handleModalHide}
        >
          <Form
            onSubmit={this.handleAddRoute}
            labelWidth='65px'
            colWidth='280px'
          >
            <FormItem label={i18next.t('线路名称')}>
              <input
                type='text'
                placeholder={i18next.t('线路名称')}
                className='form-control'
                autoFocus
                ref={(rel) => {
                  this.routeNameInput = rel
                }}
              />
            </FormItem>
          </Form>
          <div className='text-right'>
            <Button onClick={this.handleModalHide}>{i18next.t('取消')}</Button>
            <div className='gm-gap-10' />
            <Button type='primary' onClick={this.handleAddRoute}>
              {i18next.t('确定')}
            </Button>
          </div>
        </Modal>
      </Flex>
    )
  }
}

NewRoute.propTypes = {
  onAddRoute: PropTypes.func,
}

export default NewRoute
