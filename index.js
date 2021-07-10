const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cacheControl = require("express-cache-controller");
const axios = require("axios");

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
  let newDate = [thisDate[2], thisDate[1], thisDate[0]].join("/");
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
    title:
      "CovidTracker API by Vincent Haryadi (vincenth19), inspired by Reynadi531's API project",
    covidtracker: "https://covidtracker.pages.dev",
    "Source Code": "https://github.com/vincenth19/covidtracker-backend",
    "My Profile": "https://vincenth19.com",
    "Inspired by Reynadi531s project":
      "https://github.com/Reynadi531/api-covid19-indonesia-v2",
    endpoints: {
      national: [`${url}/api/national`],
      daily: [
        `${url}/api/national/all_daily`,
        `${url}/api/province/:provincename/all_daily`,
        `province example ${url}/api/province/DKI_JAKARTA/all_daily`,
      ],
      province: [
        `${url}/api/province/`,
        `${url}/api/province/more`,
        `${url}/api/province/:provincename`,
      ],
      rawdata: [
        `${url}/api/national/raw`,
        `${url}/api/province/raw`,
        `${url}/api/province/:provincename/raw`,
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
      hospitalized: data.update.penambahan.jumlah_dirawat,
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

app.get("/api/national/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/update.json"
  );
  res.status(200).send({
    data,
  });
});

app.get("/api/national/all_daily", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/update.json"
  );
  let modifiedData = data.update.harian.map((data) => {
    return {
      date: new Date(data.key).toLocaleDateString("id-ID"),
      update: {
        positive: data.jumlah_positif.value,
        hospitalized: data.jumlah_dirawat.value,
        recovered: data.jumlah_sembuh.value,
        death: data.jumlah_meninggal.value,
      },
      total: {
        positive: data.jumlah_positif_kum.value,
        hospitalized: data.jumlah_dirawat_kum.value,
        recovered: data.jumlah_sembuh_kum.value,
        death: data.jumlah_meninggal_kum.value,
      },
    };
  });
  res.status(200).send({
    modifiedData,
  });
});

app.get("/api/province", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov.json"
  );

  let allProvinces = data.list_data.map((data) => {
    return {
      provinceName: data.key,
      casePercentage: data.doc_count.toFixed(2),
      total: {
        positive: data.jumlah_kasus,
        hospitalized: data.jumlah_dirawat,
        recovered: data.jumlah_sembuh,
        death: data.jumlah_meninggal,
      },
      update: {
        positive: data.penambahan.positif,
        recovered: data.penambahan.sembuh,
        death: data.penambahan.meninggal,
      },
    };
  });

  let modifiedData = {
    updateDate: data.last_date,
    provinces: allProvinces,
  };

  res.status(200).send({
    modifiedData,
  });
});

app.get("/api/province/more", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov.json"
  );

  let allProvinces = data.list_data.map((data) => {
    return {
      provinceName: data.key,
      casePercentage: data.doc_count.toFixed(2),
      total: {
        positive: data.jumlah_kasus,
        hospitalized: data.jumlah_dirawat,
        recovered: data.jumlah_sembuh,
        death: data.jumlah_meninggal,
      },
      update: {
        positive: data.penambahan.positif,
        recovered: data.penambahan.sembuh,
        death: data.penambahan.meninggal,
      },
      sexDemo: data.jenis_kelamin.map((data) => {
        return { sex: data.key, total: data.doc_count };
      }),
      ageDemo: data.kelompok_umur.map((data) => {
        return {
          ageString: data.key,
          total: data.doc_count,
          age: data.usia.value,
        };
      }),
      location: data.lokasi,
    };
  });

  let modifiedData = {
    updateDate: data.last_date,
    provinces: allProvinces,
  };

  res.status(200).send({
    modifiedData,
  });
});

app.get("/api/province/raw", async (req, res) => {
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

  let modifiedData = {
    updateDate: data.last_date,
    province: data.provinsi,
    positive: {
      total: data.kasus_total,
      withDate: data.kasus_dengan_tgl,
      withoutDate: data.kasus_tanpa_tgl,
    },
    death: {
      percentage: data.meninggal_persen.toFixed(2),
      withDate: data.meninggal_dengan_tgl,
      withoutDate: data.meninggal_tanpa_tgl,
    },
    recovery: {
      percentage: data.sembuh_persen.toFixed(2),
      withDate: data.sembuh_dengan_tgl,
      withoutDate: data.sembuh_tanpa_tgl,
    },
  };
  res.status(200).send({
    //data,
    modifiedData,
  });
});

app.get("/api/province/:provincename/more", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov_detail_" +
      req.params.provincename +
      ".json"
  );
  let dailyData = data.list_perkembangan.map((data) => {
    return {
      date: new Date(data.tanggal).toLocaleDateString("id-ID"),
      update: {
        positive: data.KASUS,
        hospitalized: data.DIRAWAT_OR_ISOLASI,
        recovered: data.SEMBUH,
        death: data.MENINGGAL,
      },
      total: {
        positive: data.AKUMULASI_KASUS,
        hospitalized: data.AKUMULASI_DIRAWAT_OR_ISOLASI,
        recovered: data.AKUMULASI_SEMBUH,
        death: data.AKUMULASI_MENINGGAL,
      },
    };
  });

  let modifiedData = {
    updateDate: data.last_date,
    province: data.provinsi,
    positive: {
      total: data.kasus_total,
      withDate: data.kasus_dengan_tgl,
      withoutDate: data.kasus_tanpa_tgl,
    },
    death: {
      percentage: data.meninggal_persen.toFixed(2),
      withDate: data.meninggal_dengan_tgl,
      withoutDate: data.meninggal_tanpa_tgl,
    },
    recovery: {
      percentage: data.sembuh_persen.toFixed(2),
      withDate: data.sembuh_dengan_tgl,
      withoutDate: data.sembuh_tanpa_tgl,
    },
    dailyData: dailyData,
  };
  res.status(200).send({
    //data,
    modifiedData,
  });
});

app.get("/api/province/:provincename/all_daily", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov_detail_" +
      req.params.provincename +
      ".json"
  );
  let modifiedData = data.list_perkembangan.map((data) => {
    return {
      date: new Date(data.tanggal).toLocaleDateString("id-ID"),
      update: {
        positive: data.KASUS,
        hospitalized: data.DIRAWAT_OR_ISOLASI,
        recovered: data.SEMBUH,
        death: data.MENINGGAL,
      },
      total: {
        positive: data.AKUMULASI_KASUS,
        hospitalized: data.AKUMULASI_DIRAWAT_OR_ISOLASI,
        recovered: data.AKUMULASI_SEMBUH,
        death: data.AKUMULASI_MENINGGAL,
      },
    };
  });

  res.status(200).send({
    //data,
    modifiedData,
  });
});

app.get("/api/province/:provincename/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://data.covid19.go.id/public/api/prov_detail_" +
      req.params.provincename +
      ".json"
  );
  res.status(200).send({
    data,
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API Live at port: ${PORT}`));
