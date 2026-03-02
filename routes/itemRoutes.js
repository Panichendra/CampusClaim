import express from 'express';
const router = express.Router();
import { createItem, getItems, getItem, reportItem, getMyItems, deleteItem } from '../controllers/itemController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

// Public routes - GET all items
router.route('/').get(getItems);

// Protected routes - More specific routes BEFORE /:id
router.route('/myitems').get(protect, getMyItems);

// report items sent with array of 5 images and it is handled by reportitem api in itemcontroller
// it also goes through protect(authMiddleware) to verify the JWT
router.route('/report').post(protect, upload.array('images', 5), reportItem); // upload.array() ny multer in upload middleware will handle multiple file uploads 

// POST to create item  // this end point is created to handle simple item creation with no image uploads
router.route('/').post(protect, createItem); 

// Dynamic route - GET single item by ID (MOST GENERAL - GOES LAST)
router.route('/:id').get(getItem).delete(protect, deleteItem); // it handles both get and delete operations according to the request type sent from the frontend
//.get(getitem) will return all the unresolved items and .delete() will help to delete one item from that list

export default router;