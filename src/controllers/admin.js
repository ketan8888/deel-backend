const Models = require('../model');

async function bestContractors(req, res) {

  try {

    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    const jobs = await Models.Job.findOne({
      attributes: [[Models.sequelize.fn('sum', Models.sequelize.col('price')), 'total_income']],
      where: {
        paid: true,
        paymentDate: { $between: [startDate, endDate] }
      },
      include: [{
        attributes: ['ContractorId'],
        model: Models.Contract,
      }],
      raw: true,
      group: ['Contract.ContractorId'],
      order: [[Models.sequelize.fn('sum', Models.sequelize.col('price')), 'DESC']]
    });

    if (!jobs) return res.status(200).json({});

    const contractorDetails = await Models.Profile.findOne({
      where: {
        id: jobs['Contract.ContractorId']
      },
      raw: true,
    });

    return res.status(200).json({ ...contractorDetails, total_income: jobs.total_income });

  } catch (err) {

    return res.status(500).json({ message: 'Something went wrong, Please try again later' });
  }

}

async function bestClients(req, res) {

  try {

    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const limit = req.query.limit || 10;

    const jobs = await Models.Job.findAll({
      as: 'Job',
      attributes: [[Models.sequelize.fn('sum', Models.sequelize.col('price')), 'paid'], "Contract.Client.id", [Models.sequelize.literal("firstName || ' ' || lastName"), 'fullName']],
      where: {
        paid: true,
        paymentDate: { $between: [startDate, endDate] }
      },
      include: [{
        attributes: [],
        model: Models.Contract,
        include: [{
          model: Models.Profile,
          as: 'Client',
          attributes: []
        }],
      }],
      raw: true,
      group: ['Contract.clientId'],
      order: [[Models.sequelize.fn('sum', Models.sequelize.col('price')), 'DESC']],
      limit
    });

    return res.status(200).json(jobs);

  } catch (err) {

    return res.status(500).json({ message: 'Something went wrong, Please try again later' });
  }
}

module.exports = { bestContractors, bestClients }