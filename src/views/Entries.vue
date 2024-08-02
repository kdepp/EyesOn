<template>
  <div
    v-if="enabled"
    class="logs-container"
  >
    <div class="entry-list">
      <div
        v-for="item in visibleEntries"
        :key="item.id"
        :class="item.method"
        class="entry"
      >
        <log-entry
          v-if="isLogEntry(item)"
          :invocation="item"
        />
        <request-entry
          v-else-if="isRequestEntry(item)"
          :invocation="item"
        />

        <multiply-icon
          size="1em"
          color="#fff"
          class="remove-btn"
          @click="removeEntry(item)"
        />
      </div>
    </div>
    <div class="entry-filter-list">
      <div
        v-for="filter in filters"
        :key="filter.name"
        :class="{ disabled: !filter.enabled, [filter.name]: true }"
        class="entry-filter"
        @click="toggleFilter(filter.name)"
        @dblclick="enableFilterOnly(filter.name)"
      >
        {{ filter.name }} ({{ filter.count }})
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, reactive } from "vue"
import { getStyleInjector } from "@/services/style_injector"
import type { Invocation, RequestKeyInfo, ResponseKeyInfo } from "@/services/types"
import MultiplyIcon from "@/components/icons/Multiply.vue"
import LogEntry from "@/components/LogEntry.vue"
import RequestEntry from "@/components/RequestEntry.vue"
import styles from "./Entries.scss"

type FilterData = {
  name: string
  enabled: boolean
  count: number
}

type FilterGroup =
  | string
  | {
      name: string
      filters: string[]
    }

export default defineComponent({
  name: "LogsView",
  components: {
    LogEntry,
    RequestEntry,
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
    const filterGroups: FilterGroup[] = [
      {
        name: "log",
        filters: ["log", "info"],
      },
      "debug",
      "warn",
      "error",
      {
        name: "request",
        filters: ["fetch", "xhr"],
      },
    ]
    const state = reactive({
      hiddenIds: {} as Record<string, boolean>,
      filterToggles: filterGroups.reduce((acc, filter) => {
        const name = typeof filter === "string" ? filter : filter.name
        acc[name] = true
        return acc
      }, {} as Record<string, boolean>),
    })

    const visibleEntries = computed(() => {
      return props.entries.filter((entry) => {
        if (state.hiddenIds[entry.id]) {
          return false
        }

        const filterGroupName = getFilterGroupName(entry.method)

        if (!filterGroupName) {
          return false
        }

        return !!state.filterToggles[filterGroupName]
      })
    })

    const filters = computed((): FilterData[] => {
      return filterGroups.map((g) => {
        const name = typeof g === "string" ? g : g.name
        const count =
          typeof g === "string"
            ? props.entries.filter((entry) => entry.method === g).length
            : g.filters.reduce((acc, filter) => {
                return acc + props.entries.filter((entry) => entry.method === filter).length
              }, 0)

        return {
          name,
          count,
          enabled: state.filterToggles[name],
        }
      })
    })

    onBeforeMount(() => {
      getStyleInjector().injectStyles(styles)
    })

    function renderEntry(inv: Invocation): string {
      switch (inv.method) {
        case "fetch":
        case "xhr":
          return renderRequestEntry(inv.args)

        default:
          return inv.args.map(renderData).join(" ")
      }
    }

    function renderRequestEntry(args: any[]): string {
      const request = args[0]?.request as RequestKeyInfo
      const response = args[1]?.response as ResponseKeyInfo | undefined
      let text = `${request.method.toUpperCase()} ${request.url}`

      if (response) {
        text += ` - ${response.code}`
      }

      return text
    }

    function renderData(data: any): string {
      return "" + data
    }

    function removeEntry(inv: Invocation): void {
      state.hiddenIds[inv.id] = true
    }

    function toggleFilter(name: string): void {
      state.filterToggles[name] = !state.filterToggles[name]
    }

    function enableFilterOnly(name: string): void {
      for (const groupName in state.filterToggles) {
        state.filterToggles[groupName] = groupName === name
      }
    }

    function getFilterGroupName(method: string): string | null {
      for (const group of filterGroups) {
        if (typeof group === "string") {
          if (group === method) {
            return group
          }
        } else {
          if (group.filters.indexOf(method) !== -1) {
            return group.name
          }
        }
      }

      return null
    }

    function isLogEntry(item: Invocation): boolean {
      return ["log", "info", "debug", "warn", "error"].indexOf(item.method) !== -1
    }

    function isRequestEntry(item: Invocation): boolean {
      return ["xhr", "fetch"].indexOf(item.method) !== -1
    }

    return {
      filters,
      visibleEntries,
      renderEntry,
      removeEntry,
      toggleFilter,
      enableFilterOnly,
      isLogEntry,
      isRequestEntry,
    }
  },
})
</script>
