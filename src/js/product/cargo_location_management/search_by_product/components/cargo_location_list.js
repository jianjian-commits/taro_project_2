import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { store } from '../../store'
import {
  Form,
  FormItem,
  FormButton,
  Input,
  Button,
  Divider,
  Flex,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import CargoLocationListCard from './cargo_location_list_card'
import { scrollToLoad } from '../../utils'
import _ from 'lodash'

@observer
class CargoLocationList extends Component {
  cargoLocationListContainer

  constructor(props) {
    super(props)
    this.scroll = ::this.scroll
  }

  scroll() {
    const {
      productSearchOption: { page_obj },
      cargoLocationListMore,
    } = store
    const event = () => {
      store.setProductSearchOption('page_obj', page_obj)
      store.getCargoLocationList()
    }
    scrollToLoad(this.cargoLocationListContainer, event, cargoLocationListMore)
  }

  handleSearch() {
    store.setCargoLocationList([])
    store.setProductSearchOption('page_obj', '')
    store.getCargoLocationList()
  }

  render() {
    const {
      cargoLocationList,
      productSearchOption: { shelf_name },
    } = store

    return (
      <>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem>
            <Input
              placeholder={t('请输入货位名搜索')}
              className='form-control'
              value={shelf_name}
              onChange={(event) =>
                store.setProductSearchOption('shelf_name', event.target.value)
              }
            />
          </FormItem>
          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
          </FormButton>
        </Form>
        <div
          className='gm-margin-top-20 stock-list'
          ref={(ref) => (this.cargoLocationListContainer = ref)}
          onScroll={_.throttle(this.scroll, 500)}
        >
          {cargoLocationList.length
            ? _.map(cargoLocationList, (item, index) => (
                <section key={index}>
                  <Divider>{item.root}</Divider>
                  <Flex row justifyBetween wrap>
                    {_.map(item.shelf_list, (shelf, key) => (
                      <CargoLocationListCard data={shelf} key={key} />
                    ))}
                  </Flex>
                </section>
              ))
            : t('没有数据')}
        </div>
      </>
    )
  }
}

export default CargoLocationList
