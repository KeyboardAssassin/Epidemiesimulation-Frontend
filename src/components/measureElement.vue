<template>
  <div class="left">
    Art: {{ measureProp.measure }} <br />
    Ziel: {{ measureProp.target }} <br />
  </div>
  <div class="right">
    <q-btn color="negative" @click="removeElement()">Maßnahme beenden</q-btn>
  </div>
</template>

<script>
export default {
  name: "MeasureElement",
  props: ["measureProp", "measureIndex"],
  data() {
    return {
      measure: this.measuretype,
      target: this.measuretarget,
    };
  },
  methods: {
    removeElement() {
      this.$emit("removeelement-index", this.measureIndex);
    },
  },
};
</script>
