import { i18next } from 'gm-i18n'
import React from 'react'
import moment from 'moment'
import {
  Sheet,
  SheetColumn,
  SheetAction,
  DatePicker,
  Pagination,
  Modal,
  Button,
} from '@gmfe/react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'
import actions from '../../../actions'
import './actions'
import './reducer'

class Trace extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      showModal: false,
      limit: 20,
    }

    this.uploadModalHide = ::this.uploadModalHide
    this.uploadModalShow = ::this.uploadModalShow
    this.uploadReport = ::this.uploadReport
    this.handleDateChange = ::this.handleDateChange
    this.handleSearch = ::this.handleSearch

    this.handleViewReport = ::this.handleViewReport
  }

  componentDidMount() {
    const searchData = {
      query: this.refInput.value || '',
      date: moment(this.state.date).format('YYYY-MM-DD'),
      limit: this.state.limit,
      offset: 0,
    }
    actions.searchFqtSpu(searchData)
  }

  handleViewReport(colValue) {
    window.open(
      '/station/fqt/spu?spu_id=' + colValue.spu_id + '&date=' + colValue.date
    )
  }

  handleDeleteReport(colValue) {
    actions.deleteSpuFqt({
      operation: 'del',
      spu_id: colValue.spu_id,
      date: colValue.date,
    })
  }

  handlePageChange() {
    let searchData = {
      query: this.refInput.value || '',
      date: moment(this.state.date).format('YYYY-MM-DD'),
    }
    searchData = Object.assign({}, searchData, arguments[0])
    actions.searchFqtSpu(searchData)
  }

  handleDateChange(date) {
    this.setState({
      date: date,
    })
  }

  handleSearch(event) {
    event.preventDefault()
    const searchData = {
      query: this.refInput.value || '',
      date: moment(this.state.date).format('YYYY-MM-DD'),
      offset: 0,
      limit: this.state.limit,
    }
    actions.searchFqtSpu(searchData)
  }

  uploadReport() {
    const file = this.refReport.files[0]

    actions.uploadReport({
      file,
    })
  }

  uploadModalHide() {
    actions.uploadModalHide()
  }

  uploadModalShow(event) {
    event.preventDefault()
    actions.uploadModalShow()
  }

  render() {
    const thisState = this.state
    const { upload_modal_show, spu } = this.props.fqt
    const date = moment(thisState.date).toDate()

    return (
      <div>
        <QuickFilter>
          <form className='form-inline' onSubmit={this.handleSearch}>
            <DatePicker date={date} onChange={this.handleDateChange} />
            <span className='gm-gap-10' />
            <input
              ref={(ref) => {
                this.refInput = ref
              }}
              type='text'
              className='form-control'
              placeholder={i18next.t('SPUID/SPU名称/报告ID')}
            />
            <span className='gm-gap-10' />
            <Button htmlType='submit' type='primary'>
              {i18next.t('搜索')}
            </Button>
            <span className='gm-gap-10' />
            <Button onClick={this.uploadModalShow}>
              {i18next.t('上传报告')}
            </Button>
          </form>
        </QuickFilter>
        <QuickPanel icon='bill' title={i18next.t('列表')}>
          <Sheet list={spu.list} loading={spu.loading} enableEmptyTip>
            <SheetColumn field='date' name={i18next.t('下单时间')} />
            <SheetColumn field='spu_id' name={i18next.t('商品ID')} />
            <SheetColumn field='spu_name' name={i18next.t('商品名')} />
            <SheetColumn field='assign_id' name={i18next.t('报告号')} />
            <SheetAction>
              {(value) => (
                <a
                  href={
                    '/station/fqt/spu?spu_id' +
                    value.spu_id +
                    '&data=' +
                    value.date
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {i18next.t('查看报告')}
                </a>
              )}
            </SheetAction>
            <SheetAction>
              {(value) => (
                <a onClick={this.handleDeleteReport.bind(this, value)} />
              )}
            </SheetAction>
            <Pagination data={spu.pagination} toPage={this.handlePageChange} />
          </Sheet>
        </QuickPanel>
        <Modal
          show={upload_modal_show}
          title={i18next.t('上传报告')}
          onHide={this.uploadModalHide}
        >
          <div>
            <input
              ref={(ref) => {
                this.refReport = ref
              }}
              type='file'
              accept='.xlsx'
            />
            <span className='gm-text-desc'>
              {i18next.t('选择excel报告文件上传')}
            </span>
          </div>
          <div className='text-right gm-margin-top-10'>
            <Button onClick={this.uploadModalHide}>{i18next.t('关闭')}</Button>
            <Button type='primary' onClick={this.uploadReport}>
              {i18next.t('上传')}
            </Button>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Trace
