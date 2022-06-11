<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <center>Epidemie-Simulation</center>
          Tag: {{ day }}
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <q-tabs align="center">
        <q-route-tab to="/states" label="Bundesländer" />
        <q-route-tab to="/cities" label="Städte" />
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

    <q-page-container>
      <div class="q-px-lg q-pt-md q-pb-xl">
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
      </div>

      <center>
        <img alt="Map of Germany" src="../assets/rsz_1germany.png" />
      </center>
      <br /><br />
      <center>
        <q-btn
          :loading="submitting"
          id="simulation-button"
          label="Start Simulation"
          color="positive"
          @click="startSimulation()"
        />
      </center>
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
      incidence_thüringen: 0,
      incidence_bayern: 0,
      incidence_hessen: 0,
      incidence_baden_württembe: 0,
      incidence_sachsen: 0,
      incidence_niedersachsen: 0,
      incidence_rheinland_pfalz: 0,
      incidence_schleswig_holst: 0,
      incidence_saarland: 0,
      incidence_berlin: 0,
      incidence_brandenburg: 0,
      incidence_bremen: 0,
      incidence_nordrhein_westf: 0,
      incidence_hamburg: 0,
      incidence_mecklenburg_vor: 0,
      incidence_sachsen_anhalt: 0,
      day: 0,
      componentKey: 0,
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
      this.startInterval();
      this.submitting = true;
      this.simulationstarted = true;
      this.alert = true;
      this.getAllStates(this.interval);
      this.enableSlider();
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
        axios
          .get("/api/getincidencebystate?statename=thüringen", "")
          .then((response) => (this.incidence_thüringen = response.data));
        axios
          .get("/api/getincidencebystate?statename=bayern", "")
          .then((response) => (this.incidence_bayern = response.data));
        axios
          .get("/api/getincidencebystate?statename=hessen", "")
          .then((response) => (this.incidence_hessen = response.data));
        axios
          .get("/api/getincidencebystate?statename=baden-württemberg", "")
          .then((response) => (this.incidence_baden_württembe = response.data));
        axios
          .get("/api/getincidencebystate?statename=sachsen", "")
          .then((response) => (this.incidence_sachsen = response.data));
        axios
          .get("/api/getincidencebystate?statename=niedersachsen", "")
          .then((response) => (this.incidence_niedersachsen = response.data));
        axios
          .get("/api/getincidencebystate?statename=rheinland-pfalz", "")
          .then((response) => (this.incidence_rheinland_pfalz = response.data));
        axios
          .get("/api/getincidencebystate?statename=schleswig-holstein", "")
          .then((response) => (this.incidence_schleswig_holst = response.data));
        axios
          .get("/api/getincidencebystate?statename=saarland", "")
          .then((response) => (this.incidence_saarland = response.data));
        axios
          .get("/api/getincidencebystate?statename=berlin", "")
          .then((response) => (this.incidence_berlin = response.data));
        axios
          .get("/api/getincidencebystate?statename=brandenburg", "")
          .then((response) => (this.incidence_brandenburg = response.data));
        axios
          .get("/api/getincidencebystate?statename=bremen", "")
          .then((response) => (this.incidence_bremen = response.data));
        axios
          .get("/api/getincidencebystate?statename=nordrhein-westfahlen", "")
          .then((response) => (this.incidence_nordrhein_westf = response.data));
        axios
          .get("/api/getincidencebystate?statename=hamburg", "")
          .then((response) => (this.incidence_hamburg = response.data));
        axios
          .get("/api/getincidencebystate?statename=mecklenburg-vorpommern", "")
          .then((response) => (this.incidence_mecklenburg_vor = response.data));
        axios
          .get("/api/getincidencebystate?statename=sachsen-anhalt", "")
          .then((response) => (this.incidence_sachsen_anhalt = response.data));

        this.refreshList();
        this.refreshDay();
        this.forceRerender();
      }, 1500);
    },
    startInterval() {},
    refreshList() {
      console.log("refreshed List");

      this.rows = [
        {
          name: "Bayern",
          incidence: this.incidence_bayern,
        },
        {
          name: "Thüringen",
          incidence: this.incidence_thüringen,
        },
        {
          name: "Hessen",
          incidence: this.incidence_hessen,
        },
        {
          name: "Baden-Württemberg",
          incidence: this.incidence_baden_württembe,
        },
        {
          name: "Sachsen",
          incidence: this.incidence_sachsen,
        },
        {
          name: "Niedersachsen",
          incidence: this.incidence_niedersachsen,
        },
        {
          name: "Rheinlandpfalz",
          incidence: this.incidence_rheinland_pfalz,
        },
        {
          name: "Schleswigholstein",
          incidence: this.incidence_schleswig_holst,
        },
        {
          name: "Saarland",
          incidence: this.incidence_saarland,
        },
        {
          name: "Berlin",
          incidence: this.incidence_berlin,
        },
        {
          name: "Brandenburg",
          incidence: this.incidence_brandenburg,
        },
        {
          name: "Nordrhein-Westfahlen",
          incidence: this.incidence_nordrhein_westf,
        },
        {
          name: "Hamburg",
          incidence: this.incidence_hamburg,
        },
        {
          name: "Mecklenburg-Vorpommern",
          incidence: this.incidence_mecklenburg_vor,
        },
        {
          name: "Bremen",
          incidence: this.incidence_bremen,
        },
        {
          name: "Sachsenanhalt",
          incidence: this.incidence_sachsen_anhalt,
        },
      ];
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
    enableSlider() {},
  },
};
</script>
