import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form';
import AddACourse from './AdminForms/AddACourse';
import { useApi } from '../../hooks/useApi';

const AdminPanelNcaaaManagement = () => {
    const [isAddaCourseOpen, SetisAddaCourseOpen] = useState(false)
    let api = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Add a Course <
    // Delete a course

    // Add CLOS for a particular course
    // get CLOS for a particular course
    // remove CLOS
    // update CLOS


    return (
        <div className='sm:ml-64 border-t-4 border-green-700'>
            <AddACourse />
        </div>
    )
}

export default AdminPanelNcaaaManagement