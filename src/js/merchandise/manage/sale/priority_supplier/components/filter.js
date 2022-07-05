import React from 'react'
import { i18next } from 'gm-i18n'
import {
  MoreSelect,
  Box,
  Form,
  FormItem,
  FormButton,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'

class Component extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      routers: [],
    }
  }

  componentDidMount() {
    Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        this.setState({
          routers: [
            { text: i18next.t('全部线路'), value: null },
            ..._.map(json.data, (item) => ({
              text: item.name,
              value: item.id,
            })),
            { text: i18next.t('无路线'), value: -1 },
          ],
        })
      })
  }

  handleRouteSelect = (key, selected) => {
    this.props.setFilter(key, selected)
  }

  handleFilterChange = (key, e) => {
    this.props.setFilter(key, e.target.value)
  }

  render() {
    const { routerSelected, q, onSubmit, placeholder, onExport } = this.props
    const { routers } = this.state
    return (
      <Box hasGap>
        <Form inline onSubmit={onSubmit}>
          <FormItem label={i18next.t('路线')} colWidth='320px'>
            <MoreSelect
              id='route'
              data={routers}
              selected={routerSelected}
              onSelect={this.handleRouteSelect.bind(this, 'routerSelected')}
              renderListFilterType='pinyin'
              placeholder={i18next.t('搜索')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')} colWidth='430px'>
            {/* todo 一般来说，改文案，搜索区域不做这种特殊处理 */}
            <input
              type='text'
              style={{ width: '382px' }}
              value={q}
              placeholder={placeholder}
              onChange={this.handleFilterChange.bind(this, 'q')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            {onExport && (
              <Button onClick={onExport}>{i18next.t('导出')}</Button>
            )}
          </FormButton>
        </Form>
      </Box>
    )
  }
}

Component.propTypes = {
  setFilter: PropTypes.func,
  onExport: PropTypes.func,
  routerSelected: PropTypes.any,
  q: PropTypes.string,
  onSubmit: PropTypes.func,
  placeholder: PropTypes.string,
}
export default Component
