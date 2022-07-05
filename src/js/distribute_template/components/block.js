import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { Trigger } from '@gmfe/react-deprecated'
import styles from '../style.module.less'
import _ from 'lodash'

const defaultFontSize = 10 // pt

class BlockWithTextBg extends Component {
  render() {
    const { bgText, style } = this.props

    return (
      <Flex justifyCenter alignCenter className={styles.blockBackground}>
        <div className={styles.blockBackgroundText}>{bgText}</div>
        <Flex column className={styles.blockBackgroundContent} style={style}>
          {this.props.children}
        </Flex>
      </Flex>
    )
  }
}

class BlockLines extends Component {
  constructor(props) {
    super(props)

    this.handleLineAdd = ::this.handleLineAdd
  }

  handleLineAdd() {
    this.props.onLineAdd('forward')
  }

  render() {
    const { lines, disabled, ...rest } = this.props

    return (
      <div>
        {lines.map((line, index) => {
          if (line.type === 'columns') {
            return (
              <BlockColumns
                key={index}
                columns={line.content}
                lineNo={index}
                {...rest}
                disabled={disabled}
              />
            )
          }
        })}

        {!disabled && (
          <Flex alignCenter justifyCenter className={styles.blockLineAddWrap}>
            <div className={styles.blockLineAdd} onClick={this.handleLineAdd}>
              <i className='ifont ifont-jia' />
              &nbsp;<span>{i18next.t('添加一行')}</span>
            </div>
          </Flex>
        )}
      </div>
    )
  }
}

/**
 * line: [{type, content}]
 */
BlockLines.propTypes = {
  lines: PropTypes.array.isRequired,
  onLineAdd: PropTypes.func.isRequired,
  onColumnAdd: PropTypes.func.isRequired,
  onColumnDel: PropTypes.func.isRequired,
  onFieldSetting: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

BlockLines.defaultPropTypes = {
  lines: [],
  disabled: false,
}

class BlockColumns extends Component {
  constructor(props) {
    super(props)

    this.handleLineAddBack = ::this.handleLineAddBack
    this.handleLineAddForward = ::this.handleLineAddForward
  }

  handleColumnAdd(columnNo) {
    const { lineNo, onColumnAdd } = this.props

    onColumnAdd(lineNo, columnNo)
  }

  handleColumnDel(columnNo) {
    const { lineNo, onColumnDel } = this.props

    onColumnDel(lineNo, columnNo)
  }

  handleLineAddForward() {
    this.props.onLineAdd('forward', this.props.lineNo)
  }

  handleLineAddBack() {
    this.props.onLineAdd('back', this.props.lineNo)
  }

  handleFieldSetting(columnNo) {
    this.props.onFieldSetting(this.props.lineNo, columnNo)
  }

  render() {
    const { columns, disabled } = this.props
    const maxHeightColumn = _.maxBy(columns, (col) => col.height)
    const maxLineHeight = maxHeightColumn ? `${maxHeightColumn.height}pt` : null

    return (
      <Flex style={{ height: maxLineHeight }}>
        {columns.map((column, index) => {
          const {
            text,
            width,
            fontSize = defaultFontSize,
            alignment,
            bold,
            color,
          } = column
          const columnStyle = {
            fontSize: `${fontSize}pt`,
            width: `${width}pt`,
            height: maxHeightColumn,
            color,
            fontWeight: bold ? 'bold' : 'normal',
          }

          return (
            <Flex
              key={index}
              flex={column.width === undefined || column.width === ''}
              alignCenter
              justifyStart
              justifyCenter={alignment === 'center'}
              justifyEnd={alignment === 'right'}
              style={columnStyle}
            >
              {disabled ? (
                <span className={styles.blockColumnText}>{text}</span>
              ) : (
                <Trigger
                  type='click'
                  component={<div />}
                  showArrow
                  popup={
                    <div className={styles.popupWrap}>
                      <div
                        className='gm-text-desc'
                        style={{ marginBottom: '2px' }}
                      >
                        {i18next.t('添加字段')}
                      </div>
                      <ul>
                        <li onClick={this.handleColumnAdd.bind(this, index)}>
                          {i18next.t('本行添加')}
                        </li>
                        <li onClick={this.handleLineAddBack}>
                          {i18next.t('上行添加')}
                        </li>
                        <li onClick={this.handleLineAddForward}>
                          {i18next.t('下行添加')}
                        </li>
                      </ul>
                      <div
                        className='gm-text-desc'
                        style={{ margin: '4px 0 2px 0px' }}
                      >
                        {i18next.t('设置')}
                      </div>
                      <ul>
                        <li onClick={this.handleFieldSetting.bind(this, index)}>
                          {i18next.t('设置')}
                        </li>
                        <li onClick={this.handleColumnDel.bind(this, index)}>
                          {i18next.t('删除')}
                        </li>
                      </ul>
                    </div>
                  }
                >
                  <span>{text.trim() || <span />}</span>
                </Trigger>
              )}
            </Flex>
          )
        })}
      </Flex>
    )
  }
}

/**
 * columns: [{ text: '收货地收', alignment: "left" },{ text: '签名', width: 140 }]
 */
BlockColumns.propTypes = {
  columns: PropTypes.array.isRequired,
  onLineAdd: PropTypes.func.isRequired,
  onColumnAdd: PropTypes.func.isRequired,
  onColumnDel: PropTypes.func.isRequired,
  onFieldSetting: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

BlockColumns.defaultPropTypes = {
  columns: [],
  disabled: false,
}

class BlockTable extends Component {
  handleColumnAdd(columnNo) {
    this.props.onColumnAdd(columnNo)
  }

  handleColumnDel(columnNo) {
    this.props.onColumnDel(columnNo)
  }

  handleFieldSetting(columnNo) {
    this.props.onFieldSetting(columnNo)
  }

  render() {
    const { header, disabled } = this.props

    return (
      <Flex className={styles.blockTableHeader}>
        {header.map((column, index) => {
          const {
            text,
            fontSize = defaultFontSize,
            alignment,
            bold,
            color,
          } = column
          const columnStyle = {
            fontSize: `${fontSize}pt`,
            color,
            fontWeight: bold ? 'bold' : 'normal',
          }

          return (
            <Flex
              key={index}
              flex
              alignCenter
              justifyStart
              justifyCenter={alignment === 'center'}
              justifyEnd={alignment === 'right'}
              style={columnStyle}
            >
              {disabled ? (
                <span className={styles.blockColumnText}>{text}</span>
              ) : (
                <Trigger
                  type='click'
                  component={<div />}
                  showArrow
                  popup={
                    <div className={styles.popupWrap}>
                      <div
                        className='gm-text-desc'
                        style={{ marginBottom: '2px' }}
                      >
                        {i18next.t('添加字段')}
                      </div>
                      <ul>
                        <li onClick={this.handleColumnAdd.bind(this, index)}>
                          {i18next.t('本行添加')}
                        </li>
                      </ul>
                      <div
                        className='gm-text-desc'
                        style={{ margin: '4px 0 2px 0px' }}
                      >
                        {i18next.t('设置')}
                      </div>
                      <ul>
                        <li onClick={this.handleFieldSetting.bind(this, index)}>
                          {i18next.t('设置')}
                        </li>
                        <li onClick={this.handleColumnDel.bind(this, index)}>
                          {i18next.t('删除')}
                        </li>
                      </ul>
                    </div>
                  }
                >
                  <span>{text}</span>
                </Trigger>
              )}
            </Flex>
          )
        })}
      </Flex>
    )
  }
}

BlockTable.propTypes = {
  header: PropTypes.array.isRequired,
  onColumnAdd: PropTypes.func.isRequired,
  onColumnDel: PropTypes.func.isRequired,
  onFieldSetting: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

BlockTable.defaultPropTypes = {
  header: [],
  disabled: false,
}

export { BlockWithTextBg, BlockLines, BlockColumns, BlockTable }
