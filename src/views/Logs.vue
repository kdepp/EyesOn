<template>
  <div
    v-if="enabled"
    class="logs-container"
  >
    <h3>Logs</h3>
    <div class="entry-list">
      <div
        v-for="(item, i) in entries"
        :key="`${i}`"
        :class="item.method"
        class="entry"
      >
        {{ renderLog(item) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, PropType } from "vue"
import { getStyleInjector } from "@/services/style_injector"
import { Invocation } from "@/services/console_wrapper"
import styles from "./Logs.scss"

export default defineComponent({
  name: "LogsView",
  props: {
    entries: {
      type: Object as PropType<Invocation[]>,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })

    function renderLog(inv: Invocation): string {
      return inv.args.map(renderData).join(" ")
    }

    function renderData(data: any): string {
      return "" + data
    }

    return {
      renderLog,
    }
  },
})
</script>
