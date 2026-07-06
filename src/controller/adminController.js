import adminService from '../service/adminService.js';
function sendSuccess(res, statusCode, result) {
    const { message, ...data } = result;

    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
}

class AdminController {
    async createStudent(req, res, next) {
        try {
            const result = await adminService.createStudent(req.body);
            sendSuccess(res, 201, result);
        } catch (error) {
            next(error);
        }
    }
    async bulkCreateStudents(req, res, next) {
        try {
            const result = await adminService.bulkCreateStudents(req.body.students);
            sendSuccess(res, 201, result);
        } catch (error) {
            next(error);
        }
    }

    async getStudents(req, res, next) {
        try {
            const result = await adminService.getStudents(req.query);
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async getStudentById(req, res, next) {


        try {
            const result = await adminService.getStudentById(req.params.id);
            sendSuccess(res, 200, result);
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

            sendSuccess(res, 200, result);
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

            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async moveStudentToBatch(req, res, next) {
        try {
            const result = await adminService.moveStudentToBatch(
                req.params.id,
                req.body.newBatchId,
            );

            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async createBatch(req, res, next) {
        try {
            const result = await adminService.createBatch(req.body);
            sendSuccess(res, 201, result);
        } catch (error) {
            next(error);
        }
    }
    async getBatches(req, res, next) {
        try {
            const result = await adminService.getBatches();
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async getBatchById(req, res, next) {
        try {
            const result = await adminService.getBatchById(req.params.id);
            sendSuccess(res, 200, result);
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

            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async closeBatch(req, res, next) {
        try {
            const result = await adminService.closeBatch(req.params.id);
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async generateRecruiterLink(req, res, next) {
        try {
            const result = await adminService.generateRecruiterLink(req.params.id, req.user.id);
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async revokeRecruiterLink(req, res, next) {
        try {
            await adminService.revokeRecruiterLink(
                req.params.id,
                req.user.id,
            );

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    async getBatchConfig(req, res, next) {
        try {
            const result = await adminService.getBatchConfig(req.params.batchId);
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async updateBatchConfig(req, res, next) {
        try {
            const result = await adminService.updateBatchConfig(
                req.params.batchId,
                req.body,
                req.user.id,
            );

            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const result = await adminService.getDashboard();
            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
    async assignTeachersToBatch(req, res, next) {
        try {
            const result = await adminService.assignTeachersToBatch(
                req.params.id,
                req.body.teacherIds,
            );

            sendSuccess(res, 200, result);
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();