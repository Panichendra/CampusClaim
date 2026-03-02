import Item from '../models/Item.js';
import fs from 'fs';
import path from 'path';

// @desc    Report a new item (Lost or Found)
// @route   POST /api/items/report
// @access  Private
export const reportItem = async (req, res) => {
  try {
    // taking all the values from report form
    const { itemName, description, category, itemStatus, location, dateLost, color, contactPhone } = req.body;

    // Validate required fields
    if (!itemName || !description || !category || !itemStatus || !location || !dateLost || !contactPhone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`); // pushing the image path into image array from upload folder
      });
    }
    //only paths of the pics are stored in the image array before sending it into the database

    const item = await Item.create({ //creating a new item record with item schema in the database
      itemName,
      description,
      category,
      itemStatus,
      location,
      dateLost: new Date(dateLost), // converting to Date format before storing
      color,
      contactPhone,
      images,
      user: req.user.id,
    });

    res.status(201).json({ // send status if the item is successfully uploaded into the database
      success: true,
      message: 'Item reported successfully!',
      data: item
    });
  } catch (error) {
    // Clean up uploaded files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all active items
// @route   GET /api/items
// @access  Public

// this end point will help to retain all the unresolved items which is used in the browse items section
export const getItems = async (req, res) => {
  try {
    const items = await Item.find({ isResolved: false }) 
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email'); 
    // find() will give only the item details but we used ref in the user field in the schema so .populate() will help to retrive the data of that user
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' }); //if item is not found then return 404 error
    }
    res.json(item); // return the found item
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create item (old endpoint - kept for compatibility)
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const { itemName, description, category, itemStatus, location, dateLost, color, contactPhone } = req.body;

    const item = await Item.create({
      itemName,
      description,
      category,
      itemStatus,
      location,
      dateLost,
      color,
      contactPhone,
      user: req.user.id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// @desc    Get items reported by the logged-in user
// @route   GET /api/items/myitems
// @access  Private
export const getMyItems = async (req, res) => {
  try {
    // Finds items where the 'user' field matches the ID of the logged-in student
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Resolve an item
// @route   DELETE /api/items/:id
// @access  Private (only owner can delete)
export const deleteItem = async (req, res) => { //end point created to delete item when they get resolved
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user owns this item to ensure that other cant delete that item
    if (item.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Mark item as resolved instead of deleting it
    if (item.isResolved) {
      return res.json({ success: true, message: 'Item is already resolved', data: item });
    }

    item.isResolved = true;
    await item.save();

    res.json({ success: true, message: 'Item marked as resolved', data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};