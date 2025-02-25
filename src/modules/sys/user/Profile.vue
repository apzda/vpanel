<template>
  <div class="p-5 pb-0 h-full">
    <el-row :gutter="30" class="h-full">
      <el-col :span="8" class="h-full">
        <div class="flex flex-col h-full">
          <el-card class="mb-5 shrink-0" style="--el-card-padding:10px">
            <div class="flex flex-col items-center justify-start gap-1">
              <u-avatar class="bg-cyan-600" />
              <span class="font-bold">{{ user.displayName }}</span>
            </div>
            <div class="flex gap-5 mt-3.5">
              <span class="shrink-0">{{ ts('Role') }}: </span>
              <div class="flex-1 flex flex-wrap justify-end gap-2">
                <el-tag type="info" v-for="role in user.roles" :key="role.id">{{ tsc(role.name) }}</el-tag>
              </div>
            </div>
            <div class="flex justify-between items-center mt-3.5 text-base">
              <span class="shrink-0">{{ ts(['last', '-', 'login', '-', 'time']) }}: </span>
              <span class="text-gray-400">{{ fromUnixTimestamp(user.lastLoginTime || '') }}</span>
            </div>
            <div class="flex justify-between items-center mt-1 text-base">
              <span class="shrink-0">{{ ts(['last', '-', 'login', '-']) }}IP: </span>
              <span class="text-gray-400">{{ user.lastLoginIp }}</span>
            </div>
            <template #footer>
              <div class="flex gap-5 justify-end items-center">
                <el-button
                  v-if="!user.runAs"
                  v-has-authority="'SIMPLE_USER'"
                  type="warning"
                  @click="showSwitchCode"
                  :icon="View"
                  :loading="isShowLoading"
                  :disabled="isShowLoading">{{ ts(['View', '-', 'sys.u.code']) }}
                </el-button>
                <el-button type="primary" v-if="!user.runAs" @click="setupMfa" :icon="Unlock">{{ ts('sys.u.mfa') }}
                </el-button>
              </div>
            </template>
          </el-card>
          <el-card class="mb-5 flex-auto card-body-h-full" style="--el-card-padding:10px">
            <template #header>
              <div class="card-header">
                <span>{{ $t('sys.activities') }}</span>
                <span class="float-right text-blue-500 cursor-pointer"
                      :title="ts(['View','-','more'])"
                      @click="$router.push({name:'my-activities'})">...</span>
              </div>
            </template>
            <el-scrollbar>
              <el-skeleton v-if="loading" :rows="10" animated />
              <template v-else>
                <el-empty
                  v-if="activities.length == 0"
                  :image-size="128"
                  :description="t('noData1', [t('sys.activities')])" />
                <el-timeline v-else>
                  <el-timeline-item
                    v-for="activity in activities"
                    :key="activity.id"
                    :timestamp="fromUnixTimestamp(activity.timestamp)"
                    :type="activityType(activity)"
                    placement="top"
                    class="ml-1.5 mr-1.5"
                  >
                    <el-card style="--el-card-padding:10px">
                      <h3 class="font-bold">{{ activity.activity }}</h3>
                      <p class="mt-0.5">{{ activity.message }}</p>
                      <p class="mt-0.5 text-orange-500" v-if="activity.runas">操作人: {{ activity.runas }}</p>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </template>
            </el-scrollbar>
          </el-card>
        </div>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ ts(['Base', '-', 'Profile']) }}</span>
            </div>
          </template>
          <el-form
            ref="updateAccountForm"
            label-position="left"
            require-asterisk-position="right"
            label-width="auto"
            :rules="updateAccountFormRules"
            :model="updateAccountFormModel"
            size="large"
          >
            <el-form-item :label="ts('Account')">
              <el-input :model-value="user.name" disabled />
            </el-form-item>
            <el-form-item :label="ts('Nickname')" prop="displayName">
              <el-input v-model="updateAccountFormModel.displayName" :disabled="!canBeUpdated" clearable />
            </el-form-item>
            <el-form-item :label="ts('Phone')" prop="phone">
              <el-input v-model="updateAccountFormModel.phone" :disabled="!canBeUpdated" clearable />
            </el-form-item>
            <el-form-item :label="ts('Email')" prop="email">
              <el-input v-model="updateAccountFormModel.email" :disabled="!canBeUpdated" clearable />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-alert class="mb-10" v-if="updateAccountErr" :title="updateAccountErr" type="error" />
            <div class="text-right">
              <el-button @click="discardUpdateAccount">{{ ts('Cancel') }}</el-button>
              <el-button type="success" @click="updateAccount" :disabled="!canBeUpdated || isUpdatingAccount"
                         :loading="isUpdatingAccount">{{ ts('Save') }}
              </el-button>
            </div>
          </template>
        </el-card>
        <el-card class="mt-5">
          <template #header>
            <div class="card-header">
              <span>{{ ts(['Change', '-', 'Password']) }}</span>
            </div>
          </template>
          <el-form
            ref="updatePasswordForm"
            label-position="left"
            require-asterisk-position="right"
            label-width="auto"
            :rules="updatePasswordFormRules"
            :model="updatePasswordFormModel"
            size="large"
          >
            <el-form-item :label="ts(['old','-','Password'])" prop="oldPassword">
              <el-input type="password" v-model="updatePasswordFormModel.oldPassword" :disabled="!canBeUpdated"
                        clearable />
            </el-form-item>
            <el-form-item :label="ts(['new','-','Password'])" prop="newPassword">
              <el-input v-model="updatePasswordFormModel.newPassword" type="password" :disabled="!canBeUpdated"
                        clearable />
            </el-form-item>
            <el-form-item :label="ts(['new','-','Password','(','Confirm',')'])" prop="confirmPassword">
              <el-input v-model="updatePasswordFormModel.confirmPassword" type="password" :disabled="!canBeUpdated"
                        clearable />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-alert class="mb-10" v-if="updatePasswordErr" :title="updatePasswordErr" type="error" />
            <div class="text-right">
              <el-button @click="discardUpdatePassword">{{ ts('Cancel') }}</el-button>
              <el-button type="success" :disabled="!canBeUpdated" @click="updatePassword" :loading="isUpdatingPassword">
                {{ ts('Confirm') }}
              </el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
    <setup-mfa-dialog
      ref="setupMfaDialog"
      :title="ts('sys.u.mfa')"
      width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    ></setup-mfa-dialog>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Unlock, View } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

import { alert } from '@/utils/msgbox'
import { fromUnixTimestamp } from '@/utils'
import { type PaginationQuery } from '@/@types'
import { logout, user } from '@/stores/user'

import {
  getSwitchCode,
  updateAccountInfo,
  type  UpdateMyAccountRequest,
  updatePassword as updateAccountPassword,
  type  UpdatePasswordRequest
} from '../api/account'
import { type  AuditLog, getMyActivities } from '../api/audit'
import SetupMfaDialog from '../components/SetupMfaDialog.vue'
import { t, ts, tsc } from '@/utils/i18n'
import UAvatar from '@/components/UAvatar.vue'

const $router = useRouter()

// === 修改账户信息
const canBeUpdated = ref(user.value.provider == 'db')
const isUpdatingAccount = ref(false)
const updateAccountErr = ref('')
const updateAccountForm = ref<FormInstance>()
const updateAccountFormModel = reactive<UpdateMyAccountRequest>({
  displayName: user.value.displayName,
  email: user.value.email,
  firstName: user.value.firstName,
  lastName: user.value.lastName,
  phone: user.value.phone
})
const updateAccountFormRules = reactive<FormRules<UpdateMyAccountRequest>>({
  displayName: [
    { required: true, message: () => ts(['Nickname', '-', 'valid.required']), trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1\d{10}$/, message: () => ts(['Phone', '-', 'valid.bad']), trigger: 'blur' }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/,
      message: () => ts(['Email', '-', 'valid.bad']),
      trigger: 'blur'
    }
  ]
})
const updateAccount = () => {
  updateAccountForm.value?.validate(valid => {
    if (valid) {
      isUpdatingAccount.value = true
      updateAccountInfo(updateAccountFormModel).then((data) => {
        if (data.errMsg) {
          updateAccountErr.value = data.errMsg
        } else {
          updateAccountErr.value = ''
          user.value.displayName = updateAccountFormModel.displayName
          user.value.firstName = updateAccountFormModel.firstName
          user.value.lastName = updateAccountFormModel.lastName
          user.value.phone = updateAccountFormModel.phone
          user.value.email = updateAccountFormModel.email
        }
      }).catch(err => {
        updateAccountErr.value = err.response?.data?.errMsg || err.message
      }).finally(() => {
        isUpdatingAccount.value = false
      })
    }
  })
}
const discardUpdateAccount = () => {
  updateAccountForm.value?.resetFields()
  updateAccountErr.value = ''
}
// 修改账户信息 ===

// === 修改密码
const isUpdatingPassword = ref(false)
const updatePasswordErr = ref('')
const updatePasswordForm = ref<FormInstance>()
const updatePasswordFormModel = reactive<UpdatePasswordRequest>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const updatePasswordFormRules = reactive<FormRules<UpdatePasswordRequest>>({
  oldPassword: [
    { required: true, message: () => ts(['old', '-', 'Password', '-', 'valid.required']), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: () => ts(['new', '-', 'Password', '-', 'valid.required']), trigger: 'blur' },
    {
      validator(rule: any, value: any, callback: any) {
        value = value.trim()
        if (value.length < 6) {
          return callback(t('valid.minlength', [t('Password'), 6]))
        }
        if (value == updatePasswordFormModel.oldPassword) {
          return callback(t('valid.notSame', [ts(['new', '-', 'Password']), ts(['old', '-', 'Password'])]))
        }
        if (!/[0-9]/.test(value) || !/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
          return callback(t('valid.pwd'))
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: () => ts(['the', 'new', '-', 'Password', '(', 'Confirm', ')', '-', 'valid.required']),
      trigger: 'blur'
    },
    {
      validator(rule: any, value: any, callback: any) {
        if (value == updatePasswordFormModel.newPassword) {
          callback()
        } else {
          callback(t('valid.same', [ts('Password').toLowerCase(), ts(['new', '-', 'Password'])]))
        }
      },
      trigger: 'blur'
    }]
})
const updatePassword = () => {
  updatePasswordForm.value?.validate((valid) => {
    if (valid) {
      isUpdatingPassword.value = true
      updateAccountPassword(updatePasswordFormModel).then((data) => {
        if (data.errCode == 0) {
          logout()
          $router.push('/login')
        } else if (data.errMsg) {
          updatePasswordErr.value = data.errMsg
        }
      }).catch(err => {
        updatePasswordErr.value = err.response?.data?.errMsg || err.message
      }).finally(() => {
        isUpdatingPassword.value = false
      })
    }
  })

}
const discardUpdatePassword = () => {
  updatePasswordForm.value?.resetFields()
  updatePasswordErr.value = ''
}
// 修改密码 ===

// === 查看授权码
const isShowLoading = ref(false)
const loading = ref(true)
const showSwitchCode = () => {
  isShowLoading.value = true
  getSwitchCode().then(({ data }) => {
    alert({ title: ts('sys.u.code'), message: t('sys.u.grantMsg', [data.code]), type: 'success' })
  }).finally(() => isShowLoading.value = false)
}
// === 获取多重认证配置
const setupMfaDialog = ref<InstanceType<typeof SetupMfaDialog>>()
const setupMfa = () => {
  setupMfaDialog.value?.show()
}
// === 加载活动
const query: PaginationQuery = {
  pager: {
    pageSize: 50,
    pageNumber: 0,
    sort: {
      order: [
        {
          field: 'logTime',
          direction: 'DESC'
        }
      ]
    }
  }
}
const activities = ref<AuditLog[]>([])
const activityType = (act: any) => {
  if (act.level == 'info') {
    return 'primary'
  } else if (act.level == 'error') {
    return 'danger'
  } else if (act.level == 'warning') {
    return 'warning'
  }
  return 'default'
}
const loadActivities = (query: PaginationQuery) => {
  getMyActivities(query).then(({ data }) => {
    if (data.log && data.log.length > 0) {
      data.log.forEach(log => {
        activities.value.push(log)
      })
    }
  }).finally(() => loading.value = false)
}
onMounted(() => loadActivities(query))
</script>