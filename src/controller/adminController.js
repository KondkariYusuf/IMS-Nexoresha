import adminService from '../service/adminService.js';

class AdminController {
    async createStudent(req, res, next) {
        try {
            const result = await adminService.createStudent(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getStudents(req, res, next) {
        try {
            const result = await adminService.getStudents();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async getStudentById(req, res, next) {


        try {
            const result = await adminService.getStudentById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async updateStudent(req, res, next) {
        try {
            const result = await adminService.updateStudent(
                req.params.id,
                req.body,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async updateStudentStatus(req, res, next) {
        try {
            const result = await adminService.updateStudentStatus(
                req.params.id,
                req.body.profileStatus,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async moveStudentToBatch(req, res, next) {
        try {
            const result = await adminService.moveStudentToBatch(
                req.params.id,
                req.body.batchId,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async createBatch(req, res, next) {
        try {
            const result = await adminService.createBatch(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }
    async getBatches(req, res, next) {
        try {
            const result = await adminService.getBatches();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async getBatchById(req, res, next) {
        try {
            const result = await adminService.getBatchById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async updateBatch(req, res, next) {
        try {
            const result = await adminService.updateBatch(
                req.params.id,
                req.body,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async deleteBatch(req, res, next) {
        try {
            const result = await adminService.deleteBatch(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async updateBatchStatus(req, res, next) {
        try {
            const result = await adminService.updateBatchStatus(
                req.params.id,
                req.body.status,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async closeBatch(req, res, next) {
        try {
            const result = await adminService.closeBatch(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async generateRecruiterLink(req, res, next) {
        try {
            const result = await adminService.generateRecruiterLink(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    async revokeRecruiterLink(req, res, next) {
        try {
            const result = await adminService.revokeRecruiterLink(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();