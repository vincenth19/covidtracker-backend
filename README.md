# CovidTracker API (HTTP Proxy for CORS)

Hi everyone, this is API project that I made to gather COVID-19 data from Indonesian government.
I made this because there is a CORS error when using the government's API. Therefore, I need to have this backend to solve my issue.

I copied and modified [Reynadi531's API Project](https://github.com/Reynadi531/api-covid19-indonesia-v2)

APIs are deployed to [Heroku](https://covidtracker-vincenth19-be.herokuapp.com/api) and [Vercel](https://covidtracker-backend.vercel.app/api/)

Data source is from Indonesian government. \
[National Data](https://data.covid19.go.id/public/api/update.json) | [Basic Province Data](https://data.covid19.go.id/public/api/prov.json) | [Province Time Series Data](https://data.covid19.go.id/public/api/prov_detail_ACEH.json)

## API Endpoints
`/api/national` [Heroku Link](https://covidtracker-backend.vercel.app/api/national/) | [Vercel Link](https://covidtracker-vincenth19-be.herokuapp.com/api/national) \
Get COVID-19 data of Indonesia, total and daily update. Date format is DD/MM/YYYY and time is 24-hours.
#### Sample response:
```
{
  "modifiedData": {
    "update": {
      "positive": 38124, <- number
      "hospitalisation": 8278, <- number
      "recovered": 28975, <- number
      "death": 871, <- number
      "updateDate": "09-07-2021 16:12" <- string
    },
    "total": {
      "positive": 2455912, <- number
      "hospitalized": 367733, <- number
      "recovered": 2023548, <- number
      "death": 64631 <- number
    }
  }
}
```
---
`/api/national/all_daily` [Heroku Link](https://covidtracker-backend.vercel.app/api/national/all_daily) | [Vercel Link](https://covidtracker-vincenth19-be.herokuapp.com/api/national/all_daily)
<br/> Get daily data of COVID-19 from 3rd March 2020 until today (I hope this end soon).
#### Sample response:
```
{
  "dailyData": [
    {
      "positive": 0, <- number
      "hospitalisation": 0, <- number
      "recovered": 0, <- number
      "death": 0, <- number
      "total_positive": 2, <- number
      "total_hospitalized": 2, <- number
      "total_recovered": 0, <- number
      "total_death": 0, <- number
      "timestamp": 1583193600000 <- date, need to be converted (i.e. new Date(timestamp))
      "date": "2020-03-03T00:00:00.000Z" <- string
    },
    { more daily data object }
  ]
}
```
---
`/api/province` [Heroku Link](https://covidtracker-backend.vercel.app/api/province) | [Vercel Link](https://covidtracker-vincenth19-be.herokuapp.com/api/province) \
Get overview COVID-19 data for all Indonesian provinces. This is raw data, unmodified from the [source](https://data.covid19.go.id/public/api/prov.json). \
I would say the age demographic and gender data are not up to date. And the location is not useful if you don't need map integration. Maybe I will add raw data version and simplified data.
#### Sample response:
```
{
  "data": {
    "last_date": "2021-07-09", <- string
    "current_data": 100, <- number
    "missing_data": 0, <- number
    "tanpa_provinsi": 0, <- number
    "list_data": [
      {
        "key": "DKI JAKARTA", <- string
        "doc_count": 25.91242555170225,  <- floating point
        "jumlah_kasus": 636383, <- number
        "jumlah_sembuh": 527060, <- number
        "jumlah_meninggal": 9270, <- number
        "jumlah_dirawat": 100053, <- number
        "jenis_kelamin": [
          {
            "key": "LAKI-LAKI", <- string
            "doc_count": 310007 <- number
          },
          {
            "key": "PEREMPUAN",
            "doc_count": 315735 <- number
          }
        ],
        "kelompok_umur":[
          {
            "key": "0-5", <- string
            "doc_count": 20667, <- number
            "usia": {
              "value": 5 <- number
            }
          },
          { more age demographic data objects }
        ],
        "lokasi": {
          "lon": 106.83611829006928, <- floating point
          "lat": -6.204698991169558 <- floating point
        },
         "penambahan": {
          "positif": 13112, <- number
          "sembuh": 15022, <- number
          "meninggal": 138 <- number
        },
      }
    ]
  }
}
```
---
`/api/province/:provincename` [Heroku Sample Link](https://covidtracker-backend.vercel.app/api/province/DKI_JAKARTA) | [Vercel Sample Link](https://covidtracker-vincenth19-be.herokuapp.com/api/province/DKI_JAKARTA)
<br/> Get daily and overall data of COVID-19 per province from 1st March 2020 until today. Use underscore to replace space and param needs to be all capital letters (ex. DKI_JAKARTA). For now we can only query 1 province at a time.
#### Sample response (Jakarta):
```
{
  "dailyData": {
    "last_date": "2021-07-09", <- string
    "provinsi": "DKI JAKARTA", <- string
    "kasus_total": 636383, <- number
    "kasus_tanpa_tgl": 37, <- number
    "kasus_dengan_tgl": 636346, <- number
    "meninggal_persen": 1.4566699613283196, <- number
    "meninggal_tanpa_tgl": 20, <- number
    "meninggal_dengan_tgl": 9250, <- number
    "sembuh_persen": 82.82119415509214, <- floating point
    "sembuh_tanpa_tgl": 139, <- number
    "sembuh_dengan_tgl": 526921, <- number
    "list_perkembangan": [
      {
        "tanggal": 1583020800000, <- date, need to be converted (i.e. new Date(timestamp))
        "KASUS": 2, <- number
        "MENINGGAL": 0, <- number
        "SEMBUH": 0, <- number
        "DIRAWAT_OR_ISOLASI": 2, <- number
        "AKUMULASI_KASUS": 2, <- number
        "AKUMULASI_SEMBUH": 0, <- number
        "AKUMULASI_MENINGGAL": 0, <- number
        "AKUMULASI_DIRAWAT_OR_ISOLASI": 2 <- number
      }
      { more daily data objects here}
    ]
  },
}
```
---
# How to Run This?
### Prequisite:
[NodeJS](http://google.com)

### Steps:
1. Clone this project.
2. Go to project directory in your terminal/command prompt.
3. Execute/type and run `node .`

This APIs are very basic, it does not even have error handling. \
I'm still learning because backend isn't my forte. \ 

### I hope you find this useful. Stay safe and healthy!
