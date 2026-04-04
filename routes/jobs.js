const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { title, company, description, jobType, postedBy } = req.body;
    const newJob = new Job({ title, company, description, jobType, postedBy });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs/sync (MOCK API SYNC)
// @desc    Inject a batch of industry jobs instantly
router.post('/sync', async (req, res) => {
  try {
    const jobsToSync = req.body.jobs;

    if (!jobsToSync || !Array.isArray(jobsToSync)) {
      return res.status(400).json({ message: 'Invalid data format.' });
    }

    const defaultPostedBy = '65e4a3b2c1f8d900123abcde';
    const normalizedJobs = jobsToSync.map((job) => ({
      ...job,
      postedBy: job.postedBy || defaultPostedBy,
    }));

    const insertedJobs = await Job.insertMany(normalizedJobs);

    res.status(201).json({
      message: `Successfully synced ${insertedJobs.length} live jobs!`,
      insertedJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

