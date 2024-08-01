<template>
  <div class="x-tree">
    <div class="tree-node">
      <component
        :is="treeNodeComponent"
        v-if="treeNodeComponent"
        :is-unfold="isUnfold"
        :is-selected="isSelected"
        :node="node"
        :args="treeNodeArgs"
        @select="onSelectSelf"
        @toggle="onToggleSelf"
      />
    </div>
    <div
      v-if="childNodes && childNodes.length > 0 && (renderFoldNodes || isUnfold)"
      v-show="isUnfold"
      :style="childStyles"
      class="tree-children"
    >
      <x-tree
        v-for="subnode in childNodes"
        :key="extractID(subnode)"
        :node="subnode"
        :tree-node-component="treeNodeComponent"
        :tree-node-args="treeNodeArgs"
        :unfold-ids="unfoldIds"
        :selected-ids="selectedIds"
        :get-children="getChildren"
        :get-id="getId"
        :is-root="false"
        :render-fold-nodes="renderFoldNodes"
        :unfold-all="unfoldAll"
        @select="onSelectSubnode"
        @toggle="onToggleSubnode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { defineComponent, computed } from "vue"

export type Tree<T extends object = object> = T & {
  children: Tree<T>[]
}

export enum SelectEffectType {
  Unfold,
  Toggle,
  None,
}

export enum ToggleEffectType {
  Select,
  None,
}

export default defineComponent({
  name: "XTree",
  components: {
    TreeNode: function (resolve) {
      resolve(this.treeNodeComponent)
    },
  },
  props: {
    node: {
      type: Object, // Tree data
      required: true,
    },
    treeNodeComponent: {
      type: Object,
      required: true,
    },
    getChildren: {
      type: [String, Function] as PropType<string | ((node: any) => any[])>,
      default: "children",
    },
    getId: {
      type: [String, Function] as PropType<string | ((node: any) => string)>,
      default: "id",
    },
    isRoot: {
      type: Boolean,
      default: true,
    },
    unfoldIds: {
      type: Array, // Array of tree ids
      default: () => [],
    },
    selectedIds: {
      type: Array, // Array of tree ids
      default: () => [],
    },
    treeNodeArgs: {
      type: Object,
      default: null,
    },
    selectEffect: {
      type: Number,
      default: SelectEffectType.Unfold,
    },
    toggleEffect: {
      type: Number,
      default: ToggleEffectType.Select,
    },
    checkNodeSelectable: {
      type: Function,
      default: () => true,
    },
    renderFoldNodes: {
      type: Boolean,
      default: false,
    },
    unfoldAll: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["select", "toggle", "update-selected-ids", "update-unfold-ids"],
  setup(props, { emit }) {
    const childStyles = {
      paddingLeft: "1.3em",
    }
    const childNodes = computed(() => {
      if (typeof props.getChildren === "string") {
        return props.node[props.getChildren] ?? []
      } else {
        return props.getChildren(props.node) ?? []
      }
    })
    const id = computed(() => {
      return extractID(props.node)
    })
    const isUnfold = computed((): boolean => {
      return props.unfoldAll || props.unfoldIds.indexOf(id.value) !== -1
    })
    const isSelected = computed((): boolean => {
      return props.selectedIds.indexOf(id.value) !== -1
    })

    function extractID(node: any) {
      if (typeof props.getId === "string") {
        return node[props.getId]
      } else {
        return props.getId(node)
      }
    }

    function onSelect(node: any) {
      if (!props.checkNodeSelectable(node)) {
        return
      }

      emit("select", node)
      emit("update-selected-ids", [extractID(node)])
    }

    function onToggle(data: any) {
      emit("toggle", data)

      const list = props.unfoldIds
      const newList = (() => {
        if (data.isUnfold) {
          return [...list, data.id]
        } else {
          return list.filter((id) => id !== data.id)
        }
      })()

      emit("update-unfold-ids", newList)
    }

    function onSelectSelf(manual?: boolean) {
      onSelect(props.node)

      if (manual) {
        return
      }

      switch (props.selectEffect) {
        case SelectEffectType.Unfold:
          return onToggleSelf(true, true)

        case SelectEffectType.Toggle:
          return onToggleSelf(undefined, true)

        default:
          break
      }
    }

    function onToggleSelf(forceValue?: boolean, manual?: boolean) {
      onToggle({
        id: id.value,
        node: props.node,
        isUnfold: forceValue !== undefined ? forceValue : !isUnfold.value,
      })

      if (manual) {
        return
      }

      if (props.toggleEffect === ToggleEffectType.Select) {
        onSelectSelf(true)
      }
    }

    function onSelectSubnode(node: any) {
      onSelect(node)
    }

    function onToggleSubnode(data: { id: string; node: any; isUnfold: boolean }) {
      onToggle(data)
    }

    return {
      childStyles,
      childNodes,
      id,
      isUnfold,
      isSelected,
      extractID,
      onSelect,
      onToggle,
      onSelectSelf,
      onToggleSelf,
      onSelectSubnode,
      onToggleSubnode,
    }
  },
})
</script>
