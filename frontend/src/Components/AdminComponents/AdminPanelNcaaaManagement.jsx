import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form';
import { useApi } from '../../hooks/useApi';

const AdminPanelNcaaaManagement = () => {
    const [isAddaCourseOpen, SetisAddaCourseOpen] = useState(false);
    let api = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <div className='sm:ml-64 border-t-4 border-green-700'>
            
        </div>
    )
}

export default AdminPanelNcaaaManagement