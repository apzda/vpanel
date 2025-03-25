<template>
  <el-dialog v-model="dlgStatus" :title="ts('table.cfgDlgTitle', '')" width="600px" align-center>
    <div class="h-[400px] border rounded-md border-[var(--el-border-color)]">
      <el-scrollbar height="100%">
        <div class="flex flex-col gap-2 p-2">
          <div>
            <span class="text-xs text-gray-400">左冻结</span>
            <div class="mt-1">
              <vue-draggable
                ref="vueDraggable"
                v-model="lfColumns"
                :animation="150"
                handle=".handle"
                ghost-class="ghost"
                group="column"
                class="min-h-[2rem]"
              >
                <az-table-column-item v-model="lfColumns" :fixed="true"></az-table-column-item>
              </vue-draggable>
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-400">未冻结</span>
            <div>
              <vue-draggable
                ref="vueDraggable"
                v-model="nfColumns"
                :animation="150"
                handle=".handle"
                ghost-class="ghost"
                group="column"
                class="min-h-[2rem]"
              >
                <az-table-column-item v-model="nfColumns"></az-table-column-item>
              </vue-draggable>
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-400">右冻结</span>
            <div>
              <vue-draggable
                ref="vueDraggable"
                v-model="rfColumns"
                :animation="150"
                handle=".handle"
                ghost-class="ghost"
                group="column"
                class="min-h-[2rem]"
              >
                <az-table-column-item v-model="rfColumns" :fixed="true"></az-table-column-item>
              </vue-draggable>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template #footer>
      <div class="flex items-center justify-end">
        <div class="flex-initial">
          <el-button text type="primary" @click="reset">恢复默认值</el-button>
        </div>
        <div class="grow">&nbsp;</div>
        <div class="flex-initial">
          <el-button text @click="cancel">{{ ts('Cancel') }}</el-button>
          <el-button type="primary" @click="confirm">{{ ts('Confirm') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ts } from '@/utils/i18n.ts'
import useAppStore from '@/stores/app.ts'
import type { AzTableHelper, TableColumn } from '@/components/table'
import { VueDraggable } from 'vue-draggable-plus'
import AzTableColumnItem from '@/components/table/widgets/AzTableColumnItem.vue'

const props = defineProps<{
  tid?: string
}>()

const $emits = defineEmits<{
  (e: 'ok'): void
  (e: 'reset'): void
}>()
// bind
const dlgStatus = ref(false)

const lfColumns = ref<TableColumn[]>([])
const rfColumns = ref<TableColumn[]>([])
const nfColumns = ref<TableColumn[]>([])
let tbHelper: AzTableHelper | null = null
// methods
const config = (helper: AzTableHelper) => {
  dlgStatus.value = true
  tbHelper = helper
  fillColumns(tbHelper.getAllColumns())
}

const fillColumns = (columns: TableColumn[]) => {
  lfColumns.value = []
  nfColumns.value = []
  rfColumns.value = []

  columns.forEach((col) => {
    if (col.fixed === 'left' || col.fixed === true) {
      lfColumns.value.push(col)
    } else if (col.fixed === 'right') {
      rfColumns.value.push(col)
    } else {
      nfColumns.value.push(col)
    }
  })
}
// event handlers
const cancel = () => {
  dlgStatus.value = false
}

const confirm = () => {
  if (props.tid) {
    const { appCfg } = useAppStore()
    const cols: Record<string, { hidden: boolean; order: number; fixed?: 'left' | 'right' }> = {}
    console.log(props.tid, lfColumns.value, nfColumns.value, rfColumns.value)
    let order = 0
    lfColumns.value.forEach((col) => {
      //@ts-ignore
      cols[col.cid] = {
        fixed: 'left',
        order: order++
      }
    })
    nfColumns.value.forEach((col) => {
      //@ts-ignore
      cols[col.cid] = {
        hidden: col.hidden,
        order: order++
      }
    })
    rfColumns.value.forEach((col) => {
      //@ts-ignore
      cols[col.cid] = {
        fixed: 'right',
        order: order++
      }
    })
    appCfg.tableColumns[props.tid] = cols
  }
  dlgStatus.value = false
  if (tbHelper != null) {
    tbHelper.reloadColumns()
  }
  $emits('ok')
}
const reset = () => {
  if (tbHelper != null) {
    tbHelper.reset()
    fillColumns(tbHelper.getAllColumns())
  }
}
defineExpose({
  config
})
</script>
