<template>
  <div class="left">
    <div class="measurebox">
      Art: {{ measureProp.measure }} <br />
      Ziel: {{ measureProp.target }} <br />
      <div v-if="measureProp.daysLeft != -1">
        Tage noch aktiv: {{ measureProp.daysLeft }}
      </div>
    </div>
  </div>
  <div class="right">
    <q-btn color="negative" @click="removeElement()">Maßnahme beenden</q-btn>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MeasureElement",
  props: ["measureProp", "measureIndex", "uuid"],
  data() {
    return {
      measure: this.measuretype,
      target: this.measuretarget,
    };
  },
  methods: {
    removeElement() {
      this.$emit("removeelement-index", this.measureIndex);

      console.log(this.measureProp.region);

      if (this.measureProp.measure == "Abstandsregeln") {
        axios
          .delete(`/api/simulation/${this.uuid}/measure/socialdistancing`)
          .catch(function (error) {
            console.log(error);
          });
      } else if (this.measureProp.region == "country") {
        axios
          .delete(`/api/simulation/${this.uuid}/measure/countryrestrictions`, {
            params: {
              name: "deutschland",
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (this.measureProp.region == "state") {
        axios
          .delete(`/api/simulation/${this.uuid}/measure/staterestrictions`, {
            params: {
              name: this.measureProp.target,
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (this.measureProp.target == "city") {
        axios
          .delete(`/api/simulation/${this.uuid}/measure/cityrestrictions`, {
            params: {
              name: this.measureProp.target,
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
  },
};
</script>
