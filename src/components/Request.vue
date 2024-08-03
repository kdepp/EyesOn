<template>
  <div class="http-object http-request">
    <div class="http-method http-info">
      {{ request.method }}
    </div>
    <div>
      <div class="http-info-row http-request-url">
        {{ request.url }}
      </div>
      <div v-if="hasAnyHeader" class="http-info-row http-request-headers">
        <span class="data-label">Headers:</span>
        <json-tree :json="request.headers" />
      </div>
      <div v-if="hasAnyPayload" class="http-info-row http-request-payload">
        <span class="data-label">Payload:</span>
        <json-tree
          v-if="request.payload"
          :json="request.payload"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, reactive, toRefs } from "vue"
import { RequestKeyInfo } from "@/services/types"
import JsonTree from "./JSONTree.vue"
import { getStyleInjector } from "@/services/style_injector"
import httpObjectStyles from "./HttpObject.scss"

export default defineComponent({
  name: "Request",
  components: {
    JsonTree,
  },
  props: {
    request: {
      type: Object as PropType<RequestKeyInfo>,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      selectedTab: "link",
      iconColor: "#fff",
      iconSize: "10px",
    })

    const hasAnyHeader = computed((): boolean => {
      return Object.keys(props.request.headers).length > 0
    })

    const hasAnyPayload = computed((): boolean => {
      return !!props.request.payload
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
      hasAnyHeader,
      hasAnyPayload,
    }
  },
})
</script>
