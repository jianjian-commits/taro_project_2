import { i18next } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormButton, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import smartMenusStore from './store'

@observer
class SmartMenuFilter extends React.Component {
  handleChange = (e) => {
    smartMenusStore.changeSearchText(e.target.value)
  }

  render() {
    const { listSearch_text } = smartMenusStore
    const { onSearch } = this.props

    return (
      <Box hasGap>
        <Form inline onSubmit={onSearch}>
          <FormItem label={i18next.t('搜索')}>
            <input
              type='text'
              placeholder={i18next.t('输入菜单名称')}
              value={listSearch_text}
              onChange={this.handleChange}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

SmartMenuFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
}

export default SmartMenuFilter
