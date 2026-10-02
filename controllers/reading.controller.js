const mongoose = require("mongoose");

const GenerationReading =
  require("../models/GenerationReading");

const SolarInstallation =
  require("../models/SolarInstallation");

const GridSubstation =
  require("../models/GridSubstation");

const District =
  require("../models/District");

const Province =
  require("../models/Provinces");

async function createReading(req, res) {
  const installationId = req.params.installationId;

  if (
    req.auth.type !== "DEVICE" ||
    req.auth.installationId !== installationId
  ) {
    return res.status(403).json({
      code: "DEVICE_SCOPE_VIOLATION",
      message: "The device cannot write readings for this installation.",
      detail:
        "A device may only submit readings for the installation to which it is authenticated."
    });
  }

  const installation =
    await SolarInstallation.findById(
      installationId
    );

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No installation exists with ID ${installationId}.`
    });
  }

  const {
    timestamp,
    powerKw,
    energyKwh,
    voltage
  } = req.body;

  const reading =
    await GenerationReading.create({
      installationId,
      timestamp,
      powerKw,
      energyKwh,
      voltage
    });

  res
    .status(201)
    .location(
      `/api/installations/${installationId}/readings/${reading._id}`
    )
    .json({
      data: reading
    });
}

async function getReading(req, res) {
  const reading =
    await GenerationReading.findOne({
      _id: req.params.readingId,
      installationId: req.params.installationId
    }).lean();

  if (!reading) {
    return res.status(404).json({
      code: "READING_NOT_FOUND",
      message: "Generation reading not found.",
      detail:
        "The requested reading does not exist for this installation."
    });
  }

  res.status(200).json({
    data: reading
  });
}

async function getInstallationReadings(req, res) {
  const installationId =
    req.params.installationId;

  const page = Math.max(
    parseInt(req.query.page || "1", 10),
    1
  );

  const limit = Math.min(
    Math.max(
      parseInt(req.query.limit || "20", 10),
      1
    ),
    100
  );

  const sortDirection =
    req.query.sort === "asc" ? 1 : -1;

  const filter = {
    installationId:
      new mongoose.Types.ObjectId(installationId)
  };

  if (req.query.from || req.query.to) {
    filter.timestamp = {};

    if (req.query.from) {
      filter.timestamp.$gte =
        new Date(req.query.from);
    }

    if (req.query.to) {
      filter.timestamp.$lte =
        new Date(req.query.to);
    }
  }

  const skip = (page - 1) * limit;

  const [totalCount, readings] =
    await Promise.all([
      GenerationReading.countDocuments(filter),

      GenerationReading.find(filter)
        .sort({
          timestamp: sortDirection
        })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

  const totalPages =
    Math.ceil(totalCount / limit);

  const baseUrl =
    `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

  const createUrl = (pageNumber) => {
    const params = new URLSearchParams();

    params.set("page", pageNumber);
    params.set("limit", limit);

    if (req.query.from) {
      params.set("from", req.query.from);
    }

    if (req.query.to) {
      params.set("to", req.query.to);
    }

    if (req.query.sort) {
      params.set("sort", req.query.sort);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  res.status(200).json({
    page,
    limit,
    totalCount,
    totalPages,
    data: readings,
    links: {
      previous:
        page > 1
          ? createUrl(page - 1)
          : null,

      next:
        page < totalPages
          ? createUrl(page + 1)
          : null
    }
  });
}

async function getLastReading(req, res) {
  const reading =
    await GenerationReading.findOne({
      installationId: req.params.installationId
    })
      .sort({
        timestamp: -1
      })
      .lean();

  if (!reading) {
    return res.status(404).json({
      code: "NO_READING_AVAILABLE",
      message: "No generation reading is available.",
      detail:
        "The installation does not have a generation reading."
    });
  }

  res.status(200).json({
    data: reading
  });
}

async function getAllReadings(req, res) {
  const page = Math.max(
    parseInt(req.query.page || "1", 10),
    1
  );

  const limit = Math.min(
    Math.max(
      parseInt(req.query.limit || "20", 10),
      1
    ),
    100
  );

  const filter = {};

  if (req.query.from || req.query.to) {
    filter.timestamp = {};

    if (req.query.from) {
      filter.timestamp.$gte =
        new Date(req.query.from);
    }

    if (req.query.to) {
      filter.timestamp.$lte =
        new Date(req.query.to);
    }
  }

  let installationIds = null;

  if (
    req.query.provinceId ||
    req.query.districtId ||
    req.query.substationId
  ) {
    let substationIds = null;

    if (req.query.provinceId) {
      const districts =
        await District.find({
          provinceId: req.query.provinceId
        })
          .select("_id")
          .lean();

      const districtIds =
        districts.map((item) => item._id);

      const substations =
        await GridSubstation.find({
          districtId: {
            $in: districtIds
          }
        })
          .select("_id")
          .lean();

      substationIds =
        substations.map((item) => item._id);
    }

    if (req.query.districtId) {
      const substations =
        await GridSubstation.find({
          districtId:
            req.query.districtId
        })
          .select("_id")
          .lean();

      substationIds =
        substations.map((item) => item._id);
    }

    if (req.query.substationId) {
      substationIds = [
        new mongoose.Types.ObjectId(
          req.query.substationId
        )
      ];
    }

    const installations =
      await SolarInstallation.find({
        substationId: {
          $in: substationIds || []
        }
      })
        .select("_id")
        .lean();

    installationIds =
      installations.map(
        (item) => item._id
      );

    filter.installationId = {
      $in: installationIds
    };
  }

  const skip = (page - 1) * limit;

  const sortDirection =
    req.query.sort === "asc" ? 1 : -1;

  const [totalCount, readings] =
    await Promise.all([
      GenerationReading.countDocuments(filter),

      GenerationReading.find(filter)
        .sort({
          timestamp: sortDirection
        })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

  const totalPages =
    Math.ceil(totalCount / limit);

  res.status(200).json({
    page,
    limit,
    totalCount,
    totalPages,
    sort:
      sortDirection === 1
        ? "timestamp ascending"
        : "timestamp descending",
    data: readings
  });
}

module.exports = {
  createReading,
  getReading,
  getInstallationReadings,
  getLastReading,
  getAllReadings
};