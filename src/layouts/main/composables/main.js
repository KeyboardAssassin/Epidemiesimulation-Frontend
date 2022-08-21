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
  const simulationstarted = ref(false);
  const simulationEnded = ref(false);
  const interval = ref(3000);
  const day = ref(0);
  const componentKey = ref(0);
  const status = ref("states");
  const countryIncidence = ref(0);
  const countryRValue = ref(0);
  const countryNewInfections = ref(0);
  const countryDeadCases = ref(0);
  const vaccinationstatus = ref("Nicht entwickelt");
  const medicationstatus = ref("Nicht entwickelt");
  const vaccinationstatuscode = ref(0);
  const medicationstatuscode = ref(0);
  const vaccinationbuttonloading = ref(false);
  const medicationbuttonloading = ref(false);
  const vaccinationdeveloped = ref(false);
  const medicationdeveloped = ref(false);
  const vaccinationusage = ref(false);
  const medicationusage = ref(false);
  const virusName = ref("Alpha");
  const virusLethality = ref("0.9");
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
  const alertContactRestrictionsCountry = ref(false);
  const alertContactRestrictionsState = ref(false);
  const alertContactRestrictionsCity = ref(false);
  const alertSocialDistancing = ref(false);
  const alertMedicationDevelopment = ref(false);
  const alertVaccinationDevelopment = ref(false);
  const address = ref("");
  const intervalObj = ref(null)

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
      .then((res) => {
        if ((res.status = 200)) {
          simulationstarted.value = true;
          positiveAlert.value = true;
          submitting.value = true;
          backendUuid.value = res.data;

          getAllStates(interval.value);
        }
      })
      .catch(() => {
        negativeAlert.value = true;
        return;
      });
  };

  function getAllStates() {
      if (!simulationPaused.value) {
        if (status.value == "states") {
          axios
            .get(
              `/api/simulation/${backendUuid.value}/country/incidenceofeverystate`
            )
            .then((response) => (rows.value = response.data))
            .catch(function (error) {
              console.log(error);
              clearInterval(intervalObj.value);
              intervalObj.value = null;
              return;
            });
        } else if (status.value == "cities") {
          axios
            .get(
              `/api/simulation/${backendUuid.value}/country/incidenceofeverycity`
            )
            .then((response) => (rows.value = response.data))
            .catch(function (error) {
              console.log(error);
              clearInterval(intervalObj.value);
              intervalObj.value = null;
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
      }
      setTimeout(getAllStates, interval.value);
  };

  function addMeasure(measureInput, regionInput, targetInput, daysLeftInput) {
    if (regionInput == "country") {
      measureList.value.forEach((element, index) => {
        if (element.measure == measureInput) {
          measureList.value.splice(index, 1);
          console.log(element.measure + " ist gleich " + measureInput);
        }
        console.log(element.measure + " ist nicht gleich " + measureInput);
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
      .then((response) => (day.value = response.data));
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
      .then((res) => {
        countryIncidence.value = res.data.incidence;
        countryNewInfections.value = res.data.newInfections;
        countryDeadCases.value = res.data.newDeathCases;
        vaccinationdeveloped.value = res.data.vaccinationDeveloped;
        medicationdeveloped.value = res.data.medicationDeveloped;
        simulationEnded.value = res.data.simulationEnded;
        virusName.value = res.data.currentVirusName;
        virusLethality.value = res.data.currentVirusLethality;
        countryRValue.value = res.data.rvalue;

        deathChartRef.value.appendDeathList(
          countryDeadCases.value,
          countryNewInfections.value
        );
      })
      .catch(function (error) {
        console.log(error);
        clearInterval(intervalObj.value);
        intervalObj.value = null;
        return;
      });
  };

  function checkIfSimulationEnded(){
    if (simulationEnded.value == true) {
      intervalObj.value = null;
      simulationPaused.value = true;
      console.log("ENDE");
    }
  };

  function activateVaccinationButton() {
    if (vaccinationstatuscode.value == 0) {
      alertVaccinationDevelopment.value = true;
      axios
        .put(
          `/api/simulation/${backendUuid.value}/measure/vaccinationdevelopment`
        )
        .then(() => {
          vaccinationstatus.value = "In Entwicklung!";
          vaccinationstatuscode.value = 1;
          vaccinationbuttonloading.value = true;
        });
    }

    if (vaccinationstatuscode.value == 2) {
      startVaccinationUsage();
      vaccinationstatuscode.value = 3;
    }
  };

  function activateMedicationButton() {
    if (medicationstatuscode.value == 0) {
      alertMedicationDevelopment.value = true;
      axios
        .put(
          `/api/simulation/${backendUuid.value}/measure/medicationdevelopment`
        )
        .then(() => {
          medicationstatus.value = "In Entwicklung!";
          medicationstatuscode.value = 1;
          medicationbuttonloading.value = true;
        });
    };

    if (medicationstatuscode.value == 2) {
      startMedicationUsage();
      medicationstatuscode.value = 3;
      medicationstatus.value = "Medizin wird eingesetzt!";
    }
  };

  function startVaccinationUsage() {
    vaccinationusage.value = true;
    axios
      .put(`/api/simulation/${backendUuid.value}/measure/vaccination`)
      .then(() => {
        vaccinationstatus.value = "Impfkampagne läuft!";
        vaccinationbuttonloading.value = true;
      });
  };

  function startMedicationUsage() {
    medicationusage.value = true;
    axios
      .put(`/api/simulation/${backendUuid.value}/measure/medication`)
      .then(() => {
        medicationstatus.value = "Medizin wird eingesetzt!";
        medicationbuttonloading.value = true;
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
    axios.put(`/api/simulation/${backendUuid.value}/measure/socialdistancing`);
    addMeasure("Abstandsregeln", "country", "Deutschland", -1);
  };

  function checkIfMeasureIsDeveloped() {
    if (
      vaccinationdeveloped.value &&
      !vaccinationusage.value &&
      vaccinationstatuscode.value == 1
    ) {
      vaccinationstatus.value = "Entwickelt!";
      vaccinationstatuscode.value = 2;
      vaccinationbuttonloading.value = false;
    }
    if (
      medicationdeveloped.value &&
      !medicationusage.value &&
      medicationstatuscode.value == 1
    ) {
      medicationstatus.value = "Entwickelt!";
      medicationstatuscode.value = 2;
      medicationbuttonloading.value = false;
    }
  };

  function pauseSimulation(pause) {
    axios.get(`/api/simulation/${backendUuid.value}/pause`, {
      params: {
        pause: pause,
      },
    });
    simulationPaused.value = pause;
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
    simulationstarted,
    simulationEnded,
    interval,
    day,
    componentKey,
    status,
    countryIncidence,
    countryRValue,
    countryNewInfections,
    countryDeadCases,
    vaccinationstatus,
    medicationstatus,
    vaccinationstatuscode,
    medicationstatuscode,
    vaccinationbuttonloading,
    medicationbuttonloading,
    vaccinationdeveloped,
    medicationdeveloped,
    vaccinationusage,
    medicationusage,
    virusName,
    virusLethality,
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
    checkIfMeasureIsDeveloped,
    pauseSimulation,
    endSimulation,
    refreshObedience,
    removeElement,
    removeOneDayOnEveryMeasure,
    startSimulation,
    getAllStates,
    toggleRightDrawer,
  };
}

