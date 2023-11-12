const mergenode = (dest: any, source: any): void => {
  for (const key in source) {
    if (key != 'children') {
      dest[key] = source[key]
    }
  }
}

export type IdFieldName = 'id' | 'path'

export interface ITreeMgr<T> {
  readonly nodes: T[]
  add(routes: T[], currentNode?: T[]): void
  get(id: string): T | null
}

export class TreeMgr<T extends { path?: string; id?: string; children?: T[] }> implements ITreeMgr<T> {
  readonly nodes: T[] = []
  readonly idf: IdFieldName

  constructor(idf: IdFieldName = 'id') {
    this.idf = idf
  }

  add(nodes: T[], current?: T[]) {
    if (!current) {
      current = this.nodes
    }
    for (const node of nodes) {
      const cr = current.find((r) => r[this.idf] === node[this.idf])
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
    const ids = id.split('.')
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
