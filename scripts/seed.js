require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDatabase = require("../config/database");

const Province = require("../models/Provinces");
const District = require("../models/District");
const GridSubstation = require("../models/GridSubstation");
const SolarInstallation = require("../models/SolarInstallation");
const GenerationReading = require("../models/GenerationReading");
const User = require("../models/User");


// =====================================================
// SEED CONFIGURATION
// =====================================================

const INSTALLATION_COUNT = 250;

// Coursework requires at least one week.
// 7 days × 24 hours × 4 readings per hour
// = 672 readings per installation.
const DAYS = 7;

const INTERVAL_MINUTES = 15;

const READINGS_PER_INSTALLATION =
  DAYS * 24 * (60 / INTERVAL_MINUTES);

// 250 × 672 = 168,000
const EXPECTED_TOTAL_READINGS =
  INSTALLATION_COUNT *
  READINGS_PER_INSTALLATION;

// Insert readings in batches rather than
// inserting one document at a time.
const BATCH_SIZE = 5000;


// =====================================================
// PROVINCES
// =====================================================

const provinceData = [
  {
    name: "Western Province",
    code: "WP"
  },
  {
    name: "Central Province",
    code: "CP"
  },
  {
    name: "Southern Province",
    code: "SP"
  },
  {
    name: "Northern Province",
    code: "NP"
  },
  {
    name: "Eastern Province",
    code: "EP"
  },
  {
    name: "North Western Province",
    code: "NWP"
  },
  {
    name: "North Central Province",
    code: "NCP"
  },
  {
    name: "Uva Province",
    code: "UP"
  },
  {
    name: "Sabaragamuwa Province",
    code: "SGP"
  }
];


// =====================================================
// DISTRICTS
// =====================================================

const districtData = [
  {
    name: "Colombo",
    province: "Western Province"
  },
  {
    name: "Gampaha",
    province: "Western Province"
  },
  {
    name: "Kalutara",
    province: "Western Province"
  },

  {
    name: "Kandy",
    province: "Central Province"
  },
  {
    name: "Matale",
    province: "Central Province"
  },
  {
    name: "Nuwara Eliya",
    province: "Central Province"
  },

  {
    name: "Galle",
    province: "Southern Province"
  },
  {
    name: "Matara",
    province: "Southern Province"
  },
  {
    name: "Hambantota",
    province: "Southern Province"
  },

  {
    name: "Jaffna",
    province: "Northern Province"
  },
  {
    name: "Kilinochchi",
    province: "Northern Province"
  },
  {
    name: "Mannar",
    province: "Northern Province"
  },
  {
    name: "Mullaitivu",
    province: "Northern Province"
  },
  {
    name: "Vavuniya",
    province: "Northern Province"
  },

  {
    name: "Batticaloa",
    province: "Eastern Province"
  },
  {
    name: "Ampara",
    province: "Eastern Province"
  },
  {
    name: "Trincomalee",
    province: "Eastern Province"
  },

  {
    name: "Kurunegala",
    province: "North Western Province"
  },
  {
    name: "Puttalam",
    province: "North Western Province"
  },

  {
    name: "Anuradhapura",
    province: "North Central Province"
  },
  {
    name: "Polonnaruwa",
    province: "North Central Province"
  },

  {
    name: "Badulla",
    province: "Uva Province"
  },
  {
    name: "Monaragala",
    province: "Uva Province"
  },

  {
    name: "Ratnapura",
    province: "Sabaragamuwa Province"
  },
  {
    name: "Kegalle",
    province: "Sabaragamuwa Province"
  }
];


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInteger(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function round(value, decimalPlaces = 3) {
  const multiplier =
    Math.pow(10, decimalPlaces);

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}


// =====================================================
// REALISTIC SOLAR GENERATION
// =====================================================

function generateSolarPower(
  timestamp,
  capacityKw,
  weatherFactor
) {
  const hour =
    timestamp.getUTCHours() +
    timestamp.getUTCMinutes() / 60;

  /*
    Solar generation pattern:

    00:00 - 05:30
    Night → 0 kW

    05:30 - 12:00
    Morning → increasing

    Around midday
    → highest generation

    12:00 - 18:30
    Afternoon → decreasing

    18:30 - 24:00
    Night → 0 kW
  */

  const sunrise = 5.5;
  const sunset = 18.5;

  // Night
  if (
    hour < sunrise ||
    hour >= sunset
  ) {
    return 0;
  }

  /*
    Convert daylight time to a value
    between 0 and 1.
  */

  const daylightProgress =
    (hour - sunrise) /
    (sunset - sunrise);

  /*
    Sine curve:

    sunrise → 0
    midday  → approximately 1
    sunset  → 0
  */

  const solarCurve =
    Math.sin(
      Math.PI *
      daylightProgress
    );

  /*
    Base generation.
  */

  let power =
    capacityKw *
    solarCurve *
    weatherFactor;

  /*
    Small measurement variation.

    This prevents every reading from
    being mathematically identical.
  */

  power *= randomBetween(
    0.97,
    1.03
  );

  /*
    Never exceed installation capacity.
  */

  power =
    Math.min(
      power,
      capacityKw
    );

  /*
    Never become negative.
  */

  power =
    Math.max(
      power,
      0
    );

  return round(power, 3);
}


// =====================================================
// CREATE PROVINCES
// =====================================================

async function seedProvinces() {
  const provinces =
    await Province.insertMany(
      provinceData
    );

  console.log(
    `✓ Created ${provinces.length} provinces`
  );

  return provinces;
}


// =====================================================
// CREATE DISTRICTS
// =====================================================

async function seedDistricts(
  provinces
) {
  const provinceMap =
    new Map();

  provinces.forEach(
    (province) => {
      provinceMap.set(
        province.name,
        province._id
      );
    }
  );

  const districts =
    districtData.map(
      (district) => ({
        name: district.name,

        provinceId:
          provinceMap.get(
            district.province
          )
      })
    );

  const created =
    await District.insertMany(
      districts
    );

  console.log(
    `✓ Created ${created.length} districts`
  );

  return created;
}


// =====================================================
// CREATE SUBSTATIONS
// =====================================================

async function seedSubstations(
  districts
) {
  const substations = [];

  /*
    We create one substation for
    every district.

    25 districts
    =
    25 substations
  */

  districts.forEach(
    (district, index) => {
      substations.push({
        name:
          `${district.name} Grid Substation`,

        code:
          `SUB-${String(
            index + 1
          ).padStart(3, "0")}`,

        districtId:
          district._id
      });
    }
  );

  const created =
    await GridSubstation.insertMany(
      substations
    );

  console.log(
    `✓ Created ${created.length} substations`
  );

  return created;
}


// =====================================================
// CREATE INSTALLATIONS
// =====================================================

async function seedInstallations(
  substations
) {
  const installations = [];

  for (
    let i = 0;
    i < INSTALLATION_COUNT;
    i++
  ) {
    const substation =
      substations[
        i % substations.length
      ];

    const installationNumber =
      i + 1;

    /*
      Household solar systems between
      3 kW and 10 kW.
    */

    const capacityKw =
      randomInteger(3, 10);

    installations.push({
      name:
        `Solar Installation ${String(
          installationNumber
        ).padStart(3, "0")}`,

      meterId:
        `METER-${String(
          installationNumber
        ).padStart(4, "0")}`,

      inverterId:
        `INV-${String(
          installationNumber
        ).padStart(4, "0")}`,

      capacityKw,

      substationId:
        substation._id,

      latitude:
        round(
          randomBetween(
            5.9,
            9.8
          ),
          6
        ),

      longitude:
        round(
          randomBetween(
            79.7,
            81.9
          ),
          6
        ),

      status: "ACTIVE",

      /*
        Device password is stored as a hash,
        matching the existing backend model.
      */

      devicePasswordHash:
        await bcrypt.hash(
          `Device@${String(
            installationNumber
          ).padStart(4, "0")}`,
          10
        )
    });
  }

  const created =
    await SolarInstallation.insertMany(
      installations
    );

  console.log(
    `✓ Created ${created.length} installations`
  );

  return created;
}


// =====================================================
// CREATE GENERATION READINGS
// =====================================================

async function seedReadings(
  installations
) {
  console.log(
    "\nGenerating generation readings..."
  );

  let batch = [];

  let totalInserted = 0;

  /*
    Start exactly seven days before
    the seed is executed.
  */

  const startTime =
    new Date(
      Date.now() -
      DAYS *
      24 *
      60 *
      60 *
      1000
    );

  /*
    Align the first timestamp to
    a 15-minute boundary.
  */

  startTime.setUTCMinutes(
    Math.floor(
      startTime.getUTCMinutes() /
      INTERVAL_MINUTES
    ) *
    INTERVAL_MINUTES
  );

  startTime.setUTCSeconds(0);

  startTime.setUTCMilliseconds(0);


  for (
    let installationIndex = 0;
    installationIndex <
    installations.length;
    installationIndex++
  ) {
    const installation =
      installations[
        installationIndex
      ];

    let cumulativeEnergy = 0;


    /*
      Generate 672 readings
      for this installation.
    */

    for (
      let readingIndex = 0;
      readingIndex <
      READINGS_PER_INSTALLATION;
      readingIndex++
    ) {
      const timestamp =
        new Date(
          startTime.getTime() +
          readingIndex *
          INTERVAL_MINUTES *
          60 *
          1000
        );


      /*
        Create a slightly different
        weather condition for each day.

        Values approximately range from:

        0.70 = cloudier
        0.80 = partly cloudy
        0.90 = mostly clear
        1.00 = clear
      */

      const dayIndex =
        Math.floor(
          readingIndex /
          (24 * 60 /
          INTERVAL_MINUTES)
        );

      const weatherFactor =
        0.70 +
        (
          (
            installationIndex +
            dayIndex
          ) % 4
        ) *
        0.10;


      /*
        Generate instantaneous power.
      */

      const powerKw =
        generateSolarPower(
          timestamp,
          installation.capacityKw,
          weatherFactor
        );


      /*
        Energy generated during
        this 15-minute interval.

        15 minutes = 0.25 hours

        Energy = Power × Time
      */

      const intervalHours =
        INTERVAL_MINUTES / 60;

      const generatedEnergy =
        powerKw *
        intervalHours;

      cumulativeEnergy =
        round(
          cumulativeEnergy +
          generatedEnergy,
          3
        );


      /*
        Generate realistic voltage.
      */

      const voltage =
        round(
          randomBetween(
            220,
            240
          ),
          2
        );


      batch.push({
        installationId:
          installation._id,

        timestamp,

        powerKw,

        energyKwh:
          cumulativeEnergy,

        voltage
      });


      /*
        Insert every 5,000 records.
      */

      if (
        batch.length >=
        BATCH_SIZE
      ) {
        const inserted =
          await GenerationReading.insertMany(
            batch,
            {
              ordered: false
            }
          );

        totalInserted +=
          inserted.length;

        console.log(
          `  Inserted ${totalInserted} readings`
        );

        batch = [];
      }
    }
  }


  /*
    Insert final remaining records.
  */

  if (
    batch.length > 0
  ) {
    const inserted =
      await GenerationReading.insertMany(
        batch,
        {
          ordered: false
        }
      );

    totalInserted +=
      inserted.length;
  }


  console.log(
    `✓ Created ${totalInserted} generation readings`
  );

  return totalInserted;
}


// =====================================================
// CREATE TEST USERS
// =====================================================

async function seedUsers(
  provinces,
  districts
) {
  const westernProvince =
    provinces.find(
      (province) =>
        province.code === "WP"
    );

  const northWesternProvince =
    provinces.find(
      (province) =>
        province.code === "NWP"
    );

  const kurunegala =
    districts.find(
      (district) =>
        district.name ===
        "Kurunegala"
    );

  const gampaha =
    districts.find(
      (district) =>
        district.name ===
        "Gampaha"
    );


  const password =
    "Password@123";

  const passwordHash =
    await bcrypt.hash(
      password,
      10
    );


  const users = [
    {
      name:
        "National Administrator",

      email:
        "national@slsea.gov.lk",

      passwordHash,

      role:
        "NATIONAL",

      provinceId:
        null,

      districtId:
        null
    },

    {
      name:
        "Western Province Officer",

      email:
        "western@slsea.gov.lk",

      passwordHash,

      role:
        "PROVINCIAL",

      provinceId:
        westernProvince._id,

      districtId:
        null
    },

    {
      name:
        "Kurunegala District Officer",

      email:
        "kurunegala@slsea.gov.lk",

      passwordHash,

      role:
        "DISTRICT",

      provinceId:
        northWesternProvince._id,

      districtId:
        kurunegala._id
    },

    {
      name:
        "Gampaha District Officer",

      email:
        "gampaha@slsea.gov.lk",

      passwordHash,

      role:
        "DISTRICT",

      provinceId:
        westernProvince._id,

      districtId:
        gampaha._id
    }
  ];


  const created =
    await User.insertMany(
      users
    );


  console.log(
    `✓ Created ${created.length} test users`
  );


  console.log(
    "\n======================================"
  );

  console.log(
    "TEST USER CREDENTIALS"
  );

  console.log(
    "======================================"
  );

  console.log(
    "National:"
  );

  console.log(
    "  Email: national@slsea.gov.lk"
  );

  console.log(
    "  Password: Password@123"
  );

  console.log("");

  console.log(
    "Provincial:"
  );

  console.log(
    "  Email: western@slsea.gov.lk"
  );

  console.log(
    "  Password: Password@123"
  );

  console.log("");

  console.log(
    "District:"
  );

  console.log(
    "  Email: kurunegala@slsea.gov.lk"
  );

  console.log(
    "  Password: Password@123"
  );

  console.log(
    "======================================\n"
  );


  return created;
}


// =====================================================
// MAIN SEED
// =====================================================

async function seed() {
  try {
    console.log(
      "======================================"
    );

    console.log(
      "SOLAR GENERATION DATABASE SEED"
    );

    console.log(
      "======================================"
    );

    console.log(
      `Installations: ${INSTALLATION_COUNT}`
    );

    console.log(
      `Days: ${DAYS}`
    );

    console.log(
      `Interval: ${INTERVAL_MINUTES} minutes`
    );

    console.log(
      `Readings per installation: ${READINGS_PER_INSTALLATION}`
    );

    console.log(
      `Expected readings: ${EXPECTED_TOTAL_READINGS}`
    );

    console.log(
      "======================================\n"
    );


    // -------------------------------------------------
    // Connect
    // -------------------------------------------------

    await connectDatabase();


    // -------------------------------------------------
    // Delete existing data
    // -------------------------------------------------

    console.log(
      "Deleting existing data..."
    );

    await GenerationReading.deleteMany({});
    await SolarInstallation.deleteMany({});
    await GridSubstation.deleteMany({});
    await District.deleteMany({});
    await Province.deleteMany({});
    await User.deleteMany({});

    console.log(
      "✓ Existing data deleted\n"
    );


    // -------------------------------------------------
    // Create hierarchy
    // -------------------------------------------------

    const provinces =
      await seedProvinces();

    const districts =
      await seedDistricts(
        provinces
      );

    const substations =
      await seedSubstations(
        districts
      );

    const installations =
      await seedInstallations(
        substations
      );


    // -------------------------------------------------
    // Create readings
    // -------------------------------------------------

    const readingCount =
      await seedReadings(
        installations
      );


    // -------------------------------------------------
    // Create users
    // -------------------------------------------------

    await seedUsers(
      provinces,
      districts
    );


    // -------------------------------------------------
    // Final summary
    // -------------------------------------------------

    console.log(
      "\n======================================"
    );

    console.log(
      "SEED COMPLETED SUCCESSFULLY"
    );

    console.log(
      "======================================"
    );

    console.log(
      `Provinces:      ${provinces.length}`
    );

    console.log(
      `Districts:      ${districts.length}`
    );

    console.log(
      `Substations:    ${substations.length}`
    );

    console.log(
      `Installations:  ${installations.length}`
    );

    console.log(
      `Readings:       ${readingCount}`
    );

    console.log(
      `Days:            ${DAYS}`
    );

    console.log(
      `Interval:        ${INTERVAL_MINUTES} minutes`
    );

    console.log(
      "======================================"
    );

  } catch (error) {
    console.error(
      "\nSEED FAILED:"
    );

    console.error(error);

    process.exitCode = 1;

  } finally {
    await mongoose.connection.close();
  }
}

seed();