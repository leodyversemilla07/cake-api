const express = require('express');
const router = express.Router();
const cakesController = require('../controllers/cakes.controller');

router.get('/', cakesController.getAllCakes);
router.get('/:id', cakesController.getCakeById);
router.post('/', cakesController.createCake);
router.patch('/:id', cakesController.updateCake);
router.delete('/:id', cakesController.deleteCake);

module.exports = router;
