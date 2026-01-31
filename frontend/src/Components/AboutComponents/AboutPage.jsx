import React from 'react'
import { useApi } from '../../hooks/useApi'
import { useContext, useEffect, useState } from 'react'
import { useResearch } from '../../hooks/useResearch'
import UnderConstruction from '../UtilitiesComponents/UnderConstruction'

const AboutPage = () => {
    let api = useApi();

    return (
        <div className='RESEARCHES flex flex-col gap-2.4'>
            <UnderConstruction />
        </div>
    )
}

export default AboutPage
