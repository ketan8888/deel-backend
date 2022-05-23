const Models = require('../model');

const requestValidator = async (req, res, next) => {

  try {

    const profileId = req.headers.profile_id;

    if (!profileId) return res.status(400).send({ message: 'Please provide valid Profile Id' })

    const profile = await Models.Profile.findOne({ where: { id: profileId }, raw: true });

    if (!profile) return res.status(401).send({ message: 'Profiles does not exist' });

    req.profile = profile

    next()

  } catch (err) {

    return res.status(500).send({ message: 'Something went wrong, Please try again later' });

  }

}
module.exports = { requestValidator }

