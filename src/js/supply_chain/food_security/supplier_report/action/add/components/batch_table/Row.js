import { Request } from '@gm-common/request'
import { action, observable, runInAction } from 'mobx'

class Row {
  constructor(data) {
    if (data) {
      this.data = {
        ...data,
      }
      this.id = data.batch_number
    } else {
      this.data = {}
    }
  }

  id = 'null_' + Date.now().toString()

  @observable candidates = []

  @observable selectedCandidate
  /**
   *
   * @param {number} index table索引
   * @param {object} selected 选中的搜索结果
   */
  @action setSelectedCandidate(index, selected) {
    this.selectedCandidate = selected
    if (!selected) {
      this.data = null
      return
    }
    const candidate = this.candidates.find(
      (candidate) => candidate.batch_number === selected.value,
    )
    this.data = candidate
    this.id = candidate.batch_number
  }

  searchBatches(str) {
    return Request('/stock/batch/search/food_security_food')
      .data({
        query_type: 2,
        q: str,
      })
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.candidates = data
        })
      })
  }
}

export default Row
