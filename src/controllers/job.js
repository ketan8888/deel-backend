const Models = require('../model');

async function getUnpaidJobs(req, res) {

  const profile = req.profile;
  const profileId = profile.id
  const userCondition = profile.type === 'client' ? 'ClientId' : 'ContractorId';

  try {

    const data = await Models.Job.findAll({
      where: { paid: null },
      include: [{
        model: Models.Contract,
        attributes: [],
        where: {
          "status": "in_progress",
          [userCondition]: profileId
        }
      }]
    });
    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({ error: error });

  }

}

async function payForJob(req, res) {

  let dbTransaction;

  const profile = req.profile;
  const jobId = req.params.job_id;
  const profileId = req.profile.id;

  try {

    if (profile.type !== 'client') return res.status(400).json({ message: 'Invalid Request' });

    // const isUserHasOngoingRequest = await redis.get(profileId);

    // if(isUserHasOngoingRequest) return res.status(200).json({ message: 'Already requested for payment, Please try again'});

    const jobDetails = await Models.Job.findOne({
      where: { id: jobId },
      include: [{
        attributes: ['ContractorId',],
        model: Models.Contract,
        where: {
          "ClientId": profileId
        }
      }],
    });

    if (!jobDetails) return res.status(400).json({ message: 'Job details not found' });

    if (jobDetails.paid) return res.status(400).json({ message: 'Already paid' });

    if (jobDetails.price > req.profile.balance) return res.status(400).json({ message: 'Insufficient balance in account' });

    const contractor = await Models.Profile.findOne({ where: { type: 'contractor', id: jobDetails.Contract.ContractorId } });

    // await redis.set(profileId, { jobId }, 300) // Set value for 3 mins.

    dbTransaction = await Models.sequelize.transaction({ autocommit: false });

    const updatedBalanceForClient = profile.balance - jobDetails.price;
    const updatedBalanceForContractor = contractor.balance + jobDetails.price;

    await Models.Profile.update({ balance: updatedBalanceForClient }, { where: { id: profileId }, transaction: dbTransaction });

    await Models.Profile.update({ balance: updatedBalanceForContractor }, { where: { id: contractor.id }, transaction: dbTransaction });

    await Models.Job.update({ paid: true, paymentDate: new Date().toISOString() }, { where: { id: jobId }, transaction: dbTransaction });

    await dbTransaction.commit();

    // await redis.delete(profileId);

    res.status(200).send(jobDetails);

  } catch (error) {

    if (dbTransaction) dbTransaction.rollback(); // Better handling if needed to perform more db operation

    return res.status(500).json({ error });

  }

}

module.exports = { getUnpaidJobs, payForJob };