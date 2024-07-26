<template>
  <div class="logs-container">
    <h3>Logs</h3>
    <div class="log-list">
      <div v-for="(item, i) in logs" :key="`${i}`" class="log">
        {{ JSON.stringify(item) }}
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
    logs: {
      type: Object as PropType<Invocation[]>,
      required: true,
    },
  },
  setup(props) {
    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })
  },
})
</script>
