import api from './apiClient.js';

const baseURL = "/api/ieps"

export const getAllIeps = ()=>{
     return api.get(`${baseURL}`);
}
export const getIepBySId = (studentId) => {
  return api.get(`${baseURL}`, 
    {
        params: { studentId }   
    }
  );
};

export const getByiepId = (id) => {
  return api.get(`${baseURL}/${id}`);
};

export const addIepRecord = (
    student_name,
    start_date,
    end_date,
    meeting_time,
    meeting_link,
    status) => {
  return api.post(`${baseURL}`,{
    student_name,
    start_date,
    end_date,
    meeting_time,
    meeting_link,
    status});
};

export const editIepRecord = (
    id,
    student_id,
    case_manager_user_id,
    start_date,
    end_date,
    meeting_time, 
  
) => {
    return api.patch(`${baseURL}/${id}`,{
        student_id,
        case_manager_user_id,
        start_date,
        end_date,
        meeting_time, 

    });
  };

  export const addIepStatus = (id,status) => {
    return api.post(`${baseURL}/${id}/status`,{status});
  };