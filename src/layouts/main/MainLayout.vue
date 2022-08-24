<script>
import {
  defineAsyncComponent,
  defineComponent,
} from "vue";
import MeasureElement from 'components/MeasureElement.vue';
import { useMain } from './composables/main';

let DeathChart = defineAsyncComponent(() =>
  import("components/charts/DeathChart.vue")
);

export default defineComponent({
  name: 'MainLayout',

  components: {
    DeathChart,
    MeasureElement,
  },

  setup() {
    const main = useMain()

    return {
      ...main, // Spread all the refs and functions from the useMain composable so they can be accessed in the view
    };
  },
})
</script>

<template>
  <q-layout view="hHh lpR fFf" style="min-height: 1px;">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <div class="title">Version: {{ currentVersion }}</div>

          <div class="obedienceprogress">
            Gehorsam der Bevölkerung:
            <q-btn round color="secondary" glossy text-color="black" icon="question_mark" size="8px">
              <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                Der <strong>Gehorsam</strong> repräsentiert, wie sehr deine Bevölkerung auf Maßnahmen hört.<br>
                Je tiefer dieser fällt, desto weniger werden diese eingehalten.
              </q-tooltip>
            </q-btn>
            <q-linear-progress stripe rounded size="14px" :value="obedience" :color="obedienceColor" class="q-mt-sm" />
          </div>
          <div class="date">Tag: {{ day }}</div>
          <div class="centeredtitle">🦠 Epidemie-Simulation 🧬</div>
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <q-tabs align="center">
        <q-route-tab to="states" label="Bundesländer" @click="fillStates()" :disable="!simulationStarted" />
        <q-route-tab to="cities" label="Städte" @click="fillCities()" :disable="!simulationStarted" />
      </q-tabs>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-table id="list" style="width: 100%" title="Bundesländer" dark :rows="rows" :columns="columns" row-key="name"
        color="amber" q-virtual-scroll--skip v-model:pagination="pagination" :key="componentKey"></q-table>
    </q-drawer>

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

        <q-card-section class="q-pt-none" align="center">
          Simulation wurde nicht gestartet!<br>
          Vermutlich läuft die Serveranwendung im Hintergrund nicht.
        </q-card-section>

        <q-card-actions align="right">
          <div class="errorcode">
            Errorcode: {{ errorCode }}
          </div>
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
          <q-input filled v-model="restrictionsInput" label="Anzahl an Tagen" type="number"
            :rules="[(val) => val.length <= 2 || 'Bitte maximal zweistellig!']" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="startContactRestrictions('country')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for contact restrictions (state) -->
    <q-dialog v-model="alertContactRestrictionsState">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none" style="width: 400px">
          <div style="margin-bottom: 8%">
            <div class="dialogtext">
              Bitte den Namen des Bundeslandes eingeben:
            </div>
            <q-input filled v-model="restrictionsInputName" label="Name des Bundeslandes" type="text" />
          </div>
          <div>
            <div class="dialogtext">Dauer der Kontaktbeschränkungen:</div>
          </div>
          <q-input filled v-model="restrictionsInput" label="Anzahl an Tagen" type="number"
            :rules="[(val) => val.length <= 2 || 'Bitte maximal zweistellig!']" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="startContactRestrictions('state')" />
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
          <div style="margin-bottom: 10%">
            <q-card-section>
              Bitte den Namen der Stadt eingeben:
            </q-card-section>
            <q-input filled v-model="restrictionsInputName" label="Name der Stadt" type="text" />
          </div>
          <div>
            <q-card-section class="q-pt-none">
              Wie lange sollen die Kontaktbeschränkungen anhalten?
            </q-card-section>
            <q-input filled v-model="restrictionsInput" label="Anzahl an Tagen" type="number" :rules="[
              (val) => val.length <= 2 || 'Bitte maximal zweistellig!',
            ]" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="startContactRestrictions('city')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for social distancing (country) -->
    <q-dialog v-model="alertSocialDistancing">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Abstandregeln dauerhaft beschlossen!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="startSocialDistancing()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- alert for medication development -->
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

    <!-- alert for vaccination development -->
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

    <!-- alert if the simulation ended -->
    <q-dialog v-model="simulationEnded">
      <q-card>
        <q-card-section>
          <div class="text-h6">Information</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Epidemie an Tag {{ day }} beendet!<br>
          Es gab seit 7 Tagen keine Neuinfektionen!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container style="width: 73%; margin-left: 27%; margin-top: 0.5%;">
      <div class="sliderbundle">
        <q-badge color="primary" style="margin-right: 60%">
          Geschwindigkeit der Tage:
        </q-badge>
        <q-slider @change="changeSpeed(model)" class="q-mt-xl" v-model="model" color="blue" markers
          :marker-labels="fnMarkerLabel" :min="0" :max="10" :disable="!simulationStarted"
          style="margin-top: 0%; margin-left: 0.1%; float: left" />
        <div class="controlling">
          <q-btn id="simulation-button" label="Simulation starten" color="positive" @click="startSimulation()"
            :disable="simulationStarted" :loading="simulationStarted">
            <template v-slot:loading>
              <q-spinner-gears />
            </template>
          </q-btn>
        </div>
      </div>

      <q-page-sticky position="left" style="width: 19%; height: 80%">
        <div class="leftpanel">
          <q-card-section>
            <div class="headline">
              <p>Deutschland</p>
            </div>
            <div class="countrypanel">
              <div class="panelsection">
                <div class="panelelement">
                  <q-btn round color="secondary" glossy text-color="black" icon="question_mark" size="8px">
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                      Die <strong>Inzidenz</strong> stellt die durschnittlichen Neuinfektionen der letzten 7 Tage dar.
                    </q-tooltip>
                  </q-btn>
                  Inzidenz: {{ countryIncidence }}
                </div>

                <div class="panelelement">
                  <q-btn round color="secondary" glossy text-color="black" icon="question_mark" size="8px">
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                      Der <strong>R-Wert</strong> gibt an, wie viele Menschen eine infizierte Person<br> in den
                      vergangenen 8 Tagen im Mittel ansteckt hat.
                    </q-tooltip>
                  </q-btn> R-Wert: {{ countryRValue }}
                </div>

                <div class="panelelement">
                  <q-btn round color="secondary" glossy text-color="black" icon="question_mark" size="8px">
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                      Die <strong>Neuinfektionen</strong> geben an, wie viel Menschen<br>
                      an dem aktuellen Tag infiziert wurden.
                    </q-tooltip>
                  </q-btn>
                  Neuinfektionen: {{ countryNewInfections }}
                </div>

                <div class="panelelement">
                  <q-btn round color="secondary" glossy text-color="black" icon="question_mark" size="8px">
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                      Die <strong>Todesfälle</strong> geben an, wie viel Menschen<br>
                      an dem aktuellen Tag verstorben sind.
                    </q-tooltip>

                  </q-btn>
                  Neue Todesfälle: {{ countryDeadCases }}
                </div>
              </div>
              <div class="panelsection">
                <div class="panelelement">
                  Impfstoff:
                  <span v-if="vaccinationStatusCode == 0" style="color: red">{{
                      vaccinationStatus
                  }}</span>
                  <span v-else-if="vaccinationStatusCode == 1" style="color: darkgoldenrod">{{ vaccinationStatus }}</span>
                  <span v-else-if="
                    vaccinationStatusCode == 2 || vaccinationStatusCode == 3
                  " style="color: green">{{ vaccinationStatus }}</span>
                </div>
                <div class="panelelement">
                  Medikamente:
                  <span v-if="medicationStatusCode == 0" style="color: red">{{
                      medicationStatus
                  }}</span>
                  <span v-else-if="medicationStatusCode == 1" style="color: darkgoldenrod">{{ medicationStatus }}</span>
                  <span v-else-if="
                    medicationStatusCode == 2 || medicationStatusCode == 3
                  " style="color: green">{{ medicationStatus }}</span>
                </div>
              </div>
            </div>
            <DeathChart ref="deathChartRef"></DeathChart>
          </q-card-section>
        </div>
      </q-page-sticky>


      <div class="map">
        <div class="measureContainer">
          Maßnahmen aktiv: {{ measureList.length }}
          <div v-for="(measureListElement, index) in measureList" :key="measureListElement.measure">
            <MeasureElement :measureProp="measureListElement" :measureIndex="index" :uuid="this.backendUuid"
              @removeelement-index="removeElement()" @toggle-social-distancing-button="toggleSocialDistancing()" />
          </div>
        </div>
        <img v-if="status == 'states'" alt="Map of Germany" src="../../assets/states.png" />
        <img v-if="status == 'cities'" alt="Map of Germany" src="../../assets/cities.png" />
        <div class="bottommenu">
          <div class="bottommenuleft">
            <div class="virusbox">
              <div class="viruselement" style="font-size: 20px;">
                Virus: {{ virusName }}
              </div>
              <div class="viruselement" style="font-size: 18px;">
                Letalität: {{ virusLethality }} %
              </div>
              <div class="viruselement">
                <img src="../../../public/icons8-coronavirus-100.png" style="width: 80px; height: 80px">
              </div>
            </div>
          </div>
          <div class="bottommenuright">
            <div class="pauseBtnBox">
              <q-badge color="primary">Pause</q-badge>
              <q-btn round color="negative" icon="pan_tool" @click="pauseSimulation(true)"
                :disable="!simulationStarted && false" />
            </div>

            <div class="pauseBtnBox">
              <q-badge color="primary">Weiter</q-badge>
              <q-btn round color="positive" icon="done" @click="pauseSimulation(false)" :disable="!simulationStarted" />
            </div>

            <div class="pauseBtnBox">
              <q-badge color="primary">Beenden</q-badge>
              <q-btn round color="black" icon="logout" @click="endSimulation()" :disable="!simulationStarted" />
            </div>
          </div>

        </div>
      </div>
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="column-footer">Maßnahmen</div>
          <div class="column-footer">
            <q-btn v-if="
              this.vaccinationStatusCode == 0 ||
              this.vaccinationStatusCode == 1
            " id="vaccinationButton" :loading="vaccinationButtonLoading" color="primary"
              label="Start der Impfstoffentwicklung 💉" @click="activateVaccinationButton()"
              :disable="!simulationStarted" />
            <q-btn v-if="this.vaccinationStatusCode == 2" id="vaccinationButton" :loading="vaccinationButtonLoading"
              color="green" label="Start der Impfkamagne 💉" @click="activateVaccinationButton()"
              :disable="!simulationStarted" />
          </div>
          <div class="column-footer">
            <q-btn v-if="
              this.medicationStatusCode == 0 || this.medicationStatusCode == 1
            " :id="medicationButton" :loading="medicationButtonLoading" color="primary"
              label="Start der Medikamentenentwicklung 💊" @click="activateMedicationButton()"
              :disable="!simulationStarted" />
            <q-btn v-if="this.medicationStatusCode == 2" :id="medicationButton" :loading="medicationButtonLoading"
              color="green" label="Start der Medikamentenkampagne 💊" @click="activateMedicationButton()"
              :disable="!simulationStarted" />
          </div>
          <div class="column-footer">
            <q-btn-dropdown color="primary" label="Kontaktbeschränkungen" :disable="!simulationStarted">
              <q-list>
                <q-item clickable v-close-popup @click="this.alertContactRestrictionsCountry = true">
                  <q-item-section>
                    <q-item-label>Gesamtes Land</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="this.alertContactRestrictionsState = true">
                  <q-item-section>
                    <q-item-label>Für ein Bundesland</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="this.alertContactRestrictionsCity = true">
                  <q-item-section>
                    <q-item-label>Einzelne Stadt</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div class="column-footer">
            <q-btn v-if="!this.socialDistancingActivated" color="primary" label="Abstandsregeln erlassen"
              @click="startSocialDistancingAlert()" :disable="!simulationStarted" />
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<style scoped>
</style>