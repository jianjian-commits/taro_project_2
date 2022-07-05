import React from 'react'
import { SvgOk } from 'gm-svg'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { DropSelect, Flex, Button } from '@gmfe/react'
import { SvgSearch } from 'gm-svg'
import editStore from './edit_store'

@observer
class EditDropSearch extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      searchListShow: false,
    }

    this.dropSelectData = {
      loading: false,
      list: [],
      columns: [
        {
          name: i18next.t('分类名/分类ID'),
          field: 'name',
          render: (val, rowInfo) => {
            return (
              <div className='gm-block gm-line-height-1'>
                {rowInfo.category_1_name}/{rowInfo.category_2_name}
                <br />
                <span className='gm-text-desc'>{rowInfo.category_2_id}</span>
              </div>
            )
          },
        },
        {
          name: i18next.t('计算规则'),
          field: 'rule',
        },
        {
          name: i18next.t('操作'),
          field: 'isInResultList',
          render: (isInResultList, rowInfo) => {
            return isInResultList ? (
              i18next.t('已添加')
            ) : (
              <Button
                onClick={this.handleAddObjToResultList.bind(this, rowInfo)}
              >
                <SvgOk />
              </Button>
            )
          },
        },
      ],
    }
  }

  componentDidMount() {
    editStore.getCategory2List()
  }

  handleAddObjToResultList(obj) {
    this.setState({ searchListShow: false })

    editStore.resultListAdd(obj)
  }

  handleDropSelectEnter = (index) => {
    // input失去焦点
    this.inputRef.current.blur()
    this.setState({ searchListShow: false })

    editStore.resultListAddByIndex(index)
  }

  handleDropSelectHide = () => {
    this.setState({ searchListShow: false })
  }

  handleInputChange = (e) => {
    if (!this.state.searchListShow) this.handleInputFocus()

    const value = e.target.value

    editStore.inputValueChange(value)
  }

  handleInputFocus = () => {
    this.setState({ searchListShow: true })
  }

  handleInputInputClear = () => {
    this.setState({
      searchListShow: false,
    })

    editStore.inputValueChange('')
    editStore.searchListClear()
  }

  render() {
    const { inputValue, searchList } = editStore
    const { searchListShow } = this.state

    const data = {
      ...this.dropSelectData,
      list: searchList.slice(),
    }

    return (
      <DropSelect
        show={searchListShow}
        data={data}
        onEnter={this.handleDropSelectEnter}
        onHide={this.handleDropSelectHide}
      >
        <Flex alignCenter>
          <SvgSearch className='gm-text-16 gm-text-desc gm-margin-lr-10' />
          <input
            ref={this.inputRef}
            value={inputValue}
            onChange={this.handleInputChange}
            onFocus={this.handleInputFocus}
            className='form-control'
            placeholder={i18next.t('输入二级分类ID/二级分类名,快速添加分类')}
            type='search'
          />
        </Flex>
      </DropSelect>
    )
  }
}

export default EditDropSearch
