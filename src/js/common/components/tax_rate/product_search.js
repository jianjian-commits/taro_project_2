import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import {
  Button,
  Flex,
  Form,
  FormItem,
  Input,
  Tip,
  Validator,
} from '@gmfe/react'
import { pinYinFilter } from 'gm-util'

class ProductSearch extends Component {
  static propTypes = {
    list: PropTypes.array,
    onSearch: PropTypes.func,
  }

  _inputRef = createRef()

  state = {
    word: '',
    indexes: [],
    index: 0,
    subIndex: -1,
  }

  handleSet = (event) => {
    const { keyCode } = event
    if (keyCode === 40) {
      event.preventDefault()
      this.handleNext()
    }
    if (keyCode === 38) {
      event.preventDefault()
      this.handlePrev()
    }
  }

  handleChange = (event) => {
    this.setState({
      word: event.target.value,
      indexes: [],
      index: 0,
      subIndex: -1,
    })
    window.removeEventListener('keydown', this.handleSet)
    const { onSearch } = this.props
    onSearch()
  }

  handleSearch = () => {
    const { word, indexes } = this.state
    const { list } = this.props
    if (!indexes.length) {
      list.forEach((item, index) => {
        const { children } = item
        const result = pinYinFilter(
          children,
          word,
          (value) => value.spu_name + value.spu_id
        )
        if (result.length) {
          const option = { index, subIndexes: [] }
          children.forEach((child, subIndex) => {
            if (result.some((value) => value.spu_id === child.spu_id)) {
              option.subIndexes.push(subIndex)
            }
          })
          indexes.push(option)
        }
      })
    }
    if (!indexes.length) {
      Tip.warning(t('没有找到'))
      return
    }
    this.setState({ indexes }, () => {
      this._inputRef.current.blur()
      this._inputRef.current.focus()
      this.handleNext()
    })
  }

  handleNext = () => {
    const { onSearch } = this.props
    const { indexes, index, subIndex } = this.state
    if (subIndex + 1 === indexes[index].subIndexes.length) {
      if (index + 1 === indexes.length) {
        this.setState({ index: 0, subIndex: 0 }, () => {
          onSearch(indexes[0].index, indexes[0].subIndexes[0])
        })
      } else {
        this.setState({ index: index + 1, subIndex: 0 }, () => {
          onSearch(indexes[index + 1].index, indexes[index + 1].subIndexes[0])
        })
      }
    } else {
      this.setState({ subIndex: subIndex + 1 }, () => {
        onSearch(indexes[index].index, indexes[index].subIndexes[subIndex + 1])
      })
    }
  }

  handlePrev = () => {
    const { onSearch } = this.props
    const { indexes, index, subIndex } = this.state
    if (subIndex === 0) {
      if (index === 0) {
        this.setState(
          {
            index: indexes.length - 1,
            subIndex: indexes[indexes.length - 1].subIndexes.length - 1,
          },
          () => {
            onSearch(
              indexes[indexes.length - 1].index,
              indexes[indexes.length - 1].subIndexes[
                indexes[indexes.length - 1].subIndexes.length - 1
              ]
            )
          }
        )
      } else {
        this.setState(
          {
            index: index - 1,
            subIndex: indexes[index - 1].subIndexes.length - 1,
          },
          () => {
            onSearch(
              indexes[index - 1].index,
              indexes[index - 1].subIndexes[
                indexes[index - 1].subIndexes.length - 1
              ]
            )
          }
        )
      }
    } else {
      this.setState({ subIndex: subIndex - 1 }, () => {
        onSearch(indexes[index].index, indexes[index].subIndexes[subIndex - 1])
      })
    }
  }

  handleFocus = () => {
    const { indexes } = this.state
    if (!indexes.length) {
      return
    }
    window.addEventListener('keydown', this.handleSet)
  }

  handleBlur = () => {
    window.removeEventListener('keydown', this.handleSet)
  }

  render() {
    const { word, index, subIndex, indexes } = this.state
    let count = 0
    indexes.forEach((item) => {
      count += item.subIndexes.length
    })
    return (
      <Form onSubmitValidated={this.handleSearch}>
        <FormItem validate={Validator.create(Validator.TYPE.required, word)}>
          <Flex>
            <Input
              value={word}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              ref={this._inputRef}
              onChange={this.handleChange}
              className='form-control'
              placeholder={t('请输入商品名')}
            />
            <Button type='primary' htmlType='submit'>
              {t('定位')}
            </Button>
          </Flex>
        </FormItem>
        {indexes.length > 0 && (
          <FormItem>
            <Flex style={{ height: '30px', lineHeight: '30px' }}>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              <span>{t('当前：')}</span>
              <span>{index + subIndex + 1}</span>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              <span>{t('共有：')}</span>
              <span>{count}</span>
            </Flex>
          </FormItem>
        )}
      </Form>
    )
  }
}

export default ProductSearch
