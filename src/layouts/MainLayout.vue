<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <div class="title">Epidemie-Simulation</div>
          Tag: {{ day }}
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <q-tabs align="center">
        <q-route-tab to="states" label="Bundesländer" @click="fillStates()" />
        <q-route-tab to="cities" label="Städte" @click="fillCities()" />
      </q-tabs>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-table
        id="list"
        style="width: 100%"
        title="Bundesländer"
        dark
        :rows="rows"
        :columns="columns"
        row-key="name"
        color="amber"
        q-virtual-scroll--skip
        v-model:pagination="pagination"
        :key="componentKey"
      ></q-table>
    </q-drawer>

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Simulation erfolgreich gestartet!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container
      style="width: 60%; margin-right: 60%; margin-left: 40%; margin-top: 0"
    >
      <q-slider
        @change="changeSpeed(model)"
        class="q-mt-xl"
        v-model="model"
        color="blue"
        markers
        :marker-labels="fnMarkerLabel"
        :min="0"
        :max="10"
        :disable="!simulationstarted"
      />

      <div class="map">
        <img alt="Map of Germany" src="../assets/rsz_1germany.png" />
      </div>

      <br /><br />
      <div class="controlling">
        <q-btn
          :loading="submitting"
          id="simulation-button"
          label="Start Simulation"
          color="positive"
          @click="startSimulation()"
        />
      </div>
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="column-footer">Measures</div>
          <div class="column-footer">
            <q-btn color="black" label="Vaccination" />
          </div>
          <div class="column-footer">
            <q-btn color="black" label="Medicine" />
          </div>
          <div class="column-footer"><q-btn color="black" label="Masks" /></div>
          <div class="column-footer">
            <q-btn color="black" label="Distancing" />
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from "vue";
import axios from "axios";

const columns = [
  {
    name: "name",
    required: true,
    label: "Bundesland",
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "incidence",
    align: "center",
    label: "incidence",
    field: "incidence",
    sortable: true,
  },
];

let rows = [
  {
    name: "Bayern",
    incidence: 0,
  },
  {
    name: "Thüringen",
    incidence: 0,
  },
  {
    name: "Hessen",
    incidence: 0,
  },
  {
    name: "Baden-Württemberg",
    incidence: 0,
  },
  {
    name: "Sachsen",
    incidence: 0,
  },
  {
    name: "Niedersachsen",
    incidence: 0,
  },
  {
    name: "Rheinlandpfalz",
    incidence: 0,
  },
  {
    name: "Schleswigholstein",
    incidence: 0,
  },
  {
    name: "Saarland",
    incidence: 0,
  },
  {
    name: "Berlin",
    incidence: 0,
  },
  {
    name: "Brandenburg",
    incidence: 0,
  },
  {
    name: "Nordrhein-Westfahlen",
    incidence: 0,
  },
  {
    name: "Hamburg",
    incidence: 0,
  },
  {
    name: "Mecklenburg-Vorpommern",
    incidence: 0,
  },
  {
    name: "Bremen",
    incidence: 0,
  },
  {
    name: "Sachsenanzahlt",
    incidence: 0,
  },
];

export default {
  data() {
    return {
      submitting: false,
      simulationstarted: false,
      interval: 1500,
      day: 0,
      componentKey: 0,
      status: "states",
    };
  },
  setup() {
    const model = ref(2);
    const priceModel = ref(4);
    const rightDrawerOpen = ref(false);

    return {
      pagination: {
        rowsPerPage: 30, // current rows per page being displayed
      },
      alert: ref(false),
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
      address: ref(""),
      columns,
      rows,
      model,
      fnMarkerLabel: (val) => `${10 * val}%`,
      priceModel,
      priceLabel: computed(() => `$ ${priceModel.value}`),
    };
  },
  methods: {
    startSimulation() {
      axios.get("/api/startsimulation", "");
      this.submitting = true;
      this.simulationstarted = true;
      this.alert = true;
      this.getAllStates(this.interval);
    },
    getAllStates() {
      const parameter = new URLSearchParams();
      parameter.append("cityname", "erfurt");

      /*
      axios
        .get("/api/getincidence", {
          params: parameter,
        })
        .then((response) => (this.incidence_erfurt = response.data));
*/

      window.setInterval(() => {
        if ((this.status = "states")) {
          console.log(this.status);
          axios
            .get("/api/getincidenceofeverystate")
            .then((response) => (this.rows = response.data));
        } else {
          console.log(this.status);
          axios
            .get("/api/getincidenceofeverycity")
            .then((response) => (this.rows = response.data));
        }

        this.refreshDay();
        this.forceRerender();
      }, 1500);
    },
    refreshDay() {
      axios
        .get("/api/getcurrentday")
        .then((response) => (this.day = response.data));
    },
    forceRerender() {
      this.componentKey += 1;
    },
    changeSpeed(speed) {
      let newInterval = (11 - speed) * 400;
      this.interval = newInterval;
      axios.get("/api/changespeed?speed=" + newInterval);
    },
    fillStates() {
      this.status = "states";
    },
    fillCities() {
      this.status = "cities";
    },
  },
};
</script>
