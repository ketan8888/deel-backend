const Models = require('../model');

async function addBalance(req, res) {

  const profile = req.profile;
  const profileId = profile.id
  const depositAmountReq = req.body.balance;

  try {

    const totalJob = await Models.Contract.findAll({
      where: { clientId: profileId },
      raw: true,
      attributes: [[Models.sequelize.fn('sum', Models.sequelize.col('Jobs.price')), 'total_amount']],
      include: [{
        attributes: [],
        model: Models.Job,
        where: {
          "paid": null
        }
      }],
    });

    if (!totalJob || !totalJob.length || !totalJob[0].total_amount) return res.status(400).send({ message: 'Not having any jobs for this account' });

    const allowedDepositAmount = totalJob[0].total_amount / 4;

    if (depositAmountReq > allowedDepositAmount) return res.status(400).send({ message: `Allowed balance limit ${Math.floor(allowedDepositAmount)}, Can't deposit more that it` });

    const totalBalance = profile.balance + depositAmountReq;

    await Models.Profile.update({ balance: totalBalance }, { where: { id: profileId } });

    return res.status(200).send({ ...profile, balance: totalBalance });

  } catch (err) {

    return res.send(500).send({ message: err.message });

  }
}
module.exports = { addBalance }