<template>
  <div class="request-entry">
    <request-item :request="request" />
    <response-item :response="response" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType } from "vue"
import RequestItem from "./Request.vue"
import ResponseItem from "./Response.vue"
import { Invocation, RequestKeyInfo, ResponseKeyInfo } from "@/services/types"
import { getStyleInjector } from "@/services/style_injector"
import styles from "./RequestEntry.scss"

export default defineComponent({
  name: "RequestEntry",
  components: {
    RequestItem,
    ResponseItem,
  },
  props: {
    invocation: {
      type: Object as PropType<Invocation>,
      required: true,
    },
  },
  setup(props) {
    const httpMethod = computed((): string => {
      const reqObj = props.invocation.args[0]
      return (reqObj.request as RequestKeyInfo).method
    })
    const httpStatusCode = computed((): string => {
      const code = (props.invocation.args[1] as ResponseKeyInfo)?.code
      return code === undefined ? "??" : `${code}`
    })
    const hasResponse = computed((): boolean => {
      return (props.invocation.args[1] as ResponseKeyInfo) !== undefined
    })
    const request = computed((): RequestKeyInfo => {
      return props.invocation.args[0].request as RequestKeyInfo
    })
    const response = computed((): ResponseKeyInfo => {
      return props.invocation.args[1]?.response as ResponseKeyInfo
    })

    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })

    return {
      httpMethod,
      httpStatusCode,
      hasResponse,
      request,
      response,
    }
  },
})
</script>
