class Manager {
  constructor() {
    this.refs = []
    this.activeRef = null
    this.containerRef = null
    this.positionMap = {}
  }

  add(ref) {
    this.refs.push(ref)
  }

  replace(ref, index) {
    this.refs[index] = ref
  }

  remove(index) {
    if (index !== -1) {
      this.refs[index] = null
    }
  }

  getPositionMap = (index) => this.positionMap[index]
  setPositionMap = (index, position) => {
    this.positionMap[index] = position
  }

  getIndex(ref) {
    return this.refs.indexOf(ref)
  }

  getNodeManagerRef(node) {
    return this.refs.find((managerRef) => managerRef.node === node)
  }

  setCenterPoint(node, point) {
    const item = this.getNodeManagerRef(node)
    if (item) {
      item.info.point = point
    }
  }
}

export default Manager
