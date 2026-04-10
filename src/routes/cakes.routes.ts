import express from 'express';
import cakesController from '../controllers/cakes.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cakes
 *   description: The cakes management API
 */

/**
 * @swagger
 * /cake:
 *   get:
 *     summary: Returns the list of all the cakes
 *     tags: [Cakes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: The list of the cakes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cake'
 */
router.get('/', cakesController.getAllCakes);

/**
 * @swagger
 * /cake/search:
 *   get:
 *     summary: Search for cakes by name, description, or flavor
 *     tags: [Cakes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: The list of matching cakes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cake'
 *       400:
 *         description: Missing query parameter
 */
router.get('/search', cakesController.searchCakes);

/**
 * @swagger
 * /cake/{id}:
 *   get:
 *     summary: Get the cake by id
 *     tags: [Cakes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cake id
 *     responses:
 *       200:
 *         description: The cake description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cake'
 *       404:
 *         description: The cake was not found
 */
router.get('/:id', cakesController.getCakeById);

/**
 * @swagger
 * /cake:
 *   post:
 *     summary: Create a new cake
 *     tags: [Cakes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cake'
 *     responses:
 *       201:
 *         description: The cake was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cake'
 *       400:
 *         description: Validation error
 */
router.post('/', cakesController.createCake);

/**
 * @swagger
 * /cake/{id}:
 *   patch:
 *     summary: Update the cake by the id
 *     tags: [Cakes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cake id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cake'
 *     responses:
 *       200:
 *         description: The cake was updated
 *       404:
 *         description: The cake was not found
 *       400:
 *         description: Validation error
 */
router.patch('/:id', cakesController.updateCake);

/**
 * @swagger
 * /cake/{id}:
 *   delete:
 *     summary: Remove the cake by id
 *     tags: [Cakes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cake id
 *     responses:
 *       200:
 *         description: The cake was deleted
 *       404:
 *         description: The cake was not found
 */
router.delete('/:id', cakesController.deleteCake);

export default router;
