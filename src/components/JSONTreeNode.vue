<template>
  <div
    :style="nodeStyle"
    class="dumb-node"
    @click="onClick"
  >
    <triangle-right
      v-if="shouldShowTriangle"
      :style="triangleStyle"
      :size="triangleSize"
    />
    <template v-if="!node.root">
      <span :style="{ fontStyle: 'italic', fontWeight: 'bold' }">{{ node.key }}</span>
      <span>:&nbsp;</span>
    </template>
    <span>{{ describeJson(node.value) }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import type { PropType } from "vue"
import type { JSONNode } from "../common/json_node"
import { getChildrenOfNode, describeJson } from "../common/json_node"
import TriangleRight from "./icons/TriangleRight.vue"

export default defineComponent({
  name: "DumbNode",
  components: {
    TriangleRight,
  },
  props: {
    node: {
      type: Object as PropType<JSONNode>,
      required: true,
    },
    isUnfold: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    args: {
      type: Object,
      default: null,
    },
  },
  emits: ["select", "toggle"],
  setup(props, { emit }) {
    const triangleSize = "1.6em"
    const baseNodeStyle = { display: "flex", alignItems: "center" }
    const shouldShowTriangle = computed(() => {
      return getChildrenOfNode(props.node).length > 0
    })
    const nodeStyle = computed(() => {
      return shouldShowTriangle.value
        ? baseNodeStyle
        : {
            ...baseNodeStyle,
            paddingLeft: triangleSize,
          }
    })
    const triangleStyle = computed(() => {
      return {
        opacity: 0.5,
        cursor: "pointer",
        transition: "transform 0.3s",
        transform: props.isUnfold ? "rotate(90deg)" : "rotate(0deg)",
      }
    })

    function onClick() {
      emit("toggle")
    }

    return {
      shouldShowTriangle,
      triangleStyle,
      triangleSize,
      nodeStyle,
      describeJson,
      onClick,
    }
  },
})
</script>
