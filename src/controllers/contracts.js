const Models = require('../model');

async function getContracts(req, res) {

  const profileId = req.profile.id;

  try {

    const contract = await Models.Contract.findAll({ where: { clientId: profileId, status: { $ne: 'terminated' } } });

    if (!contract) return res.status(404).end();

    return res.json(contract);

  } catch (error) {

    // logger.error('Contracts Controller', 'Get Contracts', { error, resource: '/', profile_id: profileId });

    return res.status(500).send({ message: 'Something went wrong, Please try again later' });

  }

}

async function getContractsById(req, res) {

  const profileId = req.profile.id;

  const { id: contractsId } = req.params;

  try {


    const contract = await Models.Contract.findOne({ where: { id: contractsId, clientId: profileId } });

    if (!contract) return res.status(404).end();

    return res.json(contract);

  } catch (error) {

    // Implement logger as well slack alert for better error handling.

    // Also can use sentry for tracking user wise error

    // logger.error('Contracts Controller', 'Get Contracts', { error, resource: ':/id', profile_id: profileId, contractor_id: contractsId });

    return res.status(500).send({ message: 'Something went wrong, Please try again later' });

  }
};


module.exports = { getContractsById, getContracts }