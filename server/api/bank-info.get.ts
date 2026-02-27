import { successResponse } from '../utils/response'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  
  return successResponse({
    bankName: config.bankName,
    bankAccount: config.bankAccount,
    accountName: config.bankAccountName,
    branchName: config.bankBranch
  })
})
