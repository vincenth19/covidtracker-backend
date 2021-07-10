const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cacheControl = require("express-cache-controller");
const axios = require("axios");
const PORT = "8080";
//const { nationalData, provData, eachProvData } = require("./fetchData");

//require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cacheControl({ maxAge: 60, sMaxAge: 60 }));
app.use(compression());

function dateConverter(date) {
  let allDate = date.split(" ");
  let thisDate = allDate[0].split("-");
  let thisTime = allDate[1].split(":");
  let newDate = [thisDate[2], thisDate[1], thisDate[0]].join("-");
  let hour = thisTime[0];
  hour = hour < 10 ? "0" + hour : hour;
  let min = thisTime[1];
  let newTime = hour + ":" + min;
  let time = newDate + " " + newTime;
  return time.toString();
}

app.get("/", async (req, res) => {
  res.redirect("/api");
});

app.get("/api", async (req, res) => {
  const url = `${req.protocol}://${req.hostname}${
    req.hostname == "localhost" ? `:${PORT}` : ""
  }`;
  res.json({
    message: "CovidTracker API modified from Reynadi531 Project",
    covidtracker: "https://covidtracker.pages.dev",
    "project source": "https://covidtracker.pages.dev",
    "Reynadi531s project":
      "https://github.com/Reynadi531/api-covid19-indonesia-v2",
    "my profile": "https://vincenth19.com",
    endpoints: {
      national: [`${url}/api/national`],
      daily: [`${url}/api/daily`],
      province: [`${url}/api/province/:provincename`],
      eachProvinceDaily: [
        `${url}/api/province/:provincename`,
        `${url}/api/province/DKI_JAKARTA`,
      ],
    },
  });
});

app.get("/api/national", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/update.json"
  );
  let modifiedData = {
    update: {
      positive: data.update.penambahan.jumlah_positif,
      hospitalisation: data.update.penambahan.jumlah_dirawat,
      recovered: data.update.penambahan.jumlah_sembuh,
      death: data.update.penambahan.jumlah_meninggal,
      updateDate: dateConverter(data.update.penambahan.created),
    },
    total: {
      positive: data.update.total.jumlah_positif,
      hospitalized: data.update.total.jumlah_dirawat,
      recovered: data.update.total.jumlah_sembuh,
      death: data.update.total.jumlah_meninggal,
    },
  };
  res.status(200).send({
    modifiedData,
  });
});

app.get("/api/national/all_daily", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/update.json"
  );
  let dailyData = data.update.harian.map((data) => {
    return {
      positive: data.jumlah_positif.value,
      hospitalisation: data.jumlah_dirawat.value,
      recovered: data.jumlah_sembuh.value,
      death: data.jumlah_meninggal.value,
      total_positive: data.jumlah_positif_kum.value,
      total_hospitalized: data.jumlah_dirawat_kum.value,
      total_recovered: data.jumlah_sembuh_kum.value,
      total_death: data.jumlah_meninggal_kum.value,
      unixTimestamp: data.key,
      date: data.key_as_string,
    };
  });
  res.status(200).send({
    dailyData,
  });
});

app.get("/api/province", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov.json"
  );
  res.status(200).send({
    data,
  });
});

app.get("/api/province/:provincename", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov_detail_" +
      req.params.provincename +
      ".json"
  );
  res.status(200).send({
    data,
  });
});

module.exports = app;
//const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening at port: ${PORT}`));
