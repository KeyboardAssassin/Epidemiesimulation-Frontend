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
      <div>
        <q-badge color="primary">Pause</q-badge>
      </div>
      <q-btn
        round
        color="negative"
        icon="pan_tool"
        @click="pauseSimulation(true)"
        :disable="!simulationstarted"
      />
    </q-page-sticky>

    <q-page-sticky position="left" style="width: 12%; height: 10%">
      <div>
        <q-badge color="primary">Weiter</q-badge>
      </div>
      <q-btn
        round
        color="positive"
        icon="done"
        @click="pauseSimulation(false)"
        :disable="!simulationstarted"
      />
    </q-page-sticky>

    <q-page-sticky position="left" style="width: 19.5%; height: 10%">
      <div>
        <q-badge color="primary">Beenden</q-badge>
      </div>
      <div>
        <q-btn
          round
          color="black"
          icon="logout"
          @click="endSimulation()"
          :disable="!simulationstarted"
          style="margin-left: 15%"
        />
      </div>
    </q-page-sticky>

    <q-dialog v-model="positiveAlert">
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

    <q-dialog v-model="negativeAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Fehler</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <center>Simulation wurde nicht gestartet!</center>
          Vermutlich läuft die Serveranwendung im Hintergrund nicht.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for contact restrictions (country) -->
    <q-dialog v-model="alertContactRestrictionsCountry">
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
            @click="startContactRestrictions('country')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for contact restrictions (state) -->
    <q-dialog v-model="alertContactRestrictionsState">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-card-section>
            Bitte den Namen des Bundeslandes eingeben:
          </q-card-section>
          <q-card-section>
            <q-input
              filled
              v-model="restrictionsInputState"
              label="Name des Bundeslandes"
              type="text"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            Wie lange sollen die Kontaktbeschränkungen anhalten?
          </q-card-section>
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
            @click="startContactRestrictions('state')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for contact restrictions (city) -->
    <q-dialog v-model="alertContactRestrictionsCity">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-card-section> Bitte den Namen der Stadt eingeben: </q-card-section>
          <q-input
            filled
            v-model="restrictionsInputCity"
            label="Name der Stadt"
            type="text"
          />
          <q-card-section class="q-pt-none">
            Wie lange sollen die Kontaktbeschränkungen anhalten?
          </q-card-section>
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
            @click="startContactRestrictions('city')"
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
          Abstandregeln dauerhaft beschlossen!
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
      style="width: 60%; margin-right: 60%; margin-left: 40%; margin-top: 0.5%"
    >
      <q-badge color="primary" style="margin-right: 60%">
        Geschwindkigkeit der Tage:
      </q-badge>
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
        style="margin-top: 1%"
      />

      <q-page-sticky position="left" style="width: 19%; height: 95%">
        <q-card style="background-color: #dcdcdc; height: 0%">
          <q-card-section>
            <pre>
              <text-body1>
    Deutschland
      Inzidenz: {{ countryIncidence }}
      R-Wert: {{ countryRValue }}
      Neuinfektionenen: {{ countryNewInfections }}
      Todesfälle: {{ countryDeadCases }}

    Maßnahmen
      Impfstoff:    <span v-if="vaccinationstatuscode == 0" style="color:red">{{ vaccinationstatus }}</span>
                    <span v-else-if="vaccinationstatuscode == 1" style="color:orange">{{ vaccinationstatus }}</span>
                    <span v-else-if="vaccinationstatuscode == 2 || vaccinationstatuscode == 3" style="color:green">{{ vaccinationstatus }}</span>
      Medikamente:  <span v-if="medicationstatuscode == 0" style="color:red">{{ medicationstatus }}</span>
                    <span v-else-if="medicationstatuscode == 1" style="color:orange">{{ medicationstatus }}</span>
                    <span v-else-if="medicationstatuscode == 2 || medicationstatuscode == 3" style="color:green">{{ medicationstatus }}</span>

                    <deathChart ref="deathChartRef"></deathChart>
                </text-body1>
              </pre>
          </q-card-section>
        </q-card>
      </q-page-sticky>

      <div class="map">
        <img
          v-if="status == 'states'"
          alt="Map of Germany"
          src="../assets/states.png"
        />
        <img
          v-if="status == 'cities'"
          alt="Map of Germany"
          src="../assets/cities.png"
        />
      </div>

      <br />
      <div v-if="!simulationstarted" class="controlling">
        <q-btn
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
              color="primary"
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
              color="primary"
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
            <q-btn-dropdown
              color="primary"
              label="Kontaktbeschränkungen"
              :disable="!simulationstarted"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="this.alertContactRestrictionsCountry = true"
                >
                  <q-item-section>
                    <q-item-label>Gesamtes Land</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="this.alertContactRestrictionsState = true"
                >
                  <q-item-section>
                    <q-item-label>Für ein Bundesland</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="this.alertContactRestrictionsCity = true"
                >
                  <q-item-section>
                    <q-item-label>Einzelne Stadt</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div class="column-footer">
            <q-btn
              color="primary"
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
import { defineAsyncComponent } from "vue";
import axios from "axios";

let deathChart = defineAsyncComponent(() =>
  import("components/charts/deathChart.vue")
);

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
      backendUuid: "",
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
      negativeAlert: ref(false),
      positiveAlert: ref(false),
      simulationPaused: ref(false),
      alertContactRestrictionsCountry: ref(false),
      alertContactRestrictionsState: ref(false),
      alertContactRestrictionsCity: ref(false),
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
      axios
        .post("/api/startsimulation")
        .then((res) => {
          if ((res.status = 200)) {
            this.simulationstarted = true;
            this.positiveAlert = true;
            this.submitting = true;
            this.backendUuid = res.data;
          }
        })
        .catch((err) => {
          this.negativeAlert = true;
          return;
        });

      this.getAllStates(this.interval);
    },
    getAllStates() {
      let intervalObj = window.setInterval(() => {
        if (!this.simulationPaused) {
          if (this.status == "states") {
            axios
              .get("/api/getincidenceofeverystate", {
                params: {
                  uuid: this.backendUuid,
                },
              })
              .then((response) => (this.rows = response.data))
              .catch(function (error) {
                console.log(error);
                clearInterval(intervalObj);
                return;
              });
          } else if (this.status == "cities") {
            axios
              .get("/api/getincidenceofeverycity", {
                params: {
                  uuid: this.backendUuid,
                },
              })
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
        }
      }, this.interval);
    },
    refreshDay() {
      axios
        .get("/api/getcurrentday", {
          params: {
            uuid: this.backendUuid,
          },
        })
        .then((response) => (this.day = response.data));
    },
    forceRerender() {
      this.componentKey += 1;
    },
    changeSpeed(speed) {
      let newInterval = (11 - speed) * 400;
      this.interval = newInterval;
      axios.get("/api/changespeed", {
        params: {
          speed: newInterval,
          uuid: this.backendUuid,
        },
      });
    },
    fillStates() {
      this.status = "states";
    },
    fillCities() {
      this.status = "cities";
    },
    updateCountryInfoBox() {
      axios
        .get("/api/getcountrysummary", {
          params: {
            uuid: this.backendUuid,
          },
        })
        .then((res) => {
          this.countryIncidence = res.data.incidence;
          this.countryRValue = res.data.rValue;
          this.countryNewInfections = res.data.newInfections;
          this.countryDeadCases = res.data.newDeathCases;
          this.vaccinationdeveloped = res.data.vaccinationDeveloped;
          this.medicationdeveloped = res.data.medicationDeveloped;

          this.$refs.deathChartRef.appendDeathList(
            this.countryDeadCases,
            this.countryNewInfections
          );
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
        axios
          .get("/api/startvaccinationdevelopment", {
            params: {
              uuid: this.backendUuid,
            },
          })
          .then((res) => {
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
        axios
          .get("/api/startmedicationdevelopment", {
            params: {
              uuid: this.backendUuid,
            },
          })
          .then((res) => {
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
      axios
        .get("/api/startvaccination", {
          params: {
            uuid: this.backendUuid,
          },
        })
        .then((res) => {
          this.vaccinationstatus = "Impfkampagne läuft!";
          this.vaccinationbuttonloading = true;
        });
    },
    startMedicationUsage() {
      this.medicationusage = true;
      axios
        .get("/api/startmedication", {
          params: {
            uuid: this.backendUuid,
          },
        })
        .then((res) => {
          this.medicationstatus = "Medizin wird eingesetzt!";
          this.medicationbuttonloading = true;
        });
    },
    startContactRestrictions(type) {
      if (type == "country") {
        axios.get("/api/activatecontactrestrictions", {
          params: {
            type: type,
            name: "deutschland",
            amountofdays: this.restrictionsInput,
            uuid: this.backendUuid,
          },
        });
      } else if (type == "state") {
        axios.get("/api/activatecontactrestrictions", {
          params: {
            type: type,
            name: this.restrictionsInputState,
            amountofdays: this.restrictionsInput,
            uuid: this.backendUuid,
          },
        });
      } else if (type == "city") {
        axios.get("/api/activatecontactrestrictions", {
          params: {
            type: type,
            name: this.restrictionsInputCity,
            amountofdays: this.restrictionsInput,
            uuid: this.backendUuid,
          },
        });
      }
    },
    startSocialDistancingAlert() {
      this.alertSocialDistancing = true;
    },
    startSocialDistancing() {
      axios.get("/api/activatesocialdistancing", {
        params: {
          uuid: this.backendUuid,
        },
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
      axios.get("/api/pausesimulation", {
        params: {
          pause: pause,
          uuid: this.backendUuid,
        },
      });
      this.simulationPaused = pause;
    },
    endSimulation() {
      location.reload();
      axios.get("/api/endsimulation", {
        params: {
          uuid: this.backendUuid,
        },
      });
      this.pauseSimulation(false);
    },
  },
  components: {
    deathChart,
  },
};
</script>
