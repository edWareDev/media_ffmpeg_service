import { createJob } from '../jobs/CreateJob.js';

export const createMetadataJob = async (mediaId) => createJob({
    type: 'media.extractMetadata',
    mediaId,
    options: {}
});
