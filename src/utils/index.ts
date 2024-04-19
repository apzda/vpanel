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
  add(routes: Array<T>, currentNode?: Array<T>): void
  get(id: string): T | null
}

export class TreeMgr<T extends { path?: string; id?: string; children?: T[] }> implements ITreeMgr<T> {
  readonly nodes: Array<T> = []
  readonly idf: IdFieldName
  readonly seperator: string

  constructor(idf: IdFieldName = 'id', seperator: string = '.') {
    this.idf = idf
    this.seperator = seperator
  }

  add(nodes: Array<T>, current?: Array<T>) {
    const idf = this.idf

    if (!current) {
      current = this.nodes
    }
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i]
      const cr = current.find((r) => r[idf] === node[idf])
      // console.debug('添加Node', JSON.stringify(node))
      if (!cr) {
        // console.debug('    直接新增', node)
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
          this.add(node.children, cr.children)
        }
      }
    }
  }

  get(id: string): T | null {
    const ids = id.split(this.seperator)
    const lastIdx = ids.length - 1
    const idf = this.idf
    let cnodes = this.nodes
    let cnode: T | undefined

    for (let i = 0; i <= lastIdx; i++) {
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
}
