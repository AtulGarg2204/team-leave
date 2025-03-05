const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all leaves (admin sees all, users see only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let leaves;
    
    if (req.user.role === 'admin') {
      leaves = await Leave.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 }); // Optional: sort by creation date
    } else {
      leaves = await Leave.find({ user: req.user.userId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    }
    
    // Add a check to ensure user data is present
    const sanitizedLeaves = leaves.map(leave => ({
      ...leave.toObject(),
      user: leave.user || { name: 'Unknown User', email: 'No email' }
    }));
    
    res.json(sanitizedLeaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leave by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('user', 'name email');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // Only allow admins or the user themselves to access their leave data
    if (req.user.role !== 'admin' && req.user.userId !== leave.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for leave
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // Adjust for half day if applicable
    if (leaveType === 'half') {
      diffDays = diffDays / 2;
    }
    
    // Check if user has enough leaves
    const user = await User.findById(req.user.userId);
    if (user.remainingLeaves < diffDays) {
      return res.status(400).json({ message: 'Not enough leave balance' });
    }
    
    // Create leave request
    const leave = new Leave({
      user: req.user.userId,
      startDate,
      endDate,
      leaveType,
      reason,
      numberOfDays: diffDays,
      status: 'pending'
    });
    
    await leave.save();
    
    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update leave status (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    const oldStatus = leave.status;
    leave.status = status;
    
    // If approving a previously pending leave, deduct from user's remaining leaves
    if (status === 'approved' && oldStatus === 'pending') {
      const user = await User.findById(leave.user);
      user.remainingLeaves -= leave.numberOfDays;
      await user.save();
    }
    
    // If rejecting a previously approved leave, add back to user's remaining leaves
    if (status === 'rejected' && oldStatus === 'approved') {
      const user = await User.findById(leave.user);
      user.remainingLeaves += leave.numberOfDays;
      await user.save();
    }
    
    await leave.save();
    
    res.json({
      message: 'Leave status updated successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete leave (admin or the user who applied)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // Only allow admins or the user themselves to delete their leave
    if (req.user.role !== 'admin' && req.user.userId !== leave.user.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // If deleting an approved leave, add back to user's remaining leaves
    if (leave.status === 'approved') {
      const user = await User.findById(leave.user);
      user.remainingLeaves += leave.numberOfDays;
      await user.save();
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 