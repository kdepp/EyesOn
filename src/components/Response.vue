<template>
  <div :style="responseStyle" class="http-object http-response">
    <div class="http-status-code http-info">
      {{ statusCode }}
    </div>
    <div v-if="!!response">
      <div v-if="hasAnyHeader" class="http-info-row http-response-headers">
        <span class="data-label">Headers:</span>
        <json-tree :json="response.headers" />
      </div>
      <div v-if="hasAnyBody" class="http-info-row http-response-body">
        <span class="data-label">Response:</span>
        <json-tree
          v-if="response?.body?.value"
          :json="response.body.value"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, reactive, toRefs } from "vue"
import { ResponseKeyInfo } from "@/services/types"
import JsonTree from "./JSONTree.vue"
import { getStyleInjector } from "@/services/style_injector"
import httpObjectStyles from "./HttpObject.scss"

export default defineComponent({
  name: "Response",
  components: {
    JsonTree,
  },
  props: {
    response: {
      type: Object as PropType<ResponseKeyInfo>,
      default: null,
    },
  },
  setup(props) {
    const state = reactive({
      selectedTab: "body",
      iconColor: "#fff",
      iconSize: "10px",
      responseStyle: {
        borderTop: "1px solid rgba(255, 255, 255, 0.5)",
        marginTop: "10px",
        paddingTop: "10px",
      },
    })
    const statusCode = computed(() => {
      return props.response?.code ?? "??"
    })
    const hasAnyHeader = computed(() => {
      return Object.keys(props.response?.headers ?? {}).length > 0
    })
    const hasAnyBody = computed(() => {
      return !!props.response?.body
    })

    onBeforeMount(() => {
      getStyleInjector().injectStyles(httpObjectStyles)
    })

    function selectTab(tab: string) {
      state.selectedTab = tab
    }

    return {
      ...toRefs(state),
      selectTab,
      statusCode,
      hasAnyHeader,
      hasAnyBody,
    }
  },
})
</script>

