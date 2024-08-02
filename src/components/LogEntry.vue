<template>
  <div class="log-entry">
    <div
      v-for="(group, i) in groups"
      :key="`${i}`"
      :class="group.type"
      class="arg-group"
    >
      <span v-if="group.type === 'stringlike'">
        {{ group.content.join(" ") }}
      </span>
      <json-tree
        v-else-if="group.type === 'json'"
        :json="group.content"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue"
import type { Invocation } from "@/services/types"
import JsonTree from "@/components/JsonTree.vue"
import { isPlainObject } from "@/common/is_plain_object"

type GroupType = "stringlike" | "json"

type GroupTypeContent = {
  stringlike: string[]
  json: Array<any> | Record<string, any>
}

type LogGroup<T extends GroupType = GroupType> = {
  type: T
  content: GroupTypeContent[T]
}

export default defineComponent({
  name: "LogEntry",
  components: {
    JsonTree,
  },
  props: {
    invocation: {
      type: Object as PropType<Invocation>,
      required: true,
    },
  },
  setup(props) {
    const groups = computed((): LogGroup[] => {
      const { args } = props.invocation
      const groups: LogGroup[] = []
      let lastStringLikeGroup: LogGroup<"stringlike"> | null = null

      for (const arg of args) {
        if (Array.isArray(arg) || isPlainObject(arg)) {
          lastStringLikeGroup = null

          groups.push({
            type: "json",
            content: arg,
          } as LogGroup<"json">)

          continue
        }

        if (lastStringLikeGroup === null) {
          lastStringLikeGroup = {
            type: "stringlike",
            content: [],
          }

          groups.push(lastStringLikeGroup)
        }

        lastStringLikeGroup.content.push(`${arg}`)
      }

      return groups
    })

    return {
      groups,
    }
  },
})
</script>
