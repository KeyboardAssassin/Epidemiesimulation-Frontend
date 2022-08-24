import { ref, computed } from 'vue';
import axios from 'axios';
import {useNotify} from 'src/composables/use-notify'

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
    label: "Inzidenz",
    field: "incidence",
    sortable: true,
  },
];

let map = new Map();

map.set("bayern", ["ingolstadt", "nürnberg", "münchen"]);
map.set("thüringen", ["erfurt", "jena"]);
map.set("hessen", ["frankfurt", "wiesbaden"]);
map.set("baden-württemberg", ["stuttgart", "mannheim"]);
map.set("sachsen", ["dresden", "leipzig"]);
map.set("niedersachsen", ["hannover", "braunschweig"]);
map.set("rheinland-pfalz", ["mainz", "ludwigshafen"]);
map.set("schleswig-holstein", ["kiel", "lübeck"]);
map.set("saarland", ["saarbrücken", "neunkirchen"]);
map.set("berlin", ["berlin"]);
map.set("brandenburg", ["potsdam", "cottbus"]);
map.set("bremen", ["bremen"]);
map.set("nordrhein-westfahlen", ["düsseldorf", "köln"]);
map.set("hamburg", ["hamburg"]);
map.set("mecklenburg-vorpommern", ["schwerin", "rostock"]);
map.set("sachsenanhalt", ["halle", "magdeburg"]);



let rows = ref([
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
]);


export const useMain = () => {
  // Props
  const { notifyError, notifySuccess } = useNotify();
  const restrictionsInputName = ref('');
  const medicationButton = 'medication-button';
  const deathChartRef = ref(null);
  const model = ref(4);
  const priceModel = ref(4);
  const rightDrawerOpen = ref(false);
  const newMeasure = ref("");
  const submitting = ref(false);
  const simulationStarted = ref(false);
  const simulationEnded = ref(false);
  const interval = ref(3000);
  const day = ref(0);
  const componentKey = ref(0);
  const status = ref("states");
  const countryIncidence = ref(0);
  const countryRValue = ref(0);
  const countryNewInfections = ref(0);
  const countryDeadCases = ref(0);
  const vaccinationStatus = ref("Nicht entwickelt");
  const medicationStatus = ref("Nicht entwickelt");
  const vaccinationStatusCode = ref(0);
  const medicationStatusCode = ref(0);
  const vaccinationButtonLoading = ref(false);
  const medicationButtonLoading = ref(false);
  const vaccinationDeveloped = ref(false);
  const medicationDeveloped = ref(false);
  const vaccinationUsage = ref(false);
  const medicationUsage = ref(false);
  const virusName = ref("Alpha");
  const virusLethality = ref("0.9");
  const backendStopped = ref(false);
  const amountOfDaysContactRestrictions = ref(0);
  const backendUuid = ref("");
  const restrictionsInputState = ref("");
  const restrictionsInput = ref(0);
  const obedience = ref(1);
  const obedienceColor = ref("positive");
  const measureList = ref([]);
  const pagination = {
    rowsPerPage: 30, // current rows per page being displayed
  };
  const negativeAlert = ref(false);
  const positiveAlert = ref(false);
  const simulationPaused = ref(false);
  const socialDistancingActivated = ref(false);
  const alertContactRestrictionsCountry = ref(false);
  const alertContactRestrictionsState = ref(false);
  const alertContactRestrictionsCity = ref(false);
  const alertSocialDistancing = ref(false);
  const alertMedicationDevelopment = ref(false);
  const alertVaccinationDevelopment = ref(false);
  const address = ref("");
  const errorCode = ref("");
  const currentVersion = ref("2022.8.3");

  // Computed and getters
  const fnMarkerLabel = (val) => `${10 * val}%`;
  const priceLabel = computed(() => `$ ${priceModel.value}`);

  // Functions
  function toggleRightDrawer() {
    rightDrawerOpen.value = !rightDrawerOpen.value;
  };

  function startSimulation() {
    axios
      .post("/api/simulation")
      .then((response) => {
        if ((response.status = 200)) {
          simulationStarted.value = true;
          positiveAlert.value = true;
          submitting.value = true;
          backendUuid.value = response.data;

          getAllStates(interval.value);
        }
      })
      .catch((error) => {
        negativeAlert.value = true;
        errorCode.value = error.response.status;
        return;
      });
  };

  function getAllStates() {
      if (!simulationPaused.value  && !backendStopped.value) {
        if (status.value == "states") {
          axios
            .get(
              `/api/simulation/${backendUuid.value}/country/incidenceofeverystate`
            )
            .then((response) => {
              if ((response.status != 200)) {
                return;
              }
              rows.value = response.data;
            })
            .catch(() => {
              backendStopped.value = true;
              return;
            });
        } else if (status.value == "cities") {
          axios
            .get(
              `/api/simulation/${backendUuid.value}/country/incidenceofeverycity`
            )
            .then((response) => {
              if ((response.status != 200)) {
                return;
              }
              rows.value = response.data;
            })
            .catch(function (error) {
              backendStopped.value = true;
              console.log(error);
              return;
            });
        }
        checkIfSimulationEnded();
        updateCountryInfoBox();
        refreshDay();
        checkIfMeasureIsDeveloped();
        refreshObedience();
        removeOneDayOnEveryMeasure();
        forceRerender();

        if (!backendStopped.value && !simulationPaused.value) {
          setTimeout(getAllStates, interval.value);
        }
      }
  };

  function addMeasure(measureInput, regionInput, targetInput, daysLeftInput) {
    if (regionInput == "country") {
      measureList.value.forEach((element, index) => {
        if (element.measure == measureInput) {
          measureList.value.splice(index, 1);
        }
      });
    }

    if (regionInput == "state") {
      let citiesOfState = map.get(targetInput);
      measureList.value.forEach((element, index) => {
        if (element.region == "state" && element.target == targetInput) {
          measureList.value.splice(index, 1);
        }
        if (
          element.region == "city" &&
          citiesOfState.includes(element.target) // CHECK
        ) {
          measureList.value.splice(index, 1);
        }
      });
    }

    if (regionInput == "city") {
      measureList.value.forEach((element, index) => {
        if (element.region == "city" && element.target == targetInput) {
          measureList.value.splice(index, 1);
        }
      });
    }

    measureList.value.push({
      measure: measureInput,
      target: targetInput,
      region: regionInput,
      daysLeft: daysLeftInput,
    });
  };

  function refreshDay() {
    axios
      .get(`/api/simulation/${backendUuid.value}/currentday`)
      .then((response) => {
        if ((response.status != 200)) {
          return;
        }
        day.value = response.data
      });
  }

  function forceRerender() {
    componentKey.value += 1;
  };

  function changeSpeed(speed) {
    let newInterval = (12 - speed) * 500;
    console.log(newInterval);
    interval.value = newInterval;
    axios.get(`/api/simulation/${backendUuid.value}/speed`, {
      params: {
        speed: newInterval,
      },
    });
  };

  function fillStates() {
    status.value = "states";
  };

  function fillCities() {
    status.value = "cities";
  };

  function updateCountryInfoBox() {
    axios
      .get(`/api/simulation/${backendUuid.value}/country/summary`)
      .then((response) => {
        if ((response.status != 200)) {
          return;
        }
        countryIncidence.value = response.data.incidence;
        countryNewInfections.value = response.data.newInfections;
        countryDeadCases.value = response.data.newDeathCases;
        vaccinationDeveloped.value = response.data.vaccinationDeveloped;
        medicationDeveloped.value = response.data.medicationDeveloped;
        simulationEnded.value = response.data.simulationEnded;
        virusName.value = response.data.currentVirusName;
        virusLethality.value = response.data.currentVirusLethality;
        countryRValue.value = response.data.rvalue;

        deathChartRef.value.appendDeathList(
          countryDeadCases.value,
          countryNewInfections.value
        );
      })
      .catch(function (error) {
        console.log(error);
        return;
      });
  };

  function checkIfSimulationEnded(){
    if (simulationEnded.value == true) {
      simulationPaused.value = true;
    }
  };

  function activateVaccinationButton() {
    if (vaccinationStatusCode.value == 0) {
      alertVaccinationDevelopment.value = true;
      axios
        .put(
          `/api/simulation/${backendUuid.value}/measure/vaccinationdevelopment`
        )
        .then((response) => {
          if (response.status != 200) {
            return;
          }
          vaccinationStatus.value = "In Entwicklung!";
          vaccinationStatusCode.value = 1;
          vaccinationButtonLoading.value = true;
        });
    }

    if (vaccinationStatusCode.value == 2) {
      startVaccinationUsage();
      vaccinationStatusCode.value = 3;
    }
  };

  function activateMedicationButton() {
    if (medicationStatusCode.value == 0) {
      alertMedicationDevelopment.value = true;
      axios
        .put(
          `/api/simulation/${backendUuid.value}/measure/medicationdevelopment`
        )
        .then((response) => {
          if (response.status != 200) {
            return;
          }
          medicationStatus.value = "In Entwicklung!";
          medicationStatusCode.value = 1;
          medicationButtonLoading.value = true;
        });
    };

    if (medicationStatusCode.value == 2) {
      startMedicationUsage();
      medicationStatusCode.value = 3;
      medicationStatus.value = "Medizin wird eingesetzt!";
    }
  };

  function startVaccinationUsage() {
    vaccinationUsage.value = true;
    axios
      .put(`/api/simulation/${backendUuid.value}/measure/vaccination`)
      .then((response) => {
        if (response.status != 200) {
          return;
        }
        vaccinationStatus.value = "Impfkampagne läuft!";
        vaccinationButtonLoading.value = true;
      });
  };

  function startMedicationUsage() {
    medicationUsage.value = true;
    axios
      .put(`/api/simulation/${backendUuid.value}/measure/medication`)
      .then((response) => {
        if ((response.status != 200)) {
          return;
        }
        medicationStatus.value = "Medizin wird eingesetzt!";
        medicationButtonLoading.value = true;
      });
  };

  function startContactRestrictions(regionInput) {
    if (regionInput == "country") {
      restrictionsInputName.value = "Deutschland";
    }

    axios.get(
      `/api/simulation/${backendUuid.value}/measure/contactrestrictions`,
      {
        params: {
          type: regionInput,
          name: restrictionsInputName.value,
          amountofdays: restrictionsInput.value,
        },
      }
    );
    addMeasure(
      "Kontaktbeschränkungen",
      regionInput,
      restrictionsInputName.value,
      restrictionsInput.value
    );
  };

  function startSocialDistancingAlert() {
    alertSocialDistancing.value = true;
  };
  
  function startSocialDistancing() {
    axios.put(`/api/simulation/${backendUuid.value}/measure/socialdistancing`)
    .then(() => {
      socialDistancingActivated.value = true;
    });
    addMeasure("Abstandsregeln", "country", "Deutschland", -1);
  };

  function checkIfMeasureIsDeveloped() {
    if (
      vaccinationDeveloped.value &&
      !vaccinationUsage.value &&
      vaccinationStatusCode.value == 1
    ) {
      vaccinationStatus.value = "Entwickelt!";
      vaccinationStatusCode.value = 2;
      vaccinationButtonLoading.value = false;
    }
    if (
      medicationDeveloped.value &&
      !medicationUsage.value &&
      medicationStatusCode.value == 1
    ) {
      medicationStatus.value = "Entwickelt!";
      medicationStatusCode.value = 2;
      medicationButtonLoading.value = false;
    }
  };

  function pauseSimulation(pause) {
    axios.get(`/api/simulation/${backendUuid.value}/pause`, {
      params: {
        pause: pause,
      },
    });
    simulationPaused.value = pause;
    if (!pause) {
      getAllStates();
    }
  };

  function endSimulation() {
    location.reload();
    axios.delete(`/api/simulation/${backendUuid.value}/`);
    pauseSimulation.value(false);
  };

  function refreshObedience() {
    axios
      .get(`/api/simulation/${backendUuid.value}/country/obedience`)
      .then((response) => {
        if ((response.status != 200)) {
          return;
        }
        
        if (obedience.value > 0.7 && response.data > 0.7) {
          obedienceColor.value = "positive";
        }
        if (obedience.value < 0.7 && response.data > 0.7) {
          notifySuccess(
            "Der Gehorsam deiner Bevölkerung ist wieder über 70% !"
          );
        }
        if (obedience.value > 0.3 && response.data < 0.3) {
          obedienceColor.value = "negative";
          notifyError("Achtung der Gehorsam ist nun unter 30% !");
        } else if (obedience.value > 0.7 && response.data < 0.7) {
          obedienceColor.value = "warning";
        }
        obedience.value = response.data;
      });
  };

  function removeElement(index) {
    measureList.value.splice(index, 1);
  };

  function toggleSocialDistancing(){
    console.log("Activated!");
    socialDistancingActivated.value = false;
  };

  function removeOneDayOnEveryMeasure() {
    measureList.value.forEach((element, index) => {
      if (element.daysLeft > 1) {
        element.daysLeft--;
      } else if (element.daysLeft == 1) {
        removeElement(index);
      }
    });
  };

  return {
    deathChartRef,
    positiveAlert,
    negativeAlert,
    newMeasure,
    submitting,
    simulationStarted,
    simulationEnded,
    interval,
    day,
    componentKey,
    status,
    countryIncidence,
    countryRValue,
    countryNewInfections,
    countryDeadCases,
    vaccinationStatus,
    medicationStatus,
    vaccinationStatusCode,
    medicationStatusCode,
    vaccinationButtonLoading,
    medicationButtonLoading,
    vaccinationDeveloped,
    medicationDeveloped,
    vaccinationUsage,
    medicationUsage,
    virusName,
    virusLethality,
    backendStopped,
    amountOfDaysContactRestrictions,
    backendUuid,
    restrictionsInputState,
    restrictionsInput,
    obedience,
    obedienceColor,
    measureList,
    map,
    columns,
    rows,
    pagination,
    simulationPaused,
    alertContactRestrictionsCountry,
    alertContactRestrictionsState,
    alertContactRestrictionsCity,
    alertSocialDistancing,
    alertMedicationDevelopment,
    alertVaccinationDevelopment,
    rightDrawerOpen,
    address,
    model,
    priceModel,
    priceLabel,
    medicationButton,
    restrictionsInputName,
    fnMarkerLabel,
    addMeasure,
    refreshDay,
    forceRerender,
    changeSpeed,
    fillStates,
    fillCities,
    updateCountryInfoBox,
    activateVaccinationButton,
    activateMedicationButton,
    startVaccinationUsage,
    startMedicationUsage,
    startContactRestrictions,
    startSocialDistancingAlert,
    startSocialDistancing,
    socialDistancingActivated,
    checkIfMeasureIsDeveloped,
    pauseSimulation,
    endSimulation,
    refreshObedience,
    removeElement,
    removeOneDayOnEveryMeasure,
    toggleSocialDistancing,
    startSimulation,
    getAllStates,
    toggleRightDrawer,
    errorCode,
    currentVersion
  };
}

