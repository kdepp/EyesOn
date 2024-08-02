<template>
  <div :style="responseStyle" class="http-object http-response">
    <div class="http-status-code http-info">
      {{ statusCode }}
    </div>
    <div v-if="!!response" class="tab-wrapper">
      <div class="tabs">
        <div
          :class="{ active: selectedTab === 'header' }"
          class="tab"
          @click="selectTab('header')"
        >
          <h-icon :color="iconColor" :size="iconSize" />
        </div>
        <div
          :class="{ active: selectedTab === 'body' }"
          class="tab"
          @click="selectTab('body')"
        >
          <b-icon :color="iconColor" :size="iconSize" />
        </div>
      </div>
      <div class="tab-content">
        <div v-if="selectedTab === 'header'">
          <json-tree :json="response.headers" />
        </div>
        <div v-else-if="selectedTab === 'body'">
          <json-tree
            v-if="response.body && response.body.type === 'json'"
            :json="response.body.value"
          />
          <span v-else-if="response.body && response.body.type === 'text'">
            {{ response.body.value }}
          </span>
          <span v-else>({{ response.body ? response.body.type : "empty" }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, reactive, toRefs } from "vue"
import HIcon from "./icons/H.vue"
import BIcon from "./icons/B.vue"
import { ResponseKeyInfo } from "@/services/types"
import JsonTree from "./JSONTree.vue"
import { getStyleInjector } from "@/services/style_injector"
import tabStyles from "./Tabs.scss"

export default defineComponent({
  name: "Response",
  components: {
    HIcon,
    BIcon,
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

    onBeforeMount(() => {
      getStyleInjector().injectStyles(tabStyles)
    })

    function selectTab(tab: string) {
      state.selectedTab = tab
    }

    return {
      ...toRefs(state),
      selectTab,
      statusCode,
    }
  },
})
</script>

