<template>
  <div>
    <h1>Activate License</h1>
    <p>Enter your license key to activate your license.</p>
    <input v-model="licenseKey" type="text" placeholder="Enter your license key" >
    <button @click="activateLicense">Activate License</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue"

export default defineComponent({
  name: "ActivateLicense",
  setup() {
    const state = reactive({
      licenseKey: "",
    })

    function activateLicense() {
      // TODO
    }

    return {
      ...toRefs(state),
      activateLicense,
    }
  },
})
</script>

