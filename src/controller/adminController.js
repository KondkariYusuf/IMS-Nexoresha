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
        console.log(req.params.id);

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
}

export default new AdminController();