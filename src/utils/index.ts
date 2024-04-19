const mergenode = (dest: any, source: any): void => {
  for (const key in source) {
    if (key != 'children') {
      dest[key] = source[key]
    }
  }
}

export type IdFieldName = 'id' | 'path'

export interface ITreeMgr<T> {
  readonly nodes: Array<T>
  add(routes: Array<T>): void
  get(id: string): T | null
}

export class TreeMgr<T extends { path?: string; id?: string; level?: number; children?: T[] }> implements ITreeMgr<T> {
  readonly nodes: Array<T> = []
  readonly idf: IdFieldName
  readonly separator: string

  constructor(idf: IdFieldName = 'id', separator: string = '.') {
    this.idf = idf
    this.separator = separator
  }
  add(nodes: Array<T>) {
    this._add(nodes, this.nodes, 1)
  }

  _add(nodes: Array<T>, current: Array<T>, level: number) {
    const idf = this.idf
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i]
      node.level = level
      const cr = current.find((r) => r[idf] === node[idf])
      // console.debug('添加Node', JSON.stringify(node))
      if (!cr) {
        // console.debug('    直接新增', node)
        this._fill(level + 1, node.children)
        current.push(node)
      } else {
        // 合并节点(不合并子节点)
        // console.debug('    Node已存在', JSON.stringify(cr))
        mergenode(cr, node)
        // console.debug('    合并后的Node', cr)
        if (node.children) {
          if (!cr.children) {
            cr.children = []
          }
          this._add(node.children, cr.children, level + 1)
        }
      }
    }
  }

  get(id: string): T | null {
    const ids = id.split(this.separator)
    const lastIdx = ids.length - 1
    const idf = this.idf
    let cnodes = this.nodes
    let cnode: T | undefined

    for (let i = 0; i <= lastIdx; i++) {
      if (!ids[i].trim()) continue
      cnode = cnodes.find((n) => n[idf] == ids[i])
      if (!cnode) {
        return null
      } else if (i != lastIdx) {
        if (cnode.children) {
          cnodes = cnode.children
        } else {
          return null
        }
      }
    }
    return cnode ? cnode : null
  }

  _fill(level: number, children?: T[]) {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        children[i].level = level
        if (children[i].children) {
          this._fill(level + 1, children[i].children)
        }
      }
    }
  }
}
