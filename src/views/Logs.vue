<template>
  <div class="logs-container">LOGS TODO</div>
</template>

<script lang="ts">
import { getStyleInjector } from "@/services/style_injector"
import { defineComponent, onBeforeMount } from "vue"
import styles from "./Logs.scss"

export default defineComponent({
  name: "LogsView",
  setup() {
    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })
  }
})
</script>
