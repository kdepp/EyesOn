<template>
  <div
    v-if="enabled"
    class="logs-container"
  >
    <h3>Logs</h3>
    <div class="entry-list">
      <div
        v-for="(item, i) in visibleEntries"
        :key="item.id"
        :class="item.method"
        class="entry"
      >
        <div>{{ renderEntry(item) }}</div>
        <multiply-icon
          size="1em"
          color="#fff"
          class="remove-btn"
          @click="removeEntry(item)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, reactive } from "vue"
import { getStyleInjector } from "@/services/style_injector"
import { Invocation } from "@/services/console_wrapper"
import MultiplyIcon from "@/components/icons/Multiply.vue"
import styles from "./Logs.scss"

export default defineComponent({
  name: "LogsView",
  components: {
    MultiplyIcon,
  },
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
  setup(props) {
    const state = reactive({
      hiddenIds: {} as Record<string, boolean>,
    })

    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })

    const visibleEntries = computed(() => {
      return props.entries.filter((entry) => !state.hiddenIds[entry.id])
    })

    function renderEntry(inv: Invocation): string {
      return inv.args.map(renderData).join(" ")
    }

    function renderData(data: any): string {
      return "" + data
    }

    function removeEntry(inv: Invocation): void {
      state.hiddenIds[inv.id] = true
    }

    return {
      visibleEntries,
      renderEntry,
      removeEntry,
    }
  },
})
</script>
