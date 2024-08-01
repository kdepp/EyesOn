<template>
  <x-tree
    :node="rootNode"
    :tree-node-component="JSONTreeNode"
    :unfold-ids="unfoldIds"
    :selected-ids="selectedIds"
    :check-node-selectable="checkNodeSelectable"
    :get-children="getChildrenOfNode"
    :get-id="getNodeID"
    @select="$emit('select', $event)"
    @toggle="$emit('toggle', $event)"
    @update-selected-ids="onUpdateSelected"
    @update-unfold-ids="onUpdateUnfold"
  />
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from "vue"
import type { PropType } from "vue"
import XTree from "./XTree.vue"
import JSONTreeNode from "./JSONTreeNode.vue"
import { Json, JSONNode, toNode } from "../common/json_node"
import { getChildrenOfNode, getNodeID } from "../common/json_node"

export default defineComponent({
  name: "JSONTree",
  components: {
    XTree,
  },
  props: {
    json: {
      type: [Object, Array, String, Number, Boolean] as PropType<Json>,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      unfoldIds: [] as string[],
      selectedIds: [] as string[],
    })

    const rootNode = computed(() => {
      return toNode(props.json)
    })

    function onUpdateSelected(selectedIds: string[]) {
      state.selectedIds = selectedIds
    }

    function onUpdateUnfold(unfoldIds: string[]) {
      state.unfoldIds = unfoldIds
    }

    function checkNodeSelectable(node: JSONNode) {
      return true
    }

    return {
      JSONTreeNode,
      ...toRefs(state),
      rootNode,
      onUpdateSelected,
      onUpdateUnfold,
      checkNodeSelectable,
      getChildrenOfNode,
      getNodeID,
    }
  },
})
</script>
