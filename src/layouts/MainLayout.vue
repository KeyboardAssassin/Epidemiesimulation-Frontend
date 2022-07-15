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
        <q-route-tab
          to="states"
          label="Bundesländer"
          @click="fillStates()"
          :disable="!simulationstarted"
        />
        <q-route-tab
          to="cities"
          label="Städte"
          @click="fillCities()"
          :disable="!simulationstarted"
        />
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

    <q-page-sticky position="left" style="width: 5%; height: 10%">
      <q-btn
        round
        color="negative"
        icon="pan_tool"
        @click="pauseSimulation(true)"
        :disable="!simulationstarted"
      />
    </q-page-sticky>

    <q-page-sticky position="left" style="width: 10%; height: 10%">
      <q-btn
        round
        color="positive"
        icon="done"
        @click="pauseSimulation(false)"
        :disable="!simulationstarted"
      />
    </q-page-sticky>

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

    <q-dialog v-model="alertContactRestrictions">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Wie lange sollen die Kontaktbeschränkungen anhalten?
          <q-input
            filled
            v-model="restrictionsInput"
            label="Anzahl an Tagen"
            type="number"
            :rules="[(val) => val <= 2 || 'Bitte maximal zweistellig!']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            v-close-popup
            @click="startContactRestrictions()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="alertSocialDistancing">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Wie lange sollen die Abstandsregeln gelten?
          <q-input
            filled
            v-model="distancingInput"
            label="Anzahl an Tagen"
            :rules="[(val) => val <= 2 || 'Bitte maximal zweistellig!']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            v-close-popup
            @click="startSocialDistancing()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="alertMedicationDevelopment">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Medikamentenentwicklung gestartet!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="alertVaccinationDevelopment">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Impfstoffentwicklung gestartet!
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

      <q-page-sticky position="left" style="width: 15%">
        <q-card>
          <q-card-section>
            <pre>
              Deutschland
                Inzidenz: {{ countryIncidence }}
                R-Wert: {{ countryRValue }}
                Neuinfektionenen: {{ countryNewInfections }}
                Todesfälle: {{ countryDeadCases }}

              Maßnahmen
                Impfstoff:   <span v-if="vaccinationstatuscode == 0" style="color:red">{{ vaccinationstatus }}</span>
                             <span v-else-if="vaccinationstatuscode == 1" style="color:orange">{{ vaccinationstatus }}</span>
                             <span v-else-if="vaccinationstatuscode == 2 || vaccinationstatuscode == 3" style="color:green">{{ vaccinationstatus }}</span>
                Medikamente: <span v-if="medicationstatuscode == 0" style="color:red">{{ medicationstatus }}</span>
                             <span v-else-if="medicationstatuscode == 1" style="color:orange">{{ medicationstatus }}</span>
                             <span v-else-if="medicationstatuscode == 2 || medicationstatuscode == 3" style="color:green">{{ medicationstatus }}</span>
              </pre>
          </q-card-section>
        </q-card>
      </q-page-sticky>

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
          <div class="column-footer">Maßnahmen</div>
          <div class="column-footer">
            <q-btn
              v-if="
                this.vaccinationstatuscode == 0 ||
                this.vaccinationstatuscode == 1
              "
              id="vaccinationButton"
              :loading="vaccinationbuttonloading"
              color="black"
              label="Start der Impfstoffentwicklung"
              @click="activateVaccinationButton()"
              :disable="!simulationstarted"
            />
            <q-btn
              v-if="this.vaccinationstatuscode == 2"
              id="vaccinationButton"
              :loading="vaccinationbuttonloading"
              color="green"
              label="Start der Impfkamagne"
              @click="activateVaccinationButton()"
              :disable="!simulationstarted"
            />
          </div>
          <div class="column-footer">
            <q-btn
              v-if="
                this.medicationstatuscode == 0 || this.medicationstatuscode == 1
              "
              :id="medicationButton"
              :loading="medicationbuttonloading"
              color="black"
              label="Start der Medikamentenentwicklung"
              @click="activateMedicationButton()"
              :disable="!simulationstarted"
            />
            <q-btn
              v-if="this.medicationstatuscode == 2"
              :id="medicationButton"
              :loading="medicationbuttonloading"
              color="green"
              label="Start der Medikamentenkampagne"
              @click="activateMedicationButton()"
              :disable="!simulationstarted"
            />
          </div>
          <div class="column-footer">
            <q-btn
              color="black"
              label="Kontaktbeschränkung erlassen"
              @click="startContactRestrictionsAlert()"
              :disable="!simulationstarted"
            />
          </div>
          <div class="column-footer">
            <q-btn
              color="black"
              label="Abstandsregeln erlassen"
              @click="startSocialDistancingAlert()"
              :disable="!simulationstarted"
            />
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
    label: "Bundesland/Stadt",
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
    name: "Nordrhein-Westfalen",
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
    name: "Sachsenanhalt",
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
      countryIncidence: 0,
      countryRValue: 0,
      countryNewInfections: 0,
      countryDeadCases: 0,
      vaccinationstatus: "Nicht entwickelt",
      medicationstatus: "Nicht entwickelt",
      vaccinationstatuscode: 0,
      medicationstatuscode: 0,
      vaccinationbuttonloading: false,
      medicationbuttonloading: false,
      vaccinationdeveloped: false,
      medicationdeveloped: false,
      vaccinationusage: false,
      medicationusage: false,
      amountOfDaysContactRestrictions: 0,
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
      alertContactRestrictions: ref(false),
      alertSocialDistancing: ref(false),
      alertMedicationDevelopment: ref(false),
      alertVaccinationDevelopment: ref(false),
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
      let intervalObj = window.setInterval(() => {
        if (this.status == "states") {
          axios
            .get("/api/getincidenceofeverystate")
            .then((response) => (this.rows = response.data))
            .catch(function (error) {
              console.log(error);
              clearInterval(intervalObj);
              return;
            });
        } else if (this.status == "cities") {
          axios
            .get("/api/getincidenceofeverycity")
            .then((response) => (this.rows = response.data))
            .catch(function (error) {
              console.log(error);
              clearInterval(intervalObj);
              return;
            });
        }

        this.updateCountryInfoBox();
        this.refreshDay();
        this.checkIfMeasureIsDeveloped();
        this.forceRerender();
      }, this.interval);
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
      console.log("Changed status to: " + this.status);
    },
    fillCities() {
      this.status = "cities";
      console.log("Changed status to: " + this.status);
    },
    updateCountryInfoBox() {
      axios
        .get("/api/getcountrysummary")
        .then((res) => {
          this.countryIncidence = res.data.incidence;
          this.countryRValue = res.data.rValue;
          this.countryNewInfections = res.data.newInfections;
          this.countryDeadCases = res.data.newDeathCases;
          this.vaccinationdeveloped = res.data.vaccinationDeveloped;
          this.medicationdeveloped = res.data.medicationDeveloped;
        })
        .catch(function (error) {
          console.log(error);
          clearInterval(intervalObj);
          return;
        });
    },
    activateVaccinationButton() {
      if (this.vaccinationstatuscode == 0) {
        this.alertVaccinationDevelopment = true;
        axios.get("/api/startvaccinationdevelopment", "").then((res) => {
          this.vaccinationstatus = "In Entwicklung!";
          this.vaccinationstatuscode = 1;
          this.vaccinationbuttonloading = true;
        });
      }

      if (this.vaccinationstatuscode == 2) {
        this.startVaccinationUsage();
        this.vaccinationstatuscode = 3;
      }
    },
    activateMedicationButton() {
      if (this.medicationstatuscode == 0) {
        this.alertMedicationDevelopment = true;
        axios.get("/api/startmedicationdevelopment", "").then((res) => {
          this.medicationstatus = "In Entwicklung!";
          this.medicationstatuscode = 1;
          this.medicationbuttonloading = true;
        });
      }

      if (this.medicationstatuscode == 2) {
        this.startMedicationUsage();
        this.medicationstatuscode = 3;
        this.medicationstatus = "Medizin wird eingesetzt!";
      }
    },
    startVaccinationUsage() {
      this.vaccinationusage = true;
      axios.get("/api/startvaccination", "").then((res) => {
        this.vaccinationstatus = "Impfkampagne läuft!";
        this.vaccinationbuttonloading = true;
      });
    },
    startMedicationUsage() {
      this.medicationusage = true;
      axios.get("/api/startmedication", "").then((res) => {
        this.medicationstatus = "Medizin wird eingesetzt!";
        this.medicationbuttonloading = true;
      });
    },
    startContactRestrictionsAlert() {
      this.alertContactRestrictions = true;
    },
    startContactRestrictions() {
      axios.get("/api/startcontactrestrictions", {
        params: { duration: this.restrictionsInput },
      });
    },
    startSocialDistancingAlert() {
      this.alertSocialDistancing = true;
    },
    startSocialDistancing() {
      axios.get("/api/startsocialdistancing", {
        params: { duration: this.distancingInput },
      });
    },
    checkIfMeasureIsDeveloped() {
      if (
        this.vaccinationdeveloped &&
        !this.vaccinationusage &&
        this.vaccinationstatuscode == 1
      ) {
        this.vaccinationstatus = "Entwickelt!";
        this.vaccinationstatuscode = 2;
        this.vaccinationbuttonloading = false;
      }
      if (
        this.medicationdeveloped &&
        !this.medicationusage &&
        this.medicationstatuscode == 1
      ) {
        this.medicationstatus = "Entwickelt!";
        this.medicationstatuscode = 2;
        this.medicationbuttonloading = false;
      }
    },
    pauseSimulation(pause) {
      if (pause) {
        axios.get("/api/pausesimulation?pause=true", "");
      } else if (!pause) {
        axios.get("/api/pausesimulation?pause=false", "");
      }
    },
  },
};
</script>
