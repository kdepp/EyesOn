<template>
  <svg
    :width="size"
    :height="size"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    display="inline-block"
    vertical-align="middle"
  >
    <path fill="currentColor" d="M6 11V4l4.5 3.5z" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "TriangleRight",
  props: {
    color: {
      type: String,
      default: "currentColor",
    },
    size: {
      type: String,
      default: "1.2em",
    },
  },
})
</script>
