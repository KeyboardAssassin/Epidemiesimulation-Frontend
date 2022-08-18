<script>
import { ref, defineComponent } from 'vue' ;

export default defineComponent({
  name: 'deathChart',
  
  setup() {
    const series = ref([
        {
          name: 'Deaths',
          data: [],
        },
        {
          name: 'Cases',
          data: [],
        },
    ]);

    const chartOptions = ref({
        chart: {
          height: 350,
          type: 'area',
          zoom: {
            enabled: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        title: {
          text: 'Fallzahlen',
          align: 'left',
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [],
        },
    });

    function appendDeathList(amountOfNewDeaths, amountOfNewCases) {
      let newDeathData = Array.from(series.value[0].data);
      newDeathData.push(amountOfNewDeaths);

      let newCaseData = Array.from(series.value[1].data);
      newCaseData.push(amountOfNewCases);

      // let newAxisData = Array.from(chartOptions.value.xaxis.categories);
      // newAxisData.push('1');

      series.value = [
        {
          name: 'Deaths',
          data: newDeathData,
        },
        {
          name: 'cases',
          data: newCaseData,
        },
      ];

      //chartOptions.value.xaxis.categories = newAxisData;
    };

    return {
      series,
      chartOptions,
      appendDeathList,
    };
  }
})
</script>

<template>
  <apexchart
    type='area'
    height='350'
    :options='chartOptions'
    :series='series'
  ></apexchart>
</template>

<style scoped>

</style>