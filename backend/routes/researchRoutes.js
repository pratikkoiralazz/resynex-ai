const express = require('express');
const router = express.Router();
const controller = require('../controllers/researchController');

router.post('/', controller.createSession);
router.get('/', controller.getSessions);
router.get('/:id', controller.getSessionById);
router.get('/:id/status', controller.getStatus);
router.get('/:id/sources', controller.getSources);
router.get('/:id/report', controller.getReport);
router.delete('/:id', controller.deleteSession);

module.exports = router;