import { createApi } from 'next-ts-api'
import { test } from '../../test'

const userApi = createApi(test)

export const { useCreateUserMutation, useGetUserQuery } = userApi.client
export const { getUserQuery } = userApi.server
