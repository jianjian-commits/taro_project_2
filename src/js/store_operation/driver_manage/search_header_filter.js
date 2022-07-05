import { t } from 'gm-i18n'
import React from 'react'
import { Box, Form, FormItem, FormButton, Button } from '@gmfe/react'
import './actions.js'
import './reducer.js'
import PropTypes from 'prop-types'

const SearchHeaderFilter = (props) => {
  const {
    onChange,
    onSearch,
    onExport,
    searchText,
    placeholder,
    disabledExport,
    onImport,
  } = props

  return (
    <Box hasGap>
      <Form inline onSubmit={onSearch}>
        <FormItem label={t('搜索')}>
          <input
            name='orderInput'
            value={searchText}
            onChange={onChange}
            placeholder={placeholder}
          />
        </FormItem>
        <FormButton>
          <Button
            type='primary'
            className='gm-margin-right-5'
            htmlType='submit'
          >
            {t('搜索')}
          </Button>
          {!disabledExport && (
            <>
              <Button onClick={onExport} className='gm-margin-right-5'>
                {t('导出')}
              </Button>
              {/* TODO:线路导入 */}
              {/* <Button onClick={onImport} type='primary'>
                {t('导入')}
              </Button> */}
            </>
          )}
        </FormButton>
      </Form>
    </Box>
  )
}

SearchHeaderFilter.propTypes = {
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onExport: PropTypes.func,
  onImport: PropTypes.func,
  searchText: PropTypes.string,
  placeholder: PropTypes.string,
  disabledExport: PropTypes.bool,
}

SearchHeaderFilter.defaultProps = {
  disabledExport: true,
}

export default SearchHeaderFilter
