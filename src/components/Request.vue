<template>
  <div class="http-object http-request">
    <div class="http-method http-info">
      {{ request.method }}
    </div>
    <div class="tab-wrapper">
      <div class="tabs">
        <div
          :class="{ active: selectedTab === 'link' }"
          class="tab"
          @click="selectTab('link')"
        >
          <link-icon :color="iconColor" :size="iconSize" />
        </div>
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
        <div v-if="selectedTab === 'link'">
          {{ request.url }}
        </div>
        <div v-else-if="selectedTab === 'header'">
          <json-tree :json="request.headers" />
        </div>
        <div v-else-if="selectedTab === 'body'">
          <json-tree
            v-if="request.payload"
            :json="request.payload"
          />
          <span v-else>(empty)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, PropType, reactive, toRefs } from "vue"
import HIcon from "./icons/H.vue"
import BIcon from "./icons/B.vue"
import LinkIcon from "./icons/Link.vue"
import { RequestKeyInfo } from "@/services/types"
import JsonTree from "./JSONTree.vue"
import { getStyleInjector } from "@/services/style_injector"
import tabStyles from "./Tabs.scss"

export default defineComponent({
  name: "Request",
  components: {
    HIcon,
    BIcon,
    LinkIcon,
    JsonTree,
  },
  props: {
    request: {
      type: Object as PropType<RequestKeyInfo>,
      required: true,
    },
  },
  setup() {
    const state = reactive({
      selectedTab: "link",
      iconColor: "#fff",
      iconSize: "10px",
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
    }
  },
})
</script>
