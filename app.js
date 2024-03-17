const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')
app.use(express.json())
let database = null

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Running')
    })
  } catch (e) {
    console.log(`Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// API 1 GET ALL
app.get('/states/', async (request, response) => {
  const getAllQuery = `
            SELECT *
            FROM state;
        `
  const listOfgetAllQuery = await database.all(getAllQuery)
  response.send(
    listOfgetAllQuery.map(eachObject => covertToResponseObject(eachObject)),
  )
})

// covert To Response Object
function covertToResponseObject(eachObject) {
  return {
    stateId: eachObject.state_id,
    stateName: eachObject.state_name,
    population: eachObject.population,
  }
}

// API 2 GET ONE
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getOneQuery = `
            SELECT *
            FROM state
            WHERE state_id = ${stateId};
        `
  const listOfgetOneQuery = await database.get(getOneQuery)
  response.send(covertToResponseObject(listOfgetOneQuery))
})

// API 3 POST
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postQuery = `
      INSERT INTO district
      (district_name, state_id, cases, cured, active, deaths)
      VALUES
      (${districtName}, ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});
    `
  const posting = await database.run(postQuery)
  response.send('District Successfully Added')
})

// API 4 GET
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getOneQuery = `
            SELECT *
            FROM district
            WHERE district_id = ${stateId};
        `
  const oneDistrictQuery = await database.get(getOneQuery)
  response.send(covertToDistrictResponseObject(oneDistrictQuery))
})

// covert To District Response Object
function covertToDistrictResponseObject(dbObject) {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

// API 5 DELETE
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = `
      DELETE FROM district
      WHERE district_id = ${districtId};
    `
  await database.run(deleteQuery)
  response.send('District Removed')
})

// API 6 PUT
app.put('/districts/:districtId/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const {districtId} = request.params
  const putQuery = `
      UPDATE district
      SET district_name = ${districtName},
          state_id = ${stateId}
          cases = ${cases}
          cured = ${cured}
          active = ${active}
          deaths = ${deaths}
      WHERE district_id = ${districtId};
    `
  await database.run(putQuery)
  response.send('District Details Updated')
})

// API 7 GET ONE
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getOneQuery = `
            SELECT cases, cured, active, deaths
            FROM district
            WHERE state_id = ${stateId};
        `
  const stateId_stats = await database.get(getOneQuery)
  response.send(covertToResponseObjectStateId_stats(stateId_stats))
})

// covert To Response Object StateId_stats
function covertToResponseObjectStateId_stats(dbobject) {
  return {
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  }
}

// API 8 GET
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getOneQuery = `
            SELECT state_name
            FROM district
            WHERE district_id = ${districtId};
        `
  const districtId_stats = await database.get(getOneQuery)
  response.send(covertToResponseObjectdistrictId(districtId_stats))
})

function covertToResponseObjectdistrictId(dbObject){
  return {
    stateName: dbObject.state_name
  }
}

module.exports = express;