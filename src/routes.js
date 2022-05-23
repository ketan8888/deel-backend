const express = require('express');

const { requestValidator } = require('./middleware/validate-request');

const { getContractsById, getContracts } = require('./controllers/contracts');
const { getUnpaidJobs, payForJob } = require('./controllers/job');
const { addBalance } = require('./controllers/balance');

const { bestContractors, bestClients } = require('./controllers/admin');

const router = express.Router();

router.get('/contracts/:id', requestValidator, getContractsById);

router.get('/contracts/', requestValidator, getContracts);

router.get('/jobs/unpaid', requestValidator, getUnpaidJobs);

router.get('/jobs/:job_id/pay', requestValidator, payForJob);

router.post('/balances/deposit/:userId', requestValidator, addBalance);

router.get('/admin/best-profession', bestContractors);

router.get('/admin/best-clients', bestClients);

module.exports = router;