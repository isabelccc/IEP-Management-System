import api from './apiClient.js';

const baseURL = "/api/students"

export const getStudents = () => {
    return api.get(`${baseURL}`
    );
};
export const getStudentById = (id) => {
    return api.get(`${baseURL}/${id}`
    );
};
export const AddStudent= (
    school_name,
    student_number,
    first_name,
    last_name,
    date_of_birth,
    grade_level,
    guardian_contact) => {
    return api.post(`${baseURL}`,{
        school_name,
            student_number,
            first_name,
            last_name,
            date_of_birth,
            grade_level,
            guardian_contact
    }
    );
};
export const updateStudentById = (id) => {
    return api.patch(`${baseURL}/${id}`
    );
};

export const deleteStudentById = (id)=>{
    return api.delete(`${baseURL}/${id}`)
}