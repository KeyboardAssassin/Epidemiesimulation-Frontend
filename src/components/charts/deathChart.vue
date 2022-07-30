<template>
  <apexchart
    type="area"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script>
export default {
  name: "deathChart",
  data() {
    return {
      series: [
        {
          name: "Deaths",
          data: [],
        },
        {
          name: "Cases",
          data: [],
        },
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: "area",
          zoom: {
            enabled: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        title: {
          text: "Anzahl an Toten",
          align: "left",
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [],
        },
      },
    };
  },
  methods: {
    appendDeathList(amountOfNewDeaths, amountOfNewCases) {
      let newDeathData = Array.from(this.series[0].data);
      newDeathData.push(amountOfNewDeaths);

      let newCaseData = Array.from(this.series[1].data);
      newCaseData.push(amountOfNewCases);

      let newAxisData = Array.from(this.chartOptions.xaxis.categories);
      newAxisData.push("1");

      this.series = [
        {
          name: "Deaths",
          data: newDeathData,
        },
        {
          name: "cases",
          data: newCaseData,
        },
      ];

      this.chartOptions.xaxis.categories = newAxisData;
    },
  },
};
</script>
