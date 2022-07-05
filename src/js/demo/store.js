import { observable, action } from 'mobx'

class Store {
  data = [
    {
      id: 1,
      name: '小明',
      age: 12,
      children: [
        {
          id: 11,
          name: '妈妈',
          gender: '男',
        },
        {
          id: 12,
          name: '爸爸',
          gender: '女',
        },
      ],
    },
    {
      id: 2,
      name: '小红',
      age: 22,
      children: [],
    },
    {
      id: 3,
      name: '小王',
      age: 33,
      children: [
        {
          id: 13,
          name: '逼逼',
          gender: '女',
        },
      ],
    },
  ]

  @observable
  selected = []

  @action
  setSelected(selected) {
    console.log(selected)
    this.selected = selected
  }
}

export default new Store()
