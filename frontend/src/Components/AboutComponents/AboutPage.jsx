import React from 'react'
import { useApi } from '../../hooks/useApi'
import { useContext, useEffect, useState } from 'react'
import { useResearch } from '../../hooks/useResearch'

const AboutPage = () => {
    let api = useApi();

    return (
        <div className='RESEARCHES flex flex-col gap-2.4'>
            <h1 className='text-2xl text-green-700'>Researches</h1>
        </div>
    )
}

export default AboutPage
