<script>
import { ref, toRefs, defineComponent } from 'vue' ;
import axios from "axios";

export default defineComponent({
  name: "MeasureElement",
  
  props: ["measureProp", "measureIndex", "uuid"],

  setup(props, {emit}) {
    /*
      toRefs returns an object containing refs with the values from the props
      to keep them reactive.
    */
    const {measureProp, measureIndex, uuid} = toRefs(props);

    function removeElement() {
      emit("removeelement-index", measureIndex.value);

      if (measureProp.value.measure == "Abstandsregeln") {
        axios
          .delete(`/api/simulation/${uuid.value}/measure/socialdistancing`)
          .catch(function (error) {
            console.log(error);
            return;
          });
        emit("toggle-social-distancing-button");
      } else if (measureProp.value.region == "country") {
        axios
          .delete(`/api/simulation/${uuid.value}/measure/countryrestrictions`, {
            params: {
              name: "deutschland",
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (measureProp.value.region == "state") {
        axios
          .delete(`/api/simulation/${uuid.value}/measure/staterestrictions`, {
            params: {
              name: measureProp.value.target,
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (measureProp.value.target == "city") {
        axios
          .delete(`/api/simulation/${uuid.value}/measure/cityrestrictions`, {
            params: {
              name: measureProp.value.target,
            },
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    };

    return {
      measureProp,
      measureIndex, 
      uuid,
      removeElement,
    };
  }
})
</script>

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

<style scoped>

</style>