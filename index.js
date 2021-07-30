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

const INDO_POP = 270203917;

app.get("/", async (req, res) => {
  res.redirect("/api");
});

const PROXY_URL =
  "https://blue-river-c848.vincenthary19.workers.dev/corsproxy/?apiurl=";

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
        `${url}/api/test_and_vacc/raw`,
        `${url}/api/kecamatan/raw`,
        `${url}/api/rumah_sakit/raw`,
        `${url}/api/lab/raw`,
        `${url}/api/province_all_daily/raw`,
        `${url}/api/province_simple/raw`,
        `${url}/api/city_risk/raw`,
      ],
    },
  });
});

app.get("/api/national", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/update.json`
  );

  let modifiedData = {
    updateDate: dateConverter(data.update.penambahan.created),
    update: {
      positive: data.update.penambahan.jumlah_positif,
      hospitalized: data.update.penambahan.jumlah_dirawat,
      recovered: data.update.penambahan.jumlah_sembuh,
      death: data.update.penambahan.jumlah_meninggal,
    },
    total: {
      positive: data.update.total.jumlah_positif,
      hospitalized: data.update.total.jumlah_dirawat,
      recovered: data.update.total.jumlah_sembuh,
      death: data.update.total.jumlah_meninggal,
    },
  };
  res.status(200).send(modifiedData);
});

app.get("/api/national/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/update.json`
  );
  res.status(200).send(data);
});

app.get("/api/national/all_daily", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/update.json`
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
  res.status(200).send(modifiedData);
});

app.get("/api/province", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov.json`
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

  res.status(200).send(modifiedData);
});

app.get("/api/province/more", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov.json`
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

  res.status(200).send(modifiedData);
});

app.get("/api/province/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov.json`
  );
  res.status(200).send(data);
});

app.get("/api/province/:provincename", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_detail_` +
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
  res.status(200).send(modifiedData);
});

app.get("/api/province/:provincename/more", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_detail_` +
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
  res.status(200).send(modifiedData);
});

app.get("/api/province/:provincename/all_daily", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_detail_` +
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

  res.status(200).send(modifiedData);
});

app.get("/api/province/:provincename/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_detail_` +
      req.params.provincename +
      ".json"
  );
  res.status(200).send(data);
});

app.get("/api/test_and_vacc/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );

  res.status(200).send(data);
});

app.get("/api/vaccination", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );

  let modifiedData = {
    updateDate: dateConverter(data.vaksinasi.penambahan.created),
    update: {
      dose1: data.vaksinasi.penambahan.jumlah_vaksinasi_1,
      dose2: data.vaksinasi.penambahan.jumlah_vaksinasi_2,
    },
    total: {
      dose1:
        data.vaksinasi.total.jumlah_vaksinasi_1 -
        data.vaksinasi.total.jumlah_vaksinasi_2,
      dose1plus: data.vaksinasi.total.jumlah_vaksinasi_1,
      dose2: data.vaksinasi.total.jumlah_vaksinasi_2,
    },
  };

  res.status(200).send(modifiedData);
});

app.get("/api/vaccination/all_daily", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );

  let modifiedData = data.vaksinasi.harian.map((data) => {
    return {
      date: new Date(data.key).toLocaleDateString("id-ID"),
      update: {
        dose1: data.jumlah_vaksinasi_1.value,
        dose1plus:
          data.jumlah_vaksinasi_1.value + data.jumlah_vaksinasi_2.value,
        dose2: data.jumlah_vaksinasi_2.value,
      },
      total: {
        dose1:
          data.jumlah_jumlah_vaksinasi_1_kum.value -
          data.jumlah_jumlah_vaksinasi_2_kum.value,
        dose1plus: data.jumlah_jumlah_vaksinasi_1_kum.value,
        dose2: data.jumlah_jumlah_vaksinasi_2_kum.value,
      },
    };
  });

  modifiedData = modifiedData.slice(42);

  res.status(200).send(modifiedData);
});

app.get("/api/testing", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );

  let modifiedData = {
    updateDate: dateConverter(data.pemeriksaan.penambahan.created),
    update: {
      pcrTcm: data.pemeriksaan.penambahan.jumlah_orang_pcr_tcm,
      antigen: data.pemeriksaan.penambahan.jumlah_orang_antigen,
      all:
        data.pemeriksaan.penambahan.jumlah_orang_pcr_tcm +
        data.pemeriksaan.penambahan.jumlah_orang_antigen,
      specimen: {
        pcrTcm: data.pemeriksaan.penambahan.jumlah_spesimen_pcr_tcm,
        antigen: data.pemeriksaan.penambahan.jumlah_spesimen_antigen,
        all:
          data.pemeriksaan.penambahan.jumlah_spesimen_pcr_tcm +
          data.pemeriksaan.penambahan.jumlah_spesimen_antigen,
      },
    },
    total: {
      pcrTcm: data.pemeriksaan.total.jumlah_orang_pcr_tcm,
      antigen: data.pemeriksaan.total.jumlah_orang_antigen,
      all:
        data.pemeriksaan.total.jumlah_orang_pcr_tcm +
        data.pemeriksaan.total.jumlah_orang_antigen,
      specimen: {
        pcrTcm: data.pemeriksaan.total.jumlah_spesimen_pcr_tcm,
        antigen: data.pemeriksaan.total.jumlah_spesimen_antigen,
        all:
          data.pemeriksaan.total.jumlah_spesimen_pcr_tcm +
          data.pemeriksaan.total.jumlah_spesimen_antigen,
      },
    },
  };

  res.status(200).send(modifiedData);
});

app.get("/api/risk_profile", async (req, res) => {
  const res1 = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );
  const dataTest = res1.data;

  const res2 = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/update.json`
  );
  const dataCase = res2.data;

  const caseTotal = dataCase.update.total.jumlah_positif;
  const deathTotal = dataCase.update.total.jumlah_meninggal;
  const recoveryTotal = dataCase.update.total.jumlah_sembuh;
  const testTotal =
    dataTest.pemeriksaan.total.jumlah_orang_pcr_tcm +
    dataTest.pemeriksaan.total.jumlah_orang_antigen;
  let case7days = dataCase.update.harian.slice(-7);
  let test7days = dataTest.pemeriksaan.harian.slice(-7);

  let caseSum = 0;
  let deathSum = 0;
  let recoveredSum = 0;
  let testSum = 0;

  case7days.forEach((data) => {
    caseSum += data.jumlah_positif.value;
    deathSum += data.jumlah_meninggal.value;
    recoveredSum += data.jumlah_sembuh.value;
  });

  test7days.forEach((data) => {
    testSum +=
      data.jumlah_orang_antigen.value + data.jumlah_orang_pcr_tcm.value;
  });

  const caseAverage = caseSum / 7;
  const deathAverage = deathSum / 7;
  const recoveredAverage = recoveredSum / 7;
  const testAverage = testSum / 7;

  //7daysAvg/pop*100,000
  let case100k7days = (caseAverage / INDO_POP) * 100000;
  let death100k7days = (deathAverage / INDO_POP) * 100000;
  case100k7days = parseFloat(case100k7days.toFixed(2));
  death100k7days = parseFloat(death100k7days.toFixed(2));

  let case100k = (caseTotal / INDO_POP) * 100000;
  let death100k = (deathTotal / INDO_POP) * 100000;
  case100k = parseFloat(case100k.toFixed(2));
  death100k = parseFloat(death100k.toFixed(2));

  //positive/totalTesting*100
  let weeklyPositive = (caseAverage / testAverage) * 100;
  weeklyPositive = parseFloat(weeklyPositive.toFixed(2));
  let totalPositive = (caseTotal / testTotal) * 100;
  totalPositive = parseFloat(totalPositive.toFixed(2));

  //CFR = death/(death+recovery)
  let cfr7days = (deathAverage / (deathAverage + recoveredAverage)) * 100;
  cfr7days = parseFloat(cfr7days.toFixed(2));
  let cfrTotal = (deathTotal / (deathTotal + recoveryTotal)) * 100;
  cfrTotal = parseFloat(cfrTotal.toFixed(2));

  //IFR = death/totalCase
  let ifr7days = (deathAverage / caseAverage) * 100;
  ifr7days = parseFloat(ifr7days.toFixed(2));
  let ifrTotal = (deathTotal / caseTotal) * 100;
  ifrTotal = parseFloat(ifrTotal.toFixed(2));
  let modifiedData = {
    // mortality: mortality,
    // rating: {
    updateDate: dateConverter(dataTest.pemeriksaan.penambahan.created),
    thisWeek: {
      casePer100k: case100k7days,
      deathPer100k: death100k7days,
      positive: weeklyPositive,
      cfr: cfr7days,
      ifr: ifr7days,
    },
    overall: {
      casePer100k: case100k,
      deathPer100k: death100k,
      positive: totalPositive,
      cfr: cfrTotal,
      ifr: ifrTotal,
    },
    // },
  };
  res.status(200).send(modifiedData);
});

app.get("/api/testing/all_daily", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/pemeriksaan-vaksinasi.json`
  );

  let modifiedData = data.pemeriksaan.harian.map((data) => {
    return {
      date: new Date(data.key).toLocaleDateString("id-ID"),
      update: {
        pcrTcm: data.jumlah_orang_pcr_tcm.value,
        antigen: data.jumlah_orang_antigen.value,
        all: data.jumlah_orang_pcr_tcm.value + data.jumlah_orang_antigen.value,
        specimen: {
          pcrTcm: data.jumlah_spesimen_pcr_tcm.value,
          antigen: data.jumlah_spesimen_antigen.value,
          all:
            data.jumlah_spesimen_pcr_tcm.value +
            data.jumlah_spesimen_antigen.value,
        },
      },
      total: {
        pcrTcm: data.jumlah_orang_pcr_tcm_kum.value,
        antigen: data.jumlah_orang_antigen_kum.value,
        all:
          data.jumlah_orang_pcr_tcm_kum.value +
          data.jumlah_orang_antigen_kum.value,
        specimen: {
          pcrTcm: data.jumlah_spesimen_pcr_tcm_kum.value,
          antigen: data.jumlah_spesimen_antigen_kum.value,
          all:
            data.jumlah_spesimen_pcr_tcm_kum.value +
            data.jumlah_spesimen_antigen_kum.value,
        },
      },
    };
  });

  res.status(200).send(modifiedData);
});

app.get("/api/kecamatan/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/kecamatan_rawan.json`
  );
  res.status(200).send(data);
});

app.get("/api/rumah_sakit/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/rs.json`
  );
  res.status(200).send(data);
});

app.get("/api/lab/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/lab.json`
  );
  res.status(200).send(data);
});

app.get("/api/province_all_daily/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_time.json`
  );
  res.status(200).send(data);
});

app.get("/api/province_simple/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/prov_list.json`
  );
  res.status(200).send(data);
});

app.get("/api/city_risk/raw", async (req, res) => {
  const { data } = await axios.get(
    `${PROXY_URL}https://data.covid19.go.id/public/api/skor.json`
  );
  res.status(200).send(data);
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API Live at port: ${PORT}`));
