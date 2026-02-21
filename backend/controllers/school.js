
import {pool} from '../config/database.js'

export const getAllSchools = async(req, res)=>{

    try{
        const result = await pool.query(
            `SELECT * FROM schools`
        )
        if(result.rows.length === 0){
            return res.status(404).json('No schools found')

        }
        return res.status(200).json(result.rows)

    }catch(err){
        console.error(err);
        return res.status(500).json('Server error')
    }

}

